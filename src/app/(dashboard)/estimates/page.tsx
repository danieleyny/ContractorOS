'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { EstimateStatus, ContractType } from '@/lib/types';

// ============================================================================
// Mock Data
// ============================================================================

interface EstimateRow {
  id: string;
  estimate_number: number;
  name: string;
  client_name: string;
  status: EstimateStatus;
  contract_type: ContractType;
  total: number; // cents
  created_at: string;
  valid_until: string | null;
}

const MOCK_ESTIMATES: EstimateRow[] = [
  {
    id: 'est-001',
    estimate_number: 1001,
    name: 'Johnson Kitchen Remodel',
    client_name: 'Robert Johnson',
    status: 'approved',
    contract_type: 'fixed_price',
    total: 4590000,
    created_at: '2026-03-18T08:00:00Z',
    valid_until: '2026-05-15',
  },
  {
    id: 'est-002',
    estimate_number: 1002,
    name: 'Martinez Bathroom Renovation',
    client_name: 'Maria Martinez',
    status: 'sent',
    contract_type: 'fixed_price',
    total: 3078000,
    created_at: '2026-03-25T10:00:00Z',
    valid_until: '2026-05-01',
  },
  {
    id: 'est-003',
    estimate_number: 1003,
    name: 'Thompson Deck Construction',
    client_name: 'James Thompson',
    status: 'draft',
    contract_type: 'fixed_price',
    total: 2025000,
    created_at: '2026-04-01T09:00:00Z',
    valid_until: '2026-06-01',
  },
  {
    id: 'est-004',
    estimate_number: 1004,
    name: 'Williams Basement Finishing',
    client_name: 'David Williams',
    status: 'viewed',
    contract_type: 'cost_plus',
    total: 7020000,
    created_at: '2026-03-15T14:00:00Z',
    valid_until: '2026-05-20',
  },
  {
    id: 'est-005',
    estimate_number: 1005,
    name: 'Chen Whole-House Electrical',
    client_name: 'Linda Chen',
    status: 'rejected',
    contract_type: 'time_and_material',
    total: 1296000,
    created_at: '2026-03-08T11:00:00Z',
    valid_until: '2026-04-15',
  },
  {
    id: 'est-006',
    estimate_number: 1006,
    name: 'Patel Roof Replacement',
    client_name: 'Ravi Patel',
    status: 'expired',
    contract_type: 'fixed_price',
    total: 1782000,
    created_at: '2026-01-28T08:00:00Z',
    valid_until: '2026-03-01',
  },
];

// ============================================================================
// Helpers
// ============================================================================

function centsToDollars(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatContractType(type: ContractType): string {
  const map: Record<ContractType, string> = {
    fixed_price: 'Fixed Price',
    cost_plus: 'Cost Plus',
    time_and_material: 'T&M',
    unit_price: 'Unit Price',
  };
  return map[type] ?? type;
}

// ============================================================================
// Page
// ============================================================================

export default function EstimatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEstimates = MOCK_ESTIMATES.filter((est) => {
    if (statusFilter !== 'all' && est.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !est.name.toLowerCase().includes(q) &&
        !est.client_name.toLowerCase().includes(q) &&
        !String(est.estimate_number).includes(q)
      )
        return false;
    }
    return true;
  });

  // Stats
  const totalEstimates = MOCK_ESTIMATES.length;
  const approvedValue = MOCK_ESTIMATES.filter((e) => e.status === 'approved').reduce(
    (s, e) => s + e.total,
    0
  );
  const pendingValue = MOCK_ESTIMATES.filter(
    (e) => e.status === 'sent' || e.status === 'viewed'
  ).reduce((s, e) => s + e.total, 0);
  const approvedCount = MOCK_ESTIMATES.filter((e) => e.status === 'approved').length;
  const sentOrBeyond = MOCK_ESTIMATES.filter(
    (e) => e.status !== 'draft'
  ).length;
  const conversionRate =
    sentOrBeyond > 0
      ? `${Math.round((approvedCount / sentOrBeyond) * 100)}%`
      : '0%';

  const columns: ColumnDef<EstimateRow>[] = [
    {
      header: '#',
      accessor: 'estimate_number',
      sortable: true,
      className: 'w-[80px]',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          #{row.estimate_number}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: 'Client',
      accessor: 'client_name',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Contract Type',
      accessor: 'contract_type',
      cell: (row) => (
        <span className="text-sm">{formatContractType(row.contract_type)}</span>
      ),
    },
    {
      header: 'Total',
      accessor: 'total',
      sortable: true,
      className: 'text-right',
      cell: (row) => (
        <span className="font-semibold text-[#1e3a5f]">
          {centsToDollars(row.total)}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: 'Valid Until',
      accessor: 'valid_until',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.valid_until ? formatDate(row.valid_until) : '--'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        description="Create and manage project estimates"
        actions={
          <Button
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            onClick={() => router.push('/estimates/est-new')}
          >
            <Plus className="mr-1.5 size-4" />
            New Estimate
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Estimates"
          value={String(totalEstimates)}
          icon={FileText}
          change="+2 this month"
          changeType="positive"
        />
        <StatCard
          title="Approved Value"
          value={centsToDollars(approvedValue)}
          icon={DollarSign}
          changeType="positive"
        />
        <StatCard
          title="Pending Value"
          value={centsToDollars(pendingValue)}
          icon={Clock}
          change="2 awaiting response"
          changeType="neutral"
        />
        <StatCard
          title="Conversion Rate"
          value={conversionRate}
          icon={TrendingUp}
          change="+5% vs last quarter"
          changeType="positive"
        />
      </div>

      {/* Search and filters */}
      <SearchFilter
        searchPlaceholder="Search estimates by name, client, or number..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Sent', value: 'sent' },
              { label: 'Viewed', value: 'viewed' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Revised', value: 'revised' },
              { label: 'Expired', value: 'expired' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      />

      {/* Table */}
      <DataTable<EstimateRow & Record<string, unknown>>
        columns={columns as ColumnDef<EstimateRow & Record<string, unknown>>[]}
        data={filteredEstimates as (EstimateRow & Record<string, unknown>)[]}
        onRowClick={(row) => router.push(`/estimates/${row.id}`)}
        emptyMessage="No estimates found."
      />
    </div>
  );
}
