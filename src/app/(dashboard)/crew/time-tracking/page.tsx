'use client';

import React, { useState } from 'react';
import {
  Download,
  Users,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { TimeTracker } from '@/components/crew/TimeTracker';
import { cn } from '@/lib/utils';

type ViewTab = 'my-time' | 'team';

interface TeamTimeEntry {
  id: string;
  employee: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  overtime: number;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_TEAM_ENTRIES: TeamTimeEntry[] = [
  { id: 'tt1', employee: 'Carlos Mendez', date: '2026-04-04', project: 'Riverside Office', task: 'Framing', hours: 8, overtime: 0, status: 'approved' },
  { id: 'tt2', employee: 'Carlos Mendez', date: '2026-04-03', project: 'Riverside Office', task: 'Framing', hours: 9, overtime: 1, status: 'approved' },
  { id: 'tt3', employee: 'Jake Williams', date: '2026-04-04', project: 'Riverside Office', task: 'Carpentry', hours: 7.5, overtime: 0, status: 'pending' },
  { id: 'tt4', employee: 'Jake Williams', date: '2026-04-03', project: 'Oakwood Home', task: 'Finish Work', hours: 8, overtime: 0, status: 'approved' },
  { id: 'tt5', employee: 'Tony Rossi', date: '2026-04-04', project: 'Downtown Retail', task: 'Electrical', hours: 8, overtime: 0, status: 'pending' },
  { id: 'tt6', employee: 'Tony Rossi', date: '2026-04-03', project: 'Oakwood Home', task: 'Electrical', hours: 10, overtime: 2, status: 'approved' },
  { id: 'tt7', employee: 'Marcus Brown', date: '2026-04-04', project: 'Hillcrest Remodel', task: 'Demo', hours: 8, overtime: 0, status: 'pending' },
  { id: 'tt8', employee: 'Marcus Brown', date: '2026-04-03', project: 'Hillcrest Remodel', task: 'Cleanup', hours: 8, overtime: 0, status: 'approved' },
  { id: 'tt9', employee: 'Andrei Petrov', date: '2026-04-04', project: 'Warehouse Lofts', task: 'Plumbing', hours: 8, overtime: 0, status: 'pending' },
  { id: 'tt10', employee: 'Andrei Petrov', date: '2026-04-03', project: 'Park Ave Duplex', task: 'Plumbing', hours: 8.5, overtime: 0.5, status: 'approved' },
  { id: 'tt11', employee: 'Devon Harris', date: '2026-04-04', project: 'Hillcrest Remodel', task: 'Painting', hours: 7, overtime: 0, status: 'pending' },
  { id: 'tt12', employee: 'Devon Harris', date: '2026-04-03', project: 'Hillcrest Remodel', task: 'Painting', hours: 8, overtime: 0, status: 'approved' },
  { id: 'tt13', employee: 'Carlos Mendez', date: '2026-04-02', project: 'Riverside Office', task: 'Framing', hours: 8, overtime: 0, status: 'approved' },
  { id: 'tt14', employee: 'Jake Williams', date: '2026-04-02', project: 'Riverside Office', task: 'Carpentry', hours: 9.5, overtime: 1.5, status: 'rejected' },
  { id: 'tt15', employee: 'Tony Rossi', date: '2026-04-02', project: 'Downtown Retail', task: 'Electrical', hours: 8, overtime: 0, status: 'approved' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  approved: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  rejected: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
};

const TEAM_COLUMNS: ColumnDef<TeamTimeEntry>[] = [
  {
    header: 'Employee',
    accessor: 'employee',
    sortable: true,
    cell: (row) => <span className="font-medium">{row.employee}</span>,
  },
  {
    header: 'Date',
    accessor: 'date',
    sortable: true,
    cell: (row) => (
      <span className="text-sm tabular-nums">
        {new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </span>
    ),
  },
  {
    header: 'Project',
    accessor: 'project',
    sortable: true,
    cell: (row) => (
      <div>
        <p className="text-sm">{row.project}</p>
        <p className="text-xs text-muted-foreground">{row.task}</p>
      </div>
    ),
  },
  {
    header: 'Hours',
    accessor: 'hours',
    sortable: true,
    cell: (row) => <span className="text-sm font-medium tabular-nums">{row.hours}h</span>,
  },
  {
    header: 'Overtime',
    accessor: 'overtime',
    sortable: true,
    cell: (row) => (
      <span
        className={cn(
          'text-sm tabular-nums',
          row.overtime > 0 ? 'font-medium text-[#f59e0b]' : 'text-muted-foreground'
        )}
      >
        {row.overtime > 0 ? `${row.overtime}h` : '-'}
      </span>
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    cell: (row) => {
      const Icon = statusIcons[row.status];
      return (
        <Badge className={cn('gap-1', statusColors[row.status])}>
          <Icon className="size-3" />
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      );
    },
  },
  {
    header: 'Actions',
    accessor: 'id',
    cell: (row) =>
      row.status === 'pending' ? (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="size-7 p-0 text-[#22c55e] hover:bg-[#22c55e]/10">
            <CheckCircle2 className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" className="size-7 p-0 text-[#ef4444] hover:bg-[#ef4444]/10">
            <XCircle className="size-4" />
          </Button>
        </div>
      ) : null,
  },
];

const EMPLOYEE_HOURS = [
  { name: 'Carlos Mendez', hours: 42, overtime: 2 },
  { name: 'Jake Williams', hours: 39, overtime: 1.5 },
  { name: 'Tony Rossi', hours: 41, overtime: 2 },
  { name: 'Marcus Brown', hours: 38, overtime: 0 },
  { name: 'Andrei Petrov', hours: 37, overtime: 0.5 },
  { name: 'Devon Harris', hours: 36, overtime: 0 },
];

export default function TimeTrackingPage() {
  const [viewTab, setViewTab] = useState<ViewTab>('my-time');
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEntries = MOCK_TEAM_ENTRIES.filter((e) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.employee.toLowerCase().includes(q) &&
        !e.project.toLowerCase().includes(q)
      )
        return false;
    }
    if (employeeFilter !== 'all' && e.employee !== employeeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const totalTeamHours = MOCK_TEAM_ENTRIES.reduce((s, e) => s + e.hours, 0);
  const totalOvertimeHours = MOCK_TEAM_ENTRIES.reduce((s, e) => s + e.overtime, 0);
  const pendingCount = MOCK_TEAM_ENTRIES.filter((e) => e.status === 'pending').length;
  const maxHours = Math.max(...EMPLOYEE_HOURS.map((e) => e.hours));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Track hours and manage timesheets"
        breadcrumbs={[
          { label: 'Crew', href: '/crew' },
          { label: 'Time Tracking' },
        ]}
        actions={
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export Timesheet
          </Button>
        }
      />

      {/* View Toggle */}
      <div className="flex items-center gap-1 rounded-lg border p-1 w-fit">
        <Button
          size="sm"
          variant={viewTab === 'my-time' ? 'default' : 'ghost'}
          className={viewTab === 'my-time' ? 'bg-[#1e3a5f] text-white' : ''}
          onClick={() => setViewTab('my-time')}
        >
          <User className="mr-1.5 size-4" />
          My Time
        </Button>
        <Button
          size="sm"
          variant={viewTab === 'team' ? 'default' : 'ghost'}
          className={viewTab === 'team' ? 'bg-[#1e3a5f] text-white' : ''}
          onClick={() => setViewTab('team')}
        >
          <Users className="mr-1.5 size-4" />
          Team Overview
        </Button>
      </div>

      {viewTab === 'my-time' && <TimeTracker />}

      {viewTab === 'team' && (
        <>
          {/* Team Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Team Hours"
              value={`${totalTeamHours}h`}
              icon={Clock}
              description="this week"
            />
            <StatCard
              title="Overtime Hours"
              value={`${totalOvertimeHours}h`}
              icon={AlertCircle}
              change={totalOvertimeHours > 5 ? 'High' : 'Normal'}
              changeType={totalOvertimeHours > 5 ? 'negative' : 'neutral'}
            />
            <StatCard
              title="Pending Approvals"
              value={String(pendingCount)}
              icon={Clock}
              change="Needs review"
              changeType="neutral"
            />
            <StatCard
              title="Team Size"
              value="6"
              icon={Users}
              description="active this week"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <SearchFilter
              searchPlaceholder="Search entries..."
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  label: 'Employee',
                  value: employeeFilter,
                  onChange: setEmployeeFilter,
                  options: [
                    { label: 'Carlos Mendez', value: 'Carlos Mendez' },
                    { label: 'Jake Williams', value: 'Jake Williams' },
                    { label: 'Tony Rossi', value: 'Tony Rossi' },
                    { label: 'Marcus Brown', value: 'Marcus Brown' },
                    { label: 'Andrei Petrov', value: 'Andrei Petrov' },
                    { label: 'Devon Harris', value: 'Devon Harris' },
                  ],
                },
                {
                  label: 'Status',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                  ],
                },
              ]}
              onClearFilters={() => {
                setSearch('');
                setEmployeeFilter('all');
                setStatusFilter('all');
              }}
            />
            <Button
              className="bg-[#22c55e] text-white hover:bg-[#22c55e]/90"
              size="sm"
            >
              <CheckCircle2 className="mr-1.5 size-4" />
              Bulk Approve
            </Button>
          </div>

          {/* Team DataTable */}
          <DataTable
            columns={TEAM_COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
            data={filteredEntries as unknown as Record<string, unknown>[]}
          />

          {/* Hours by Employee Bar Chart (mock) */}
          <div className="rounded-xl bg-white light-card p-6 shadow-sm ring-1 ring-foreground/10">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-[#1e3a5f]" />
              <h3 className="text-sm font-semibold">Hours by Employee This Week</h3>
            </div>
            <div className="mt-4 space-y-3">
              {EMPLOYEE_HOURS.map((emp) => (
                <div key={emp.name} className="flex items-center gap-3">
                  <span className="w-[130px] shrink-0 text-xs font-medium">
                    {emp.name}
                  </span>
                  <div className="flex-1">
                    <div className="flex h-6 items-center gap-0.5">
                      <div
                        className="h-full rounded-l bg-[#1e3a5f]"
                        style={{
                          width: `${((emp.hours - emp.overtime) / maxHours) * 100}%`,
                        }}
                      />
                      {emp.overtime > 0 && (
                        <div
                          className="h-full rounded-r bg-[#f59e0b]"
                          style={{
                            width: `${(emp.overtime / maxHours) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="w-[60px] shrink-0 text-right text-xs font-medium tabular-nums">
                    {emp.hours}h
                    {emp.overtime > 0 && (
                      <span className="text-[#f59e0b]"> (+{emp.overtime})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                <span className="mr-1 inline-block size-2 rounded-full bg-[#1e3a5f]" />
                Regular
              </span>
              <span>
                <span className="mr-1 inline-block size-2 rounded-full bg-[#f59e0b]" />
                Overtime
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
