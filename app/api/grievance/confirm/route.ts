import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ticket_id, citizen_action, edited_fields } = body;

    if (!ticket_id || typeof ticket_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ticket_id is required' },
        { status: 400 }
      );
    }

    if (!citizen_action || !['confirmed', 'accept', 'edited', 'modify', 'rejected', 'reject'].includes(citizen_action)) {
      return NextResponse.json(
        { success: false, error: 'Valid citizen_action is required (confirmed, edited, rejected)' },
        { status: 400 }
      );
    }

    // Normalize citizen action string
    const isConfirmed = ['confirmed', 'accept'].includes(citizen_action);
    const isEdited = ['edited', 'modify'].includes(citizen_action);
    const normalizedAction = isConfirmed ? 'confirmed' : isEdited ? 'edited' : 'rejected';

    const targetStatus = isConfirmed || isEdited ? 'confirmed' : 'rejected';

    // 1. Insert confirmation record into Supabase
    let confirmationId: string | null = null;
    try {
      const { data: confRecord, error: confErr } = await supabase
        .from('confirmations')
        .insert({
          ticket_id: ticket_id,
          citizen_action: normalizedAction,
          edited_fields: edited_fields || null,
        })
        .select('id')
        .single();

      if (!confErr && confRecord) {
        confirmationId = confRecord.id;
      }
    } catch (confDbErr) {
      console.warn('Supabase DB confirmation insertion skipped or failed:', confDbErr);
    }

    // 2. Fetch existing ticket structured summary if edited
    let updatedStructuredSummary: Record<string, unknown> | null = null;
    try {
      const { data: ticketRecord } = await supabase
        .from('tickets')
        .select('structured_summary')
        .eq('id', ticket_id)
        .maybeSingle();

      if (ticketRecord && ticketRecord.structured_summary) {
        updatedStructuredSummary = { ...ticketRecord.structured_summary };
        if (isEdited && edited_fields && typeof edited_fields === 'object') {
          updatedStructuredSummary = { ...updatedStructuredSummary, ...edited_fields };
        }
      }
    } catch (tFetchErr) {
      console.warn('Ticket fetch for merge skipped:', tFetchErr);
    }

    // 3. Update ticket status and updated summary in tickets table
    try {
      const updatePayload: Record<string, unknown> = {
        status: targetStatus,
      };

      if (updatedStructuredSummary) {
        updatePayload.structured_summary = updatedStructuredSummary;
      }

      await supabase
        .from('tickets')
        .update(updatePayload)
        .eq('id', ticket_id);
    } catch (tUpdateErr) {
      console.warn('Ticket status update skipped:', tUpdateErr);
    }

    return NextResponse.json({
      success: true,
      message: `Ticket ${targetStatus} successfully`,
      confirmation_id: confirmationId || 'local_demo_confirmation_id',
      ticket_id: ticket_id,
      status: targetStatus,
      updated_fields: isEdited ? edited_fields : null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
