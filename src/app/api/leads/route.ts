import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const temperature = searchParams.get('temperature');
    const assigned_to = searchParams.get('assigned_to');
    const stage_id = searchParams.get('stage_id');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch leads with their current stage from lead_stage_history
    let query = supabase
      .from('contacts')
      .select(
        `
        *,
        lead_stage_history!inner(
          id,
          stage_id,
          entered_at,
          exited_at,
          lead_pipeline_stages(
            id,
            name,
            display_order,
            color,
            is_won_stage,
            is_lost_stage
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('type', 'lead')
      .is('deleted_at', null)
      .is('lead_stage_history.exited_at', null); // current stage only

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (temperature) {
      query = query.eq('lead_temperature', temperature);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    if (stage_id) {
      query = query.eq('lead_stage_history.stage_id', stage_id);
    }

    query = query.order(sort, { ascending: order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { contact, stage_id } = body;

    // Create the contact as a lead
    const { data: newContact, error: contactError } = await supabase
      .from('contacts')
      .insert({ ...contact, type: 'lead' })
      .select()
      .single();

    if (contactError) {
      return NextResponse.json(
        { error: contactError.message },
        { status: 400 }
      );
    }

    // Create initial stage history entry
    if (stage_id && newContact) {
      const { error: stageError } = await supabase
        .from('lead_stage_history')
        .insert({
          contact_id: newContact.id,
          stage_id,
          entered_at: new Date().toISOString(),
        });

      if (stageError) {
        return NextResponse.json(
          { error: stageError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ data: newContact }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
