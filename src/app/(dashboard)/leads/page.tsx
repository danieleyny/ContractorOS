'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  List,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KanbanBoard } from '@/components/leads/KanbanBoard';
import { LeadForm } from '@/components/leads/LeadForm';
import { cn } from '@/lib/utils';

// -------------------------------------------------------------------
// Mock list-view data
// -------------------------------------------------------------------

interface LeadRow {
  id: string;
  name: string;
  company: string;
  stage: string;
  temperature: string;
  value: string;
  days_in_stage: number;
  assigned_to: string;
  last_activity: string;
  [key: string]: unknown;
}

const MOCK_LIST_DATA: LeadRow[] = [
  { id: 'l1', name: 'John Martinez', company: 'Martinez Properties', stage: 'New Inquiry', temperature: 'hot', value: '$45,000', days_in_stage: 2, assigned_to: 'Mike Johnson', last_activity: 'Apr 3, 2026' },
  { id: 'l4', name: 'Emily Davis', company: 'Davis Development', stage: 'Contacted', temperature: 'hot', value: '$85,000', days_in_stage: 1, assigned_to: 'Sarah Adams', last_activity: 'Apr 4, 2026' },
  { id: 'l6', name: 'Lisa Anderson', company: 'Anderson Real Estate', stage: 'Estimate Sent', temperature: 'hot', value: '$120,000', days_in_stage: 3, assigned_to: 'Sarah Adams', last_activity: 'Apr 2, 2026' },
  { id: 'l9', name: 'James Moore', company: 'Moore Construction', stage: 'Negotiation', temperature: 'hot', value: '$250,000', days_in_stage: 6, assigned_to: 'Sarah Adams', last_activity: 'Apr 1, 2026' },
  { id: 'l2', name: 'Sarah Chen', company: '--', stage: 'New Inquiry', temperature: 'warm', value: '$12,000', days_in_stage: 5, assigned_to: 'Mike Johnson', last_activity: 'Mar 31, 2026' },
  { id: 'l5', name: 'Michael Brown', company: '--', stage: 'Contacted', temperature: 'warm', value: '$22,000', days_in_stage: 7, assigned_to: 'Mike Johnson', last_activity: 'Mar 29, 2026' },
  { id: 'l7', name: 'David Wilson', company: '--', stage: 'Estimate Sent', temperature: 'warm', value: '$35,000', days_in_stage: 14, assigned_to: 'Mike Johnson', last_activity: 'Mar 22, 2026' },
  { id: 'l3', name: 'Robert Williams', company: 'Williams & Co', stage: 'New Inquiry', temperature: 'cold', value: '$8,000', days_in_stage: 12, assigned_to: '--', last_activity: 'Mar 24, 2026' },
  { id: 'l8', name: 'Jennifer Taylor', company: 'Taylor Holdings', stage: 'Estimate Sent', temperature: 'cold', value: '$18,000', days_in_stage: 21, assigned_to: '--', last_activity: 'Mar 15, 2026' },
  { id: 'l10', name: 'Patricia Jackson', company: '--', stage: 'Won', temperature: 'hot', value: '$67,000', days_in_stage: 0, assigned_to: 'Mike Johnson', last_activity: 'Apr 4, 2026' },
];

// -------------------------------------------------------------------
// Table columns
// -------------------------------------------------------------------

const tempDot: Record<string, string> = {
  hot: 'bg-red-500',
  warm: 'bg-[#e8913a]',
  cold: 'bg-blue-500',
  dead: 'bg-gray-400',
};

const columns: ColumnDef<LeadRow>[] = [
  {
    header: 'Name',
    accessor: 'name',
    sortable: true,
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { header: 'Company', accessor: 'company', sortable: true },
  {
    header: 'Stage',
    accessor: 'stage',
    sortable: true,
    cell: (row) => <StatusBadge status={row.stage.toLowerCase().replace(/\s+/g, '_')} />,
  },
  {
    header: 'Temperature',
    accessor: 'temperature',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <span className={cn('size-2 rounded-full', tempDot[row.temperature] || 'bg-gray-300')} />
        <span className="capitalize text-sm">{row.temperature}</span>
      </div>
    ),
  },
  { header: 'Value', accessor: 'value', sortable: true },
  { header: 'Days in Stage', accessor: 'days_in_stage', sortable: true },
  { header: 'Assigned To', accessor: 'assigned_to' },
  { header: 'Last Activity', accessor: 'last_activity', sortable: true },
];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function LeadsPipelinePage() {
  const router = useRouter();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showNewLead, setShowNewLead] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [tempFilter, setTempFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Leads & CRM"
        description="Manage your sales pipeline"
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border p-0.5">
              <button
                onClick={() => setView('kanban')}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  view === 'kanban'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  view === 'list'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="size-4" />
              </button>
            </div>

            <Button
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              onClick={() => setShowNewLead(true)}
            >
              <Plus className="mr-1.5 size-4" />
              New Lead
            </Button>
          </div>
        }
      />

      {/* Pipeline analytics bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pipeline Value"
          value="$562,000"
          icon={DollarSign}
          change="+12.5%"
          changeType="positive"
          description="vs last month"
        />
        <StatCard
          title="Active Leads"
          value="24"
          icon={Users}
          change="+3"
          changeType="positive"
          description="this week"
        />
        <StatCard
          title="Avg Days to Close"
          value="18"
          icon={Clock}
          change="-2 days"
          changeType="positive"
          description="vs last quarter"
        />
        <StatCard
          title="Conversion Rate"
          value="32%"
          icon={TrendingUp}
          change="+4%"
          changeType="positive"
          description="vs last month"
        />
      </div>

      {/* Search & Filters */}
      <SearchFilter
        searchPlaceholder="Search by name or company..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Source',
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { label: 'Website', value: 'website' },
              { label: 'Referral', value: 'referral' },
              { label: 'Social Media', value: 'social_media' },
              { label: 'Phone', value: 'phone' },
              { label: 'Advertising', value: 'advertising' },
            ],
          },
          {
            label: 'Temperature',
            value: tempFilter,
            onChange: setTempFilter,
            options: [
              { label: 'Hot', value: 'hot' },
              { label: 'Warm', value: 'warm' },
              { label: 'Cold', value: 'cold' },
              { label: 'Dead', value: 'dead' },
            ],
          },
          {
            label: 'Assigned To',
            value: assignedFilter,
            onChange: setAssignedFilter,
            options: [
              { label: 'Mike Johnson', value: 'u1' },
              { label: 'Sarah Adams', value: 'u2' },
              { label: 'Tom Rivera', value: 'u3' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setSourceFilter('all');
          setTempFilter('all');
          setAssignedFilter('all');
        }}
      />

      {/* Main content */}
      {view === 'kanban' ? (
        <KanbanBoard />
      ) : (
        <DataTable<LeadRow>
          columns={columns}
          data={MOCK_LIST_DATA}
          onRowClick={(row) => router.push(`/leads/${row.id}`)}
          emptyMessage="No leads found."
        />
      )}

      {/* New Lead Dialog */}
      <LeadForm
        open={showNewLead}
        onOpenChange={setShowNewLead}
        onSubmit={(data) => {
          console.log('Create lead:', data);
          setShowNewLead(false);
        }}
      />
    </div>
  );
}
