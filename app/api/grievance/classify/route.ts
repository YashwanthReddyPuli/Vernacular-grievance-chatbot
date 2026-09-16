import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { classifyGrievance } from '@/lib/classifier';

/**
 * Sanitizes user input string by stripping HTML tags and control characters
 */
function sanitizeInput(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { raw_text, citizen_contact, location_hint } = body;

    // 1. Input Validation: reject empty / non-string
    if (!raw_text || typeof raw_text !== 'string' || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide valid, non-empty grievance text.' },
        { status: 400 }
      );
    }

    const sanitizedRawText = sanitizeInput(raw_text);

    if (sanitizedRawText.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Grievance text contains invalid characters.' },
        { status: 400 }
      );
    }

    // Cap max length at 3000 characters
    const cleanRawText = sanitizedRawText.substring(0, 3000);
    const cleanContact = citizen_contact && typeof citizen_contact === 'string'
      ? sanitizeInput(citizen_contact).substring(0, 200)
      : null;
    const cleanLocation = location_hint && typeof location_hint === 'string'
      ? sanitizeInput(location_hint).substring(0, 300)
      : null;

    // 2. Insert record into grievances table
    let grievanceId: string | null = null;
    try {
      const { data: grievanceRecord, error: grievanceErr } = await supabase
        .from('grievances')
        .insert({
          raw_text: cleanRawText,
          citizen_contact: cleanContact,
          location_hint: cleanLocation,
          status: 'pending',
        })
        .select('id')
        .single();

      if (!grievanceErr && grievanceRecord) {
        grievanceId = grievanceRecord.id;
      }
    } catch (dbErr) {
      console.warn('Supabase DB grievance insert skipped or failed:', dbErr);
    }

    // 3. Run the Classification Engine
    const classificationResult = await classifyGrievance(cleanRawText, cleanLocation || undefined);

    // 4. Resolve category_id from categories table
    let categoryId: string | null = null;
    try {
      const { data: catRecord } = await supabase
        .from('categories')
        .select('id')
        .eq('name', classificationResult.classification.category)
        .maybeSingle();

      if (catRecord) {
        categoryId = catRecord.id;
      }
    } catch (catErr) {
      console.warn('Category ID lookup skipped:', catErr);
    }

    // 5. Insert draft ticket into tickets table
    let ticketId: string | null = null;
    if (grievanceId) {
      try {
        const { data: ticketRecord, error: ticketErr } = await supabase
          .from('tickets')
          .insert({
            grievance_id: grievanceId,
            category_id: categoryId,
            structured_summary: classificationResult.structured_ticket,
            classification_method: classificationResult.classification.method,
            confidence: classificationResult.classification.confidence,
            matched_keywords: classificationResult.classification.matched_keywords,
            reasoning: classificationResult.classification.reasoning,
            status: 'draft',
          })
          .select('id')
          .single();

        if (!ticketErr && ticketRecord) {
          ticketId = ticketRecord.id;
        }
      } catch (tErr) {
        console.warn('Supabase DB ticket insert skipped or failed:', tErr);
      }
    }

    // 6. Return response payload
    return NextResponse.json({
      success: true,
      message: 'Grievance classified successfully',
      grievance_id: grievanceId || 'local_demo_grievance_id',
      ticket_id: ticketId || 'local_demo_ticket_id',
      classification: classificationResult.classification,
      structured_ticket: classificationResult.structured_ticket,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
