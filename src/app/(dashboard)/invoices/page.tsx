'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { InvoiceStatus, InvoiceType } from '@/lib/types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

interface MockInvoice {
  [key: string]: unknown;
  id: string;
  invoice_number: number;
  client_name: string;
  project_name: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  due_date: string;
  amount_paid: number;
}

const MOCK_INVOICES: MockInvoice[] = [
  {
    id: '1',
    invoice_number: 1001,
    client_name: 'Anderson Residence',
    project_name: 'Kitchen Remodel',
    type: 'progress',
    status: 'paid',
    amount: 22500,
    due_date: '2026-02-15',
    amount_paid: 22500,
  },
  {
    id: '2',
    invoice_number: 1002,
    client_name: 'Metro Commercial LLC',
    project_name: 'Office Build-Out Phase 2',
    type: 'progress',
    status: 'sent',
    amount: 45000,
    due_date: '2026-04-10',
    amount_paid: 0,
  },
  {
    id: '3',
    invoice_number: 1003,
    client_name: 'Greenfield Development',
    project_name: 'Townhomes Lot A',
    type: 'deposit',
    status: 'overdue',
    amount: 28750,
    due_date: '2026-03-20',
    amount_paid: 0,
  },
  {
    id: '4',
    invoice_number: 1004,
    client_name: 'Summit Properties',
    project_name: 'Retail Renovation',
    type: 'change_order',
    status: 'partially_paid',
    amount: 18200,
    due_date: '2026-04-01',
    amount_paid: 9100,
  },
  {
    id: '5',
    invoice_number: 1005,
    client_name: 'Oakridge Builders',
    project_name: 'Custom Home - Maple St',
    type: 'final',
    status: 'draft',
    amount: 67500,
    due_date: '2026-04-30',
    amount_paid: 0,
  },
  {
    id: '6',
    invoice_number: 1006,
    client_name: 'Riverside Condos',
    project_name: 'Unit 4B Remodel',
    type: 'retainage',
    status: 'viewed',
    amount: 8400,
    due_date: '2026-04-15',
    amount_paid: 0,
  },
  {
    id: '7',
    invoice_number: 1007,
    client_name: 'Heritage Homes',
    project_name: 'Bathroom Addition',
    type: 'progress',
    status: 'overdue',
    amount: 15600,
    due_date: '2026-03-10',
    amount_paid: 0,
  },
  {
    id: '8',
    invoice_number: 1008,
    client_name: 'Parkview Estates',
    project_name: 'Deck & Patio',
    type: 'deposit',
    status: 'paid',
    amount: 5200,
    due_date: '2026-03-05',
    amount_paid: 5200,
  },
];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredInvoices = MOCK_INVOICES.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.client_name.toLowerCase().includes(q) ||
        inv.project_name.toLowerCase().includes(q) ||
        String(inv.invoice_number).includes(q)
      );
    }
    return true;
  });

  const totalOutstanding = MOCK_INVOICES.filter(
    (i) => i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft'
  ).reduce((s, i) => s + (i.amount - i.amount_paid), 0);

  const overdueAmount = MOCK_INVOICES.filter((i) => i.status === 'overdue').reduce(
    (s, i) => s + (i.amount - i.amount_paid),
    0
  );

  const collectedThisMonth = MOCK_INVOICES.filter((i) => i.status === 'paid').reduce(
    (s, i) => s + i.amount_paid,
    0
  );

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns: ColumnDef<MockInvoice>[] = [
    {
      header: '#',
      accessor: 'invoice_number',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-medium">INV-{row.invoice_number}</span>
      ),
    },
    {
      header: 'Client',
      accessor: 'client_name',
      sortable: true,
    },
    {
      header: 'Project',
      accessor: 'project_name',
      sortable: true,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => (
        <span className="capitalize text-sm">
          {row.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      className: 'text-right',
      cell: (row) => (
        <span className="font-medium tabular-nums">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'due_date',
      sortable: true,
      cell: (row) => {
        const isOverdue =
          row.status !== 'paid' &&
          row.status !== 'void' &&
          new Date(row.due_date) < new Date();
        return (
          <span className={isOverdue ? 'font-medium text-[#ef4444]' : ''}>
            {formatDate(row.due_date)}
          </span>
        );
      },
    },
    {
      header: 'Paid',
      accessor: 'amount_paid',
      className: 'text-right',
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {formatCurrency(row.amount_paid)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage invoices, track payments, and monitor receivables"
        actions={
          <Button
            onClick={() => router.push('/invoices/new')}
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
          >
            <Plus className="mr-2 size-4" />
            New Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={DollarSign}
          change="+12%"
          changeType="neutral"
          description="vs last month"
        />
        <StatCard
          title="Overdue Amount"
          value={formatCurrency(overdueAmount)}
          icon={AlertTriangle}
          change="2 invoices"
          changeType="negative"
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(collectedThisMonth)}
          icon={TrendingUp}
          change="+8%"
          changeType="positive"
          description="vs last month"
        />
        <StatCard
          title="Avg Days to Pay"
          value="24"
          icon={Clock}
          change="-3 days"
          changeType="positive"
          description="vs last quarter"
        />
      </div>

      <SearchFilter
        searchPlaceholder="Search invoices..."
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
              { label: 'Partially Paid', value: 'partially_paid' },
              { label: 'Paid', value: 'paid' },
              { label: 'Overdue', value: 'overdue' },
              { label: 'Void', value: 'void' },
            ],
          },
          {
            label: 'Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'Progress', value: 'progress' },
              { label: 'Final', value: 'final' },
              { label: 'Retainage', value: 'retainage' },
              { label: 'Change Order', value: 'change_order' },
              { label: 'Deposit', value: 'deposit' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('all');
          setTypeFilter('all');
        }}
      />

      <DataTable
        columns={columns}
        data={filteredInvoices}
        onRowClick={(row) => router.push(`/invoices/${row.id}`)}
        emptyMessage="No invoices found."
      />
    </div>
  );
}
