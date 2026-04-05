import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const project_id = searchParams.get('project_id');
    const contact_id = searchParams.get('contact_id');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('invoices')
      .select(
        `
        *,
        contacts(id, first_name, last_name, company_name, email),
        projects(id, name, project_number)
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null);

    if (search) {
      query = query.or(
        `invoice_number.eq.${parseInt(search, 10) || 0},notes.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (contact_id) {
      query = query.eq('contact_id', contact_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const ascending = order === 'asc';
    query = query.order(sort, { ascending }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

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
    console.error('GET /api/invoices error:', err);
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

    const { line_items, ...invoiceData } = body;

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 }
      );
    }

    if (line_items && Array.isArray(line_items) && line_items.length > 0) {
      const lineItemsWithInvoiceId = line_items.map(
        (item: Record<string, unknown>, index: number) => ({
          ...item,
          invoice_id: invoice.id,
          display_order: index,
        })
      );

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsWithInvoiceId);

      if (lineItemsError) {
        return NextResponse.json(
          { error: lineItemsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (err) {
    console.error('POST /api/invoices error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
