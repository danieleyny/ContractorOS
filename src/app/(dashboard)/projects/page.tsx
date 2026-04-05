'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  List,
  Building2,
  DollarSign,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProjectCard } from '@/components/projects/ProjectCard';

// Mock data
const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Riverside Office Renovation',
    project_number: 1001,
    client_name: 'Riverside Holdings LLC',
    status: 'in_progress',
    project_type: 'Commercial Renovation',
    budget_total: 62500000,
    budget_spent: 41200000,
    completion_percentage: 65,
    start_date: '2026-01-15',
    target_end_date: '2026-06-30',
    assigned_pm: 'Sarah Johnson',
    assigned_pm_avatar: null,
    contract_amount: 75000000,
  },
  {
    id: 'p2',
    name: 'Oakwood Custom Home',
    project_number: 1002,
    client_name: 'David & Maria Chen',
    status: 'in_progress',
    project_type: 'Residential New Build',
    budget_total: 45000000,
    budget_spent: 22500000,
    completion_percentage: 45,
    start_date: '2026-02-01',
    target_end_date: '2026-08-15',
    assigned_pm: 'Mike Rodriguez',
    assigned_pm_avatar: null,
    contract_amount: 52000000,
  },
  {
    id: 'p3',
    name: 'Downtown Retail Buildout',
    project_number: 1003,
    client_name: 'Metro Retail Group',
    status: 'pre_construction',
    project_type: 'Commercial Buildout',
    budget_total: 28000000,
    budget_spent: 2800000,
    completion_percentage: 5,
    start_date: '2026-04-01',
    target_end_date: '2026-09-30',
    assigned_pm: 'Sarah Johnson',
    assigned_pm_avatar: null,
    contract_amount: 34000000,
  },
  {
    id: 'p4',
    name: 'Hillcrest Kitchen & Bath',
    project_number: 1004,
    client_name: 'Jennifer Walsh',
    status: 'punch_list',
    project_type: 'Residential Remodel',
    budget_total: 8500000,
    budget_spent: 8900000,
    completion_percentage: 95,
    start_date: '2025-11-01',
    target_end_date: '2026-03-15',
    assigned_pm: 'Mike Rodriguez',
    assigned_pm_avatar: null,
    contract_amount: 9500000,
  },
  {
    id: 'p5',
    name: 'Warehouse Conversion Lofts',
    project_number: 1005,
    client_name: 'Urban Living Partners',
    status: 'on_hold',
    project_type: 'Mixed-Use Conversion',
    budget_total: 120000000,
    budget_spent: 36000000,
    completion_percentage: 25,
    start_date: '2025-09-15',
    target_end_date: '2026-12-31',
    assigned_pm: 'Sarah Johnson',
    assigned_pm_avatar: null,
    contract_amount: 145000000,
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

const TABLE_COLUMNS: ColumnDef<(typeof MOCK_PROJECTS)[0]>[] = [
  {
    header: '#',
    accessor: 'project_number',
    sortable: true,
    className: 'w-[60px]',
  },
  {
    header: 'Project',
    accessor: 'name',
    sortable: true,
    cell: (row) => (
      <div>
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.client_name}</p>
      </div>
    ),
  },
  {
    header: 'Type',
    accessor: 'project_type',
    cell: (row) => (
      <span className="rounded-md bg-[#1e3a5f]/5 px-2 py-0.5 text-xs font-medium text-[#1e3a5f]">
        {row.project_type}
      </span>
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'Budget',
    accessor: 'budget_total',
    sortable: true,
    cell: (row) => {
      const pct = row.budget_total > 0 ? Math.round((row.budget_spent / row.budget_total) * 100) : 0;
      const color = pct <= 70 ? 'bg-[#22c55e]' : pct <= 90 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]';
      return (
        <div className="space-y-1">
          <span className="text-sm tabular-nums">{formatCurrency(row.budget_total)}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      );
    },
  },
  {
    header: 'Progress',
    accessor: 'completion_percentage',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#1e3a5f]"
            style={{ width: `${row.completion_percentage}%` }}
          />
        </div>
        <span className="text-xs tabular-nums">{row.completion_percentage}%</span>
      </div>
    ),
  },
  {
    header: 'PM',
    accessor: 'assigned_pm',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{row.assigned_pm}</span>
    ),
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pmFilter, setPmFilter] = useState('all');

  const filteredProjects = MOCK_PROJECTS.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.client_name.toLowerCase().includes(q) &&
        !String(p.project_number).includes(q)
      )
        return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (pmFilter !== 'all' && p.assigned_pm !== pmFilter) return false;
    return true;
  });

  const activeProjects = MOCK_PROJECTS.filter(
    (p) => p.status === 'in_progress' || p.status === 'pre_construction'
  ).length;
  const totalContractValue = MOCK_PROJECTS.reduce((s, p) => s + p.contract_amount, 0);
  const onTrackCount = MOCK_PROJECTS.filter(
    (p) => p.budget_spent <= p.budget_total
  ).length;
  const budgetHealthPct = Math.round((onTrackCount / MOCK_PROJECTS.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your construction projects"
        actions={
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
            <Plus className="mr-2 size-4" />
            New Project
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={String(activeProjects)}
          icon={Building2}
          change="+1"
          changeType="positive"
          description="this month"
        />
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(totalContractValue)}
          icon={DollarSign}
        />
        <StatCard
          title="Budget Health"
          value={`${budgetHealthPct}%`}
          icon={Activity}
          change={budgetHealthPct >= 70 ? 'On Track' : 'At Risk'}
          changeType={budgetHealthPct >= 70 ? 'positive' : 'negative'}
          description="projects on budget"
        />
        <StatCard
          title="Overdue Tasks"
          value="4"
          icon={AlertTriangle}
          change="2 critical"
          changeType="negative"
        />
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-start justify-between gap-4">
        <SearchFilter
          searchPlaceholder="Search projects..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'Pre-Construction', value: 'pre_construction' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'On Hold', value: 'on_hold' },
                { label: 'Punch List', value: 'punch_list' },
                { label: 'Completed', value: 'completed' },
              ],
            },
            {
              label: 'PM',
              value: pmFilter,
              onChange: setPmFilter,
              options: [
                { label: 'Sarah Johnson', value: 'Sarah Johnson' },
                { label: 'Mike Rodriguez', value: 'Mike Rodriguez' },
              ],
            },
          ]}
          onClearFilters={() => {
            setSearch('');
            setStatusFilter('all');
            setPmFilter('all');
          }}
        />
        <div className="flex shrink-0 items-center gap-1 rounded-lg border p-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            className={viewMode === 'grid' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            className={viewMode === 'list' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('list')}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              projectNumber={project.project_number}
              clientName={project.client_name}
              status={project.status}
              projectType={project.project_type}
              budgetTotal={project.budget_total}
              budgetSpent={project.budget_spent}
              completionPercentage={project.completion_percentage}
              startDate={project.start_date}
              targetEndDate={project.target_end_date}
              assignedPmName={project.assigned_pm}
              assignedPmAvatar={project.assigned_pm_avatar}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={TABLE_COLUMNS as ColumnDef<Record<string, unknown>>[]}
          data={filteredProjects as unknown as Record<string, unknown>[]}
          onRowClick={(row) => router.push(`/projects/${(row as Record<string, unknown>).id}`)}
        />
      )}
    </div>
  );
}
