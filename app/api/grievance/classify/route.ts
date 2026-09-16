import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { classifyGrievance } from '@/lib/classifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { raw_text, citizen_contact, location_hint } = body;

    if (!raw_text || typeof raw_text !== 'string' || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'raw_text is required' },
        { status: 400 }
      );
    }

    const cleanRawText = raw_text.trim();
    const cleanContact = citizen_contact ? String(citizen_contact).trim() : null;
    const cleanLocation = location_hint ? String(location_hint).trim() : null;

    // 1. Insert row into grievances table
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
      console.warn('Supabase DB insertion for grievance skipped or failed:', dbErr);
    }

    // 2. Run the Classification Engine (Stage 1 + Stage 2)
    const classificationResult = await classifyGrievance(cleanRawText, cleanLocation || undefined);

    // 3. Resolve category_id from categories table
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

    // 4. Insert draft ticket into tickets table
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
        console.warn('Supabase DB insertion for ticket skipped or failed:', tErr);
      }
    }

    // 5. Return standardized payload
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
