'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import type { POStatus } from '@/lib/types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

interface MockPO {
  [key: string]: unknown;
  id: string;
  po_number: number;
  vendor_name: string;
  project_name: string;
  status: POStatus;
  total: number;
  expected_delivery: string;
  received_pct: number;
}

const MOCK_POS: MockPO[] = [
  {
    id: 'po1',
    po_number: 5001,
    vendor_name: 'BuildRight Supply Co.',
    project_name: 'Kitchen Remodel - Anderson',
    status: 'acknowledged',
    total: 12450,
    expected_delivery: '2026-04-12',
    received_pct: 0,
  },
  {
    id: 'po2',
    po_number: 5002,
    vendor_name: 'National Lumber',
    project_name: 'Office Build-Out Phase 2',
    status: 'partially_received',
    total: 28900,
    expected_delivery: '2026-04-08',
    received_pct: 65,
  },
  {
    id: 'po3',
    po_number: 5003,
    vendor_name: 'Elite Electric Supply',
    project_name: 'Greenfield Townhomes',
    status: 'sent',
    total: 8750,
    expected_delivery: '2026-04-20',
    received_pct: 0,
  },
  {
    id: 'po4',
    po_number: 5004,
    vendor_name: 'Metro Plumbing Wholesale',
    project_name: 'Summit Retail Renovation',
    status: 'received',
    total: 15200,
    expected_delivery: '2026-03-28',
    received_pct: 100,
  },
  {
    id: 'po5',
    po_number: 5005,
    vendor_name: 'Pacific Concrete',
    project_name: 'Greenfield Townhomes',
    status: 'draft',
    total: 22100,
    expected_delivery: '2026-05-01',
    received_pct: 0,
  },
];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPOs = MOCK_POS.filter((po) => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        po.vendor_name.toLowerCase().includes(q) ||
        po.project_name.toLowerCase().includes(q) ||
        String(po.po_number).includes(q)
      );
    }
    return true;
  });

  const activePOs = MOCK_POS.filter(
    (po) => po.status !== 'draft' && po.status !== 'received' && po.status !== 'cancelled'
  ).length;

  const totalCommitted = MOCK_POS.filter(
    (po) => po.status !== 'draft' && po.status !== 'cancelled'
  ).reduce((s, po) => s + po.total, 0);

  const totalReceived = MOCK_POS.filter((po) => po.status === 'received').reduce(
    (s, po) => s + po.total,
    0
  );

  const pendingDelivery = MOCK_POS.filter(
    (po) =>
      po.status === 'sent' ||
      po.status === 'acknowledged' ||
      po.status === 'partially_received'
  ).length;

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

  const columns: ColumnDef<MockPO>[] = [
    {
      header: 'PO #',
      accessor: 'po_number',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-medium">PO-{row.po_number}</span>
      ),
    },
    {
      header: 'Vendor',
      accessor: 'vendor_name',
      sortable: true,
    },
    {
      header: 'Project',
      accessor: 'project_name',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Total',
      accessor: 'total',
      sortable: true,
      className: 'text-right',
      cell: (row) => (
        <span className="font-medium tabular-nums">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: 'Expected Delivery',
      accessor: 'expected_delivery',
      sortable: true,
      cell: (row) => formatDate(row.expected_delivery),
    },
    {
      header: 'Received %',
      accessor: 'received_pct',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Progress value={row.received_pct} className="h-2 w-16" />
          <span className="text-xs tabular-nums text-muted-foreground">
            {row.received_pct}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage vendor purchase orders and track deliveries"
        actions={
          <Button
            onClick={() => router.push('/purchase-orders/new')}
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
          >
            <Plus className="mr-2 size-4" />
            New PO
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active POs"
          value={String(activePOs)}
          icon={Package}
        />
        <StatCard
          title="Total Committed"
          value={formatCurrency(totalCommitted)}
          icon={Truck}
          change="+$8.2k"
          changeType="neutral"
          description="this week"
        />
        <StatCard
          title="Received"
          value={formatCurrency(totalReceived)}
          icon={CheckCircle2}
          changeType="positive"
        />
        <StatCard
          title="Pending Delivery"
          value={String(pendingDelivery)}
          icon={Clock}
          change="On track"
          changeType="positive"
        />
      </div>

      <SearchFilter
        searchPlaceholder="Search purchase orders..."
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
              { label: 'Acknowledged', value: 'acknowledged' },
              { label: 'Partially Received', value: 'partially_received' },
              { label: 'Received', value: 'received' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      />

      <DataTable
        columns={columns}
        data={filteredPOs}
        onRowClick={(row) => router.push(`/purchase-orders/${row.id}`)}
        emptyMessage="No purchase orders found."
      />
    </div>
  );
}
