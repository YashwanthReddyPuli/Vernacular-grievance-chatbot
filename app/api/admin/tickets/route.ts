import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CATEGORY_DEFINITIONS } from '@/lib/categories';

export async function GET() {
  try {
    // 1. Try relational query first
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

    if (!ticketsErr && tickets && tickets.length > 0) {
      return NextResponse.json({
        success: true,
        tickets: tickets,
      });
    }

    // 2. Fallback query on tickets table alone if join or empty
    const { data: rawTickets, error: fallbackErr } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (fallbackErr) {
      console.warn('Fallback tickets query warning:', fallbackErr);
      return NextResponse.json({ success: true, tickets: [] });
    }

    // Map categories metadata manually if relational join was absent
    const processedTickets = (rawTickets || []).map((t) => {
      const summary = t.structured_summary || {};
      const matchedCategory = Object.values(CATEGORY_DEFINITIONS).find(
        (def) => def.name.toLowerCase() === (t.category_id || '').toLowerCase()
      );

      return {
        ...t,
        grievances: {
          raw_text: summary.issue_summary || 'Submitted Grievance',
          location_hint: summary.location || 'Not specified',
        },
        categories: {
          name: matchedCategory ? matchedCategory.name : 'General',
          department: matchedCategory ? matchedCategory.department : 'Municipal Department',
        },
      };
    });

    return NextResponse.json({
      success: true,
      tickets: processedTickets,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch tickets';
    console.error('Error fetching tickets:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
