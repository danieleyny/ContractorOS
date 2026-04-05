'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, DollarSign, Clock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ChangeOrderForm } from '@/components/projects/ChangeOrderForm';

interface ChangeOrderRow {
  id: string;
  co_number: number;
  title: string;
  amount: number;
  status: string;
  schedule_impact: number;
  date: string;
  [key: string]: unknown;
}

const MOCK_CHANGE_ORDERS: ChangeOrderRow[] = [
  {
    id: 'co1',
    co_number: 1,
    title: 'Additional outlet locations - kitchen island',
    amount: 285000,
    status: 'approved',
    schedule_impact: 0,
    date: '2026-03-15',
  },
  {
    id: 'co2',
    co_number: 2,
    title: 'Upgraded HVAC system - 2-zone to 3-zone',
    amount: 420000,
    status: 'approved',
    schedule_impact: 3,
    date: '2026-03-28',
  },
  {
    id: 'co3',
    co_number: 3,
    title: 'Custom built-in shelving in office',
    amount: 175000,
    status: 'pending_approval',
    schedule_impact: 2,
    date: '2026-04-02',
  },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const columns: ColumnDef<ChangeOrderRow>[] = [
  {
    header: 'CO #',
    accessor: 'co_number',
    sortable: true,
    className: 'w-[60px]',
    cell: (row) => <span className="font-medium">CO-{row.co_number}</span>,
  },
  {
    header: 'Title',
    accessor: 'title',
    sortable: true,
    cell: (row) => <span className="font-medium">{row.title}</span>,
  },
  {
    header: 'Amount',
    accessor: 'amount',
    sortable: true,
    cell: (row) => (
      <span className="tabular-nums font-medium text-[#1e3a5f]">
        {formatCurrency(row.amount)}
      </span>
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'Schedule Impact',
    accessor: 'schedule_impact',
    cell: (row) => (
      <span className="text-sm">
        {row.schedule_impact > 0 ? `+${row.schedule_impact} days` : 'None'}
      </span>
    ),
  },
  {
    header: 'Date',
    accessor: 'date',
    sortable: true,
    cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span>,
  },
];

export default function ChangeOrdersPage() {
  const params = useParams();
  const [showForm, setShowForm] = useState(false);

  const approvedCOs = MOCK_CHANGE_ORDERS.filter((co) => co.status === 'approved');
  const pendingCOs = MOCK_CHANGE_ORDERS.filter((co) => co.status === 'pending_approval');
  const totalApproved = approvedCOs.reduce((s, co) => s + co.amount, 0);
  const totalPending = pendingCOs.reduce((s, co) => s + co.amount, 0);
  const netChange = MOCK_CHANGE_ORDERS.reduce((s, co) => s + co.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Orders"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Change Orders' },
        ]}
        actions={
          <Button
            className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-2 size-4" />
            New Change Order
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Approved COs"
          value={formatCurrency(totalApproved)}
          icon={FileCheck}
          change={`${approvedCOs.length} orders`}
          changeType="neutral"
        />
        <StatCard
          title="Pending COs"
          value={formatCurrency(totalPending)}
          icon={Clock}
          change={`${pendingCOs.length} orders`}
          changeType="neutral"
        />
        <StatCard
          title="Net Change"
          value={formatCurrency(netChange)}
          icon={DollarSign}
          change="+5 days impact"
          changeType="negative"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
        <DataTable
          columns={columns}
          data={MOCK_CHANGE_ORDERS}
          onRowClick={(row) => {
            // Placeholder for detail view
          }}
        />
      </div>

      {/* Change Order Form Sheet */}
      <ChangeOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(data) => {
          setShowForm(false);
        }}
      />
    </div>
  );
}
