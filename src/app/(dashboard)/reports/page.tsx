'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Wrench, FileText, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

// Financial
const REVENUE_DATA = [
  { month: 'Nov', revenue: 68000 },
  { month: 'Dec', revenue: 52000 },
  { month: 'Jan', revenue: 74000 },
  { month: 'Feb', revenue: 81000 },
  { month: 'Mar', revenue: 95000 },
  { month: 'Apr', revenue: 88000 },
];

const CASH_FLOW_DATA = [
  { month: 'Nov', inflows: 72000, outflows: 58000 },
  { month: 'Dec', inflows: 55000, outflows: 61000 },
  { month: 'Jan', inflows: 78000, outflows: 65000 },
  { month: 'Feb', inflows: 85000, outflows: 70000 },
  { month: 'Mar', inflows: 98000, outflows: 74000 },
  { month: 'Apr', inflows: 92000, outflows: 78000 },
];

const PNL_DATA = [
  { label: 'Revenue', amount: 458000, pct: '100%' },
  { label: 'Cost of Goods Sold', amount: -275000, pct: '60.0%' },
  { label: 'Gross Profit', amount: 183000, pct: '40.0%', bold: true },
  { label: 'Overhead & Admin', amount: -68000, pct: '14.8%' },
  { label: 'Marketing', amount: -12000, pct: '2.6%' },
  { label: 'Insurance & Bonding', amount: -18000, pct: '3.9%' },
  { label: 'Net Profit', amount: 85000, pct: '18.6%', bold: true, highlight: true },
];

// Projects
const PROJECT_STATUS_DATA = [
  { name: 'In Progress', value: 5, color: '#1e3a5f' },
  { name: 'Pre-Construction', value: 3, color: '#e8913a' },
  { name: 'On Hold', value: 1, color: '#f59e0b' },
  { name: 'Completed', value: 8, color: '#22c55e' },
  { name: 'Punch List', value: 2, color: '#8b5cf6' },
];

const BUDGET_VS_ACTUAL = [
  { project: 'Anderson', budget: 95000, actual: 88000 },
  { project: 'Metro', budget: 250000, actual: 245000 },
  { project: 'Greenfield', budget: 180000, actual: 192000 },
  { project: 'Summit', budget: 120000, actual: 105000 },
  { project: 'Oakridge', budget: 320000, actual: 290000 },
];

const SCHEDULE_DATA = [
  { project: 'Anderson', planned: 45, actual: 42 },
  { project: 'Metro', planned: 90, actual: 95 },
  { project: 'Greenfield', planned: 120, actual: 115 },
  { project: 'Summit', planned: 60, actual: 58 },
];

// Leads
const FUNNEL_DATA = [
  { stage: 'New Leads', count: 48, color: '#1e3a5f' },
  { stage: 'Contacted', count: 35, color: '#3b6da0' },
  { stage: 'Site Visit', count: 22, color: '#e8913a' },
  { stage: 'Estimate Sent', count: 16, color: '#f59e0b' },
  { stage: 'Negotiation', count: 10, color: '#22c55e' },
  { stage: 'Won', count: 7, color: '#16a34a' },
];

const LEAD_SOURCE_ROI = [
  { source: 'Referral', leads: 18, converted: 6, revenue: 142000, cost: 2000 },
  { source: 'Website', leads: 12, converted: 3, revenue: 85000, cost: 4500 },
  { source: 'Social Media', leads: 8, converted: 1, revenue: 28000, cost: 3200 },
  { source: 'Advertising', leads: 6, converted: 2, revenue: 64000, cost: 8000 },
  { source: 'Repeat', leads: 4, converted: 3, revenue: 95000, cost: 0 },
];

const CONVERSION_TREND = [
  { month: 'Nov', rate: 12 },
  { month: 'Dec', rate: 15 },
  { month: 'Jan', rate: 11 },
  { month: 'Feb', rate: 18 },
  { month: 'Mar', rate: 22 },
  { month: 'Apr', rate: 19 },
];

// Crew
const HOURS_BY_PROJECT = [
  { project: 'Anderson', hours: 320 },
  { project: 'Metro', hours: 580 },
  { project: 'Greenfield', hours: 450 },
  { project: 'Summit', hours: 280 },
  { project: 'Oakridge', hours: 190 },
];

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const formatCurrency = (val: number) =>
  val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const formatK = (val: number) => `$${(val / 1000).toFixed(0)}k`;

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Financial insights, project metrics, lead analytics, and crew performance"
        actions={
          <Link href="/reports/builder">
            <Button variant="outline" className="border-[#1e3a5f]/20">
              <Wrench className="mr-2 size-4" />
              Report Builder
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial" className="gap-1.5">
            <TrendingUp className="size-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5">
            <FileText className="size-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">
            <Users className="size-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="crew" className="gap-1.5">
            <Wrench className="size-4" />
            Crew
          </TabsTrigger>
        </TabsList>

        {/* ============ FINANCIAL TAB ============ */}
        <TabsContent value="financial" className="space-y-6">
          {/* Revenue Chart */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
            <h3 className="mb-4 font-semibold">Monthly Revenue</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1e3a5f"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#1e3a5f' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* P&L */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10">
            <div className="border-b p-5">
              <h3 className="font-semibold">Profit & Loss Summary (YTD)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">% of Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PNL_DATA.map((row) => (
                  <TableRow
                    key={row.label}
                    className={row.highlight ? 'bg-[#22c55e]/5' : ''}
                  >
                    <TableCell
                      className={row.bold ? 'font-semibold' : ''}
                    >
                      {row.label}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        row.bold ? 'font-semibold' : ''
                      } ${
                        row.highlight
                          ? 'text-[#22c55e]'
                          : row.amount < 0
                            ? 'text-muted-foreground'
                            : ''
                      }`}
                    >
                      {formatCurrency(Math.abs(row.amount))}
                      {row.amount < 0 && !row.bold ? '' : ''}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.pct}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Cash Flow */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
            <h3 className="mb-4 font-semibold">Cash Flow</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CASH_FLOW_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inflows"
                    name="Inflows"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="outflows"
                    name="Outflows"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Aging Summary Card */}
          <Link href="/reports/aging" className="block">
            <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 transition-colors hover:bg-muted/30">
              <div>
                <h3 className="font-semibold">Accounts Receivable Aging</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  8 outstanding invoices totaling $183,850
                </p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
            </div>
          </Link>
        </TabsContent>

        {/* ============ PROJECTS TAB ============ */}
        <TabsContent value="projects" className="space-y-6">
          {/* Project Status Pie */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
              <h3 className="mb-4 font-semibold">Project Status Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PROJECT_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {PROJECT_STATUS_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
              <h3 className="mb-4 font-semibold">Budget vs Actual</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BUDGET_VS_ACTUAL}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
                    <Legend />
                    <Bar
                      dataKey="budget"
                      name="Budget"
                      fill="#1e3a5f"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="actual"
                      name="Actual"
                      fill="#e8913a"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Schedule Performance */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
            <h3 className="mb-4 font-semibold">Schedule Performance (days)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCHEDULE_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="project"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="planned"
                    name="Planned"
                    fill="#1e3a5f"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual"
                    fill="#e8913a"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ============ LEADS TAB ============ */}
        <TabsContent value="leads" className="space-y-6">
          {/* Lead Funnel */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
            <h3 className="mb-4 font-semibold">Lead Funnel</h3>
            <div className="space-y-2">
              {FUNNEL_DATA.map((stage) => {
                const maxCount = FUNNEL_DATA[0].count;
                const widthPct = (stage.count / maxCount) * 100;
                return (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">
                      {stage.stage}
                    </span>
                    <div className="flex-1">
                      <div
                        className="flex h-8 items-center rounded-md px-3 text-sm font-medium text-white"
                        style={{
                          width: `${Math.max(widthPct, 10)}%`,
                          backgroundColor: stage.color,
                        }}
                      >
                        {stage.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Source ROI */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10">
            <div className="border-b p-5">
              <h3 className="font-semibold">Lead Source ROI</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Converted</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEAD_SOURCE_ROI.map((row) => {
                  const roi =
                    row.cost > 0
                      ? (((row.revenue - row.cost) / row.cost) * 100).toFixed(0)
                      : 'N/A';
                  return (
                    <TableRow key={row.source}>
                      <TableCell className="font-medium">{row.source}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.leads}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.converted}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.cost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {roi === 'N/A' ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : (
                          <span
                            className={
                              Number(roi) > 500
                                ? 'text-[#22c55e]'
                                : Number(roi) > 100
                                  ? 'text-[#e8913a]'
                                  : 'text-[#ef4444]'
                            }
                          >
                            {roi}%
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Conversion Rate Trend */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
            <h3 className="mb-4 font-semibold">Conversion Rate Trend (%)</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CONVERSION_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v: number) => `${v}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Conversion Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="Conversion %"
                    stroke="#e8913a"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#e8913a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ============ CREW TAB ============ */}
        <TabsContent value="crew" className="space-y-6">
          {/* Utilization Gauge */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
              <h3 className="mb-4 font-semibold">Crew Utilization Rate</h3>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <svg width="200" height="120" viewBox="0 0 200 120">
                    {/* Background arc */}
                    <path
                      d="M 20 110 A 80 80 0 0 1 180 110"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Filled arc - 78% utilization */}
                    <path
                      d="M 20 110 A 80 80 0 0 1 180 110"
                      fill="none"
                      stroke="#1e3a5f"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${0.78 * 251} 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <span className="text-3xl font-bold text-[#1e3a5f]">78%</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Average crew utilization this month
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-[#22c55e]">Target: 85%</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-[#e8913a]">Gap: 7%</span>
                </div>
              </div>
            </div>

            {/* Hours by Project */}
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
              <h3 className="mb-4 font-semibold">Hours by Project</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={HOURS_BY_PROJECT}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v) => [`${v} hrs`, 'Hours']}
                    />
                    <Bar
                      dataKey="hours"
                      name="Hours"
                      fill="#1e3a5f"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
