import { NextRequest, NextResponse } from 'next/server';
import type {
  Estimate,
  EstimateSection,
  EstimateLineItem,
  EstimateStatus,
  ContractType,
} from '@/lib/types';

// ============================================================================
// Mock Data
// ============================================================================

const mockEstimates: (Estimate & {
  sections: (EstimateSection & { line_items: EstimateLineItem[] })[];
  client_name: string;
})[] = [
  {
    id: 'est-001',
    organization_id: 'org-1',
    project_id: 'proj-001',
    contact_id: 'contact-001',
    estimate_number: 1001,
    name: 'Johnson Kitchen Remodel',
    description: 'Full kitchen remodel including cabinets, countertops, and appliances',
    status: 'approved',
    version: 1,
    parent_estimate_id: null,
    valid_until: '2026-05-15',
    contract_type: 'fixed_price',
    subtotal: 4250000,
    tax_amount: 340000,
    total: 4590000,
    markup_percentage: 2000,
    profit_margin: 1800,
    notes: 'Client prefers quartz countertops.',
    terms_and_conditions: 'Net 30. 50% deposit required.',
    sent_at: '2026-03-20T10:00:00Z',
    viewed_at: '2026-03-20T14:30:00Z',
    approved_at: '2026-03-22T09:15:00Z',
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-03-18T08:00:00Z',
    updated_at: '2026-03-22T09:15:00Z',
    deleted_at: null,
    client_name: 'Robert Johnson',
    sections: [
      {
        id: 'sec-001',
        estimate_id: 'est-001',
        name: 'Demolition',
        description: 'Remove existing kitchen',
        display_order: 1,
        is_optional: false,
        subtotal: 450000,
        created_at: '2026-03-18T08:00:00Z',
        updated_at: '2026-03-18T08:00:00Z',
        deleted_at: null,
        line_items: [
          {
            id: 'li-001',
            section_id: 'sec-001',
            cost_catalog_id: null,
            description: 'Cabinet removal and disposal',
            quantity: 1,
            unit_of_measure: 'lump_sum',
            unit_cost: 250000,
            markup_percentage: 2000,
            total_cost: 300000,
            display_order: 1,
            is_visible_to_client: true,
            notes: null,
            created_at: '2026-03-18T08:00:00Z',
            updated_at: '2026-03-18T08:00:00Z',
            deleted_at: null,
          },
          {
            id: 'li-002',
            section_id: 'sec-001',
            cost_catalog_id: null,
            description: 'Flooring removal',
            quantity: 200,
            unit_of_measure: 'sqft',
            unit_cost: 75,
            markup_percentage: 2000,
            total_cost: 18000,
            display_order: 2,
            is_visible_to_client: true,
            notes: null,
            created_at: '2026-03-18T08:00:00Z',
            updated_at: '2026-03-18T08:00:00Z',
            deleted_at: null,
          },
        ],
      },
      {
        id: 'sec-002',
        estimate_id: 'est-001',
        name: 'Cabinetry',
        description: 'Custom cabinet installation',
        display_order: 2,
        is_optional: false,
        subtotal: 1800000,
        created_at: '2026-03-18T08:00:00Z',
        updated_at: '2026-03-18T08:00:00Z',
        deleted_at: null,
        line_items: [
          {
            id: 'li-003',
            section_id: 'sec-002',
            cost_catalog_id: 'cc-001',
            description: 'Shaker-style base cabinets',
            quantity: 12,
            unit_of_measure: 'lnft',
            unit_cost: 85000,
            markup_percentage: 2000,
            total_cost: 1224000,
            display_order: 1,
            is_visible_to_client: true,
            notes: 'White painted finish',
            created_at: '2026-03-18T08:00:00Z',
            updated_at: '2026-03-18T08:00:00Z',
            deleted_at: null,
          },
          {
            id: 'li-004',
            section_id: 'sec-002',
            cost_catalog_id: null,
            description: 'Wall cabinets',
            quantity: 8,
            unit_of_measure: 'lnft',
            unit_cost: 72000,
            markup_percentage: 2000,
            total_cost: 691200,
            display_order: 2,
            is_visible_to_client: true,
            notes: null,
            created_at: '2026-03-18T08:00:00Z',
            updated_at: '2026-03-18T08:00:00Z',
            deleted_at: null,
          },
        ],
      },
    ],
  },
  {
    id: 'est-002',
    organization_id: 'org-1',
    project_id: null,
    contact_id: 'contact-002',
    estimate_number: 1002,
    name: 'Martinez Bathroom Renovation',
    description: 'Master bathroom full renovation',
    status: 'sent',
    version: 1,
    parent_estimate_id: null,
    valid_until: '2026-05-01',
    contract_type: 'fixed_price',
    subtotal: 2850000,
    tax_amount: 228000,
    total: 3078000,
    markup_percentage: 2500,
    profit_margin: 2200,
    notes: null,
    terms_and_conditions: 'Net 30',
    sent_at: '2026-03-28T14:00:00Z',
    viewed_at: null,
    approved_at: null,
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-03-25T10:00:00Z',
    updated_at: '2026-03-28T14:00:00Z',
    deleted_at: null,
    client_name: 'Maria Martinez',
    sections: [],
  },
  {
    id: 'est-003',
    organization_id: 'org-1',
    project_id: null,
    contact_id: 'contact-003',
    estimate_number: 1003,
    name: 'Thompson Deck Construction',
    description: 'New composite deck with railing',
    status: 'draft',
    version: 1,
    parent_estimate_id: null,
    valid_until: '2026-06-01',
    contract_type: 'fixed_price',
    subtotal: 1875000,
    tax_amount: 150000,
    total: 2025000,
    markup_percentage: 2000,
    profit_margin: 1700,
    notes: 'Trex composite decking, client chose Saddle color.',
    terms_and_conditions: null,
    sent_at: null,
    viewed_at: null,
    approved_at: null,
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
    deleted_at: null,
    client_name: 'James Thompson',
    sections: [],
  },
  {
    id: 'est-004',
    organization_id: 'org-1',
    project_id: 'proj-002',
    contact_id: 'contact-004',
    estimate_number: 1004,
    name: 'Williams Basement Finishing',
    description: 'Full basement finish with bedroom, bathroom, and living area',
    status: 'viewed',
    version: 2,
    parent_estimate_id: null,
    valid_until: '2026-05-20',
    contract_type: 'cost_plus',
    subtotal: 6500000,
    tax_amount: 520000,
    total: 7020000,
    markup_percentage: 1500,
    profit_margin: 1300,
    notes: null,
    terms_and_conditions: 'Net 30. Progress payments every 2 weeks.',
    sent_at: '2026-03-30T11:00:00Z',
    viewed_at: '2026-03-31T08:45:00Z',
    approved_at: null,
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-03-15T14:00:00Z',
    updated_at: '2026-03-31T08:45:00Z',
    deleted_at: null,
    client_name: 'David Williams',
    sections: [],
  },
  {
    id: 'est-005',
    organization_id: 'org-1',
    project_id: null,
    contact_id: 'contact-005',
    estimate_number: 1005,
    name: 'Chen Whole-House Electrical',
    description: 'Whole-house electrical panel upgrade and rewiring',
    status: 'rejected',
    version: 1,
    parent_estimate_id: null,
    valid_until: '2026-04-15',
    contract_type: 'time_and_material',
    subtotal: 1200000,
    tax_amount: 96000,
    total: 1296000,
    markup_percentage: 2000,
    profit_margin: 1500,
    notes: 'Client decided to go with another contractor.',
    terms_and_conditions: 'Net 15',
    sent_at: '2026-03-10T09:00:00Z',
    viewed_at: '2026-03-10T16:00:00Z',
    approved_at: null,
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-03-08T11:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    deleted_at: null,
    client_name: 'Linda Chen',
    sections: [],
  },
  {
    id: 'est-006',
    organization_id: 'org-1',
    project_id: null,
    contact_id: 'contact-006',
    estimate_number: 1006,
    name: 'Patel Roof Replacement',
    description: 'Complete roof tear-off and replacement with architectural shingles',
    status: 'expired',
    version: 1,
    parent_estimate_id: null,
    valid_until: '2026-03-01',
    contract_type: 'fixed_price',
    subtotal: 1650000,
    tax_amount: 132000,
    total: 1782000,
    markup_percentage: 2000,
    profit_margin: 1600,
    notes: null,
    terms_and_conditions: 'Net 30',
    sent_at: '2026-02-01T10:00:00Z',
    viewed_at: '2026-02-02T09:00:00Z',
    approved_at: null,
    approved_signature_url: null,
    pdf_url: null,
    created_at: '2026-01-28T08:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    deleted_at: null,
    client_name: 'Ravi Patel',
    sections: [],
  },
];

// ============================================================================
// GET /api/estimates
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const contactId = searchParams.get('contact_id');
  const projectId = searchParams.get('project_id');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  let filtered = [...mockEstimates];

  if (status && status !== 'all') {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (contactId) {
    filtered = filtered.filter((e) => e.contact_id === contactId);
  }
  if (projectId) {
    filtered = filtered.filter((e) => e.project_id === projectId);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.client_name.toLowerCase().includes(q) ||
        String(e.estimate_number).includes(q)
    );
  }

  filtered.sort((a, b) => {
    const aVal = a[sort as keyof typeof a];
    const bVal = b[sort as keyof typeof b];
    const aStr = String(aVal ?? '');
    const bStr = String(bVal ?? '');
    return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  return NextResponse.json({
    data: filtered,
    count: filtered.length,
  });
}

// ============================================================================
// POST /api/estimates
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newEstimate = {
      id: `est-${Date.now()}`,
      organization_id: 'org-1',
      project_id: body.project_id || null,
      contact_id: body.contact_id,
      estimate_number: 1007,
      name: body.name,
      description: body.description || null,
      status: 'draft' as EstimateStatus,
      version: 1,
      parent_estimate_id: null,
      valid_until: body.valid_until || null,
      contract_type: (body.contract_type as ContractType) || 'fixed_price',
      subtotal: body.subtotal || 0,
      tax_amount: body.tax_amount || 0,
      total: body.total || 0,
      markup_percentage: body.markup_percentage || 2000,
      profit_margin: 0,
      notes: body.notes || null,
      terms_and_conditions: body.terms_and_conditions || null,
      sent_at: null,
      viewed_at: null,
      approved_at: null,
      approved_signature_url: null,
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      sections: body.sections || [],
      client_name: body.client_name || 'New Client',
    };

    return NextResponse.json({ data: newEstimate }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
