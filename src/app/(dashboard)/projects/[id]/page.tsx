'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  DollarSign,
  FileText,
  Receipt,
  Wallet,
  TrendingUp,
  Calendar,
  ClipboardList,
  FileCheck,
  Camera,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  FilePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

// Mock project data
const MOCK_PROJECT = {
  id: 'p1',
  name: 'Riverside Office Renovation',
  project_number: 1001,
  client_name: 'Riverside Holdings LLC',
  status: 'in_progress',
  project_type: 'Commercial Renovation',
  contract_amount: 75000000,
  invoiced: 41200000,
  collected: 38500000,
  remaining: 33800000,
  profit_margin: 1800,
  budget_total: 62500000,
  budget_spent: 41200000,
  start_date: '2026-01-15',
  target_end_date: '2026-06-30',
};

const MOCK_MILESTONES = [
  { name: 'Framing Complete', date: '2026-04-17', status: 'in_progress' },
  { name: 'Rough Inspection', date: '2026-04-27', status: 'not_started' },
  { name: 'Final Inspection', date: '2026-06-08', status: 'not_started' },
];

const MOCK_ACTIVITY = [
  { id: 'a1', type: 'task', message: 'Framing second floor started', time: '2 hours ago', icon: CheckCircle2, color: 'text-[#22c55e]' },
  { id: 'a2', type: 'log', message: 'Daily log submitted by Mike R.', time: '5 hours ago', icon: FileText, color: 'text-[#1e3a5f]' },
  { id: 'a3', type: 'co', message: 'Change Order #2 approved ($4,200)', time: '1 day ago', icon: FilePlus, color: 'text-[#e8913a]' },
  { id: 'a4', type: 'alert', message: 'Interior Finishes task blocked', time: '2 days ago', icon: AlertCircle, color: 'text-[#ef4444]' },
  { id: 'a5', type: 'payment', message: 'Payment received: $15,000', time: '3 days ago', icon: DollarSign, color: 'text-[#22c55e]' },
];

const QUICK_LINKS = [
  { label: 'Budget', href: 'budget', icon: DollarSign, color: 'bg-[#22c55e]/10 text-[#22c55e]' },
  { label: 'Schedule', href: 'schedule', icon: Calendar, color: 'bg-[#1e3a5f]/10 text-[#1e3a5f]' },
  { label: 'Daily Logs', href: 'daily-logs', icon: ClipboardList, color: 'bg-[#e8913a]/10 text-[#e8913a]' },
  { label: 'Change Orders', href: 'change-orders', icon: FilePlus, color: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
  { label: 'Permits', href: 'permits', icon: FileCheck, color: 'bg-purple-100 text-purple-600' },
  { label: 'Punch List', href: 'punch-list', icon: CheckCircle2, color: 'bg-pink-100 text-pink-600' },
  { label: 'Photos', href: 'photos', icon: Camera, color: 'bg-cyan-100 text-cyan-600' },
  { label: 'Documents', href: 'documents', icon: FolderOpen, color: 'bg-gray-100 text-gray-600' },
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

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = MOCK_PROJECT;

  const budgetPct = project.budget_total > 0
    ? Math.round((project.budget_spent / project.budget_total) * 100)
    : 0;
  const budgetColor = budgetPct <= 70 ? 'bg-[#22c55e]' : budgetPct <= 90 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]';

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
            <Button className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90">
              <FilePlus className="mr-2 size-4" />
              Change Order
            </Button>
          </div>
        }
      />

      {/* Status & Type */}
      <div className="flex items-center gap-3">
        <StatusBadge status={project.status} />
        <span className="rounded-md bg-[#1e3a5f]/5 px-2 py-0.5 text-xs font-medium text-[#1e3a5f]">
          {project.project_type}
        </span>
        <span className="text-sm text-muted-foreground">
          #{project.project_number}
        </span>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Contract Amount" value={formatCurrency(project.contract_amount)} icon={DollarSign} />
        <StatCard title="Invoiced" value={formatCurrency(project.invoiced)} icon={Receipt} />
        <StatCard title="Collected" value={formatCurrency(project.collected)} icon={Wallet} />
        <StatCard title="Remaining" value={formatCurrency(project.remaining)} icon={Clock} />
        <StatCard
          title="Profit Margin"
          value={`${(project.profit_margin / 100).toFixed(1)}%`}
          icon={TrendingUp}
          change="Target: 20%"
          changeType={project.profit_margin >= 2000 ? 'positive' : 'negative'}
        />
      </div>

      {/* Budget Health Bar */}
      <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Budget Health</h3>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_total)}{' '}
            <span className="text-muted-foreground">({budgetPct}%)</span>
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all', budgetColor)}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Two columns on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mini Gantt / Milestones */}
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <h3 className="text-sm font-semibold">Upcoming Milestones</h3>
          <div className="mt-4 space-y-3">
            {MOCK_MILESTONES.map((ms, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full',
                    ms.status === 'in_progress'
                      ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Calendar className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{ms.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ms.date)}</p>
                </div>
                <StatusBadge status={ms.status} />
              </div>
            ))}
          </div>
          <Link
            href={`/projects/${projectId}/schedule`}
            className="mt-4 inline-block text-xs font-medium text-[#1e3a5f] hover:underline"
          >
            View Full Schedule
          </Link>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {MOCK_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={cn('mt-0.5', item.color)}>
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/projects/${projectId}/${link.href}`}
              className="flex items-center gap-3 rounded-xl bg-white light-card p-4 shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
            >
              <div className={cn('flex size-10 items-center justify-center rounded-full', link.color)}>
                <link.icon className="size-5" />
              </div>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
