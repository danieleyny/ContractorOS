'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { BudgetTracker } from '@/components/projects/BudgetTracker';

const CHART_DATA = [
  { category: 'Demo', budgeted: 45000, actual: 42000 },
  { category: 'Framing', budgeted: 120000, actual: 115000 },
  { category: 'Electrical', budgeted: 85000, actual: 92000 },
  { category: 'Plumbing', budgeted: 72000, actual: 68000 },
  { category: 'HVAC', budgeted: 65000, actual: 59000 },
  { category: 'Finishes', budgeted: 150000, actual: 135000 },
  { category: 'Gen. Cond.', budgeted: 50000, actual: 46000 },
  { category: 'Overhead', budgeted: 38000, actual: 32000 },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function BudgetPage() {
  const params = useParams();

  const totalBudgeted = 62500000;
  const totalActual = 58900000;
  const totalVariance = totalBudgeted - totalActual;
  const pctUsed = Math.round((totalActual / totalBudgeted) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Budget' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalBudgeted)}
          icon={DollarSign}
        />
        <StatCard
          title="Spent to Date"
          value={formatCurrency(totalActual)}
          icon={Wallet}
          change={`${pctUsed}% used`}
          changeType={pctUsed <= 85 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Variance"
          value={formatCurrency(Math.abs(totalVariance))}
          icon={totalVariance >= 0 ? TrendingUp : TrendingDown}
          change={totalVariance >= 0 ? 'Under budget' : 'Over budget'}
          changeType={totalVariance >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Remaining"
          value={formatCurrency(totalBudgeted - totalActual)}
          icon={DollarSign}
          description="available to spend"
        />
      </div>

      {/* Budget vs Actual Chart */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
        <h3 className="mb-4 text-sm font-semibold">Budget vs Actual</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={CHART_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
              }
            />
            <Legend />
            <Bar dataKey="budgeted" name="Budgeted" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#e8913a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Tracker Table */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
        <BudgetTracker />
      </div>
    </div>
  );
}
