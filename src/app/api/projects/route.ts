import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const assigned_pm = searchParams.get('assigned_pm');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('projects')
      .select('*, contacts(id, first_name, last_name, company_name, email, phone)', {
        count: 'exact',
      })
      .is('deleted_at', null);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,project_number::text.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_pm) {
      query = query.eq('assigned_pm', assigned_pm);
    }

    const ascending = order === 'asc';
    query = query.order(sort, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      count: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/projects error:', err);
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

    const { data, error } = await supabase
      .from('projects')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
