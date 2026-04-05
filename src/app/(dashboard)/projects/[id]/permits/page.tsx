'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';

// ---- Mock Data ----

interface PermitRow {
  id: string;
  type: string;
  number: string;
  status: string;
  applied_date: string;
  approved_date: string;
  expiry_date: string;
  cost: number;
  [key: string]: unknown;
}

interface InspectionRow {
  id: string;
  type: string;
  linked_permit: string;
  scheduled_date: string;
  status: string;
  inspector: string;
  result: string;
  [key: string]: unknown;
}

const MOCK_PERMITS: PermitRow[] = [
  {
    id: 'pm1',
    type: 'Building Permit',
    number: 'BP-2026-1423',
    status: 'approved',
    applied_date: '2025-12-15',
    approved_date: '2026-01-10',
    expiry_date: '2027-01-10',
    cost: 450000,
  },
  {
    id: 'pm2',
    type: 'Electrical Permit',
    number: 'EP-2026-0892',
    status: 'approved',
    applied_date: '2026-01-20',
    approved_date: '2026-02-05',
    expiry_date: '2027-02-05',
    cost: 125000,
  },
  {
    id: 'pm3',
    type: 'Plumbing Permit',
    number: 'PP-2026-0631',
    status: 'in_review',
    applied_date: '2026-03-10',
    approved_date: '',
    expiry_date: '',
    cost: 95000,
  },
];

const MOCK_INSPECTIONS: InspectionRow[] = [
  {
    id: 'ins1',
    type: 'Foundation Inspection',
    linked_permit: 'BP-2026-1423',
    scheduled_date: '2026-03-30',
    status: 'passed',
    inspector: 'John Mills',
    result: 'Passed - No corrections needed',
  },
  {
    id: 'ins2',
    type: 'Framing Inspection',
    linked_permit: 'BP-2026-1423',
    scheduled_date: '2026-04-27',
    status: 'scheduled',
    inspector: 'John Mills',
    result: '--',
  },
  {
    id: 'ins3',
    type: 'Rough Electrical',
    linked_permit: 'EP-2026-0892',
    scheduled_date: '2026-04-28',
    status: 'scheduled',
    inspector: 'Linda Park',
    result: '--',
  },
  {
    id: 'ins4',
    type: 'Final Building',
    linked_permit: 'BP-2026-1423',
    scheduled_date: '2026-06-08',
    status: 'scheduled',
    inspector: 'TBD',
    result: '--',
  },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(d: string): string {
  if (!d) return '--';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const permitColumns: ColumnDef<PermitRow>[] = [
  { header: 'Type', accessor: 'type', sortable: true, cell: (r) => <span className="font-medium">{r.type}</span> },
  { header: 'Number', accessor: 'number' },
  { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge status={r.status} /> },
  { header: 'Applied', accessor: 'applied_date', cell: (r) => formatDate(r.applied_date) },
  { header: 'Approved', accessor: 'approved_date', cell: (r) => formatDate(r.approved_date) },
  { header: 'Expiry', accessor: 'expiry_date', cell: (r) => formatDate(r.expiry_date) },
  { header: 'Cost', accessor: 'cost', cell: (r) => <span className="tabular-nums">{formatCurrency(r.cost)}</span> },
];

const inspectionColumns: ColumnDef<InspectionRow>[] = [
  { header: 'Type', accessor: 'type', sortable: true, cell: (r) => <span className="font-medium">{r.type}</span> },
  { header: 'Linked Permit', accessor: 'linked_permit' },
  { header: 'Scheduled', accessor: 'scheduled_date', sortable: true, cell: (r) => formatDate(r.scheduled_date) },
  { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge status={r.status} /> },
  { header: 'Inspector', accessor: 'inspector' },
  { header: 'Result', accessor: 'result', cell: (r) => <span className="text-sm">{r.result}</span> },
];

export default function PermitsPage() {
  const params = useParams();
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Permits & Inspections"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Permits' },
        ]}
      />

      {/* Permits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Permits</h2>
          <Button
            size="sm"
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            onClick={() => setShowPermitForm(true)}
          >
            <Plus className="mr-1 size-4" />
            Add Permit
          </Button>
        </div>
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <DataTable columns={permitColumns} data={MOCK_PERMITS} />
        </div>
      </div>

      {/* Inspections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inspections</h2>
          <Button
            size="sm"
            className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90"
            onClick={() => setShowInspectionForm(true)}
          >
            <Calendar className="mr-1 size-4" />
            Schedule Inspection
          </Button>
        </div>
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <DataTable columns={inspectionColumns} data={MOCK_INSPECTIONS} />
        </div>
      </div>

      {/* Add Permit Dialog */}
      <Dialog open={showPermitForm} onOpenChange={setShowPermitForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Permit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Permit Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="building">Building Permit</SelectItem>
                  <SelectItem value="electrical">Electrical Permit</SelectItem>
                  <SelectItem value="plumbing">Plumbing Permit</SelectItem>
                  <SelectItem value="mechanical">Mechanical Permit</SelectItem>
                  <SelectItem value="demolition">Demolition Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permit Number</Label>
              <Input placeholder="e.g., BP-2026-XXXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Applied Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Cost ($)</Label>
                <Input type="number" step="0.01" placeholder="0.00" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPermitForm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                onClick={() => setShowPermitForm(false)}
              >
                Save Permit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Inspection Dialog */}
      <Dialog open={showInspectionForm} onOpenChange={setShowInspectionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Inspection Type</Label>
              <Input placeholder="e.g., Framing Inspection" />
            </div>
            <div className="space-y-2">
              <Label>Linked Permit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select permit" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PERMITS.map((p) => (
                    <SelectItem key={p.id} value={p.number}>
                      {p.number} - {p.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Inspector Name</Label>
                <Input placeholder="Inspector name" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowInspectionForm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90"
                onClick={() => setShowInspectionForm(false)}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
