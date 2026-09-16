import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: tickets, error: ticketsErr } = await supabase
      .from('tickets')
      .select(`
        id,
        grievance_id,
        category_id,
        structured_summary,
        classification_method,
        confidence,
        matched_keywords,
        reasoning,
        status,
        created_at,
        grievances (
          raw_text,
          location_hint,
          citizen_contact,
          created_at
        ),
        categories (
          name,
          department
        )
      `)
      .order('created_at', { ascending: false });

    if (ticketsErr) {
      console.warn('Supabase tickets query warning:', ticketsErr);
      return NextResponse.json({ success: true, tickets: [] });
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch tickets';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
