'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BudgetItem {
  id: string;
  category: string;
  budgeted: number; // cents
  actual: number; // cents
}

const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  { id: '1', category: 'Demolition', budgeted: 4500000, actual: 4200000 },
  { id: '2', category: 'Framing', budgeted: 12000000, actual: 11500000 },
  { id: '3', category: 'Electrical', budgeted: 8500000, actual: 9200000 },
  { id: '4', category: 'Plumbing', budgeted: 7200000, actual: 6800000 },
  { id: '5', category: 'HVAC', budgeted: 6500000, actual: 5900000 },
  { id: '6', category: 'Finishes', budgeted: 15000000, actual: 13500000 },
  { id: '7', category: 'General Conditions', budgeted: 5000000, actual: 4600000 },
  { id: '8', category: 'Overhead & Profit', budgeted: 3800000, actual: 3200000 },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getVarianceColor(variance: number): string {
  if (variance > 0) return 'text-[#22c55e]';
  if (variance < 0) return 'text-[#ef4444]';
  return 'text-muted-foreground';
}

function getPercentageColor(pct: number): string {
  if (pct <= 80) return 'text-[#22c55e]';
  if (pct <= 100) return 'text-[#f59e0b]';
  return 'text-[#ef4444]';
}

function getBarColor(pct: number): string {
  if (pct <= 80) return 'bg-[#22c55e]';
  if (pct <= 100) return 'bg-[#f59e0b]';
  return 'bg-[#ef4444]';
}

export function BudgetTracker() {
  const [items] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const totals = items.reduce(
    (acc, item) => ({
      budgeted: acc.budgeted + item.budgeted,
      actual: acc.actual + item.actual,
    }),
    { budgeted: 0, actual: 0 }
  );
  const totalVariance = totals.budgeted - totals.actual;
  const totalPct = totals.budgeted > 0 ? Math.round((totals.actual / totals.budgeted) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Budget Breakdown</h3>
        <Button size="sm" className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90">
          <Plus className="mr-1 size-4" />
          Add Budget Item
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Budgeted</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">% Used</TableHead>
              <TableHead className="w-[120px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const variance = item.budgeted - item.actual;
              const pct = item.budgeted > 0 ? Math.round((item.actual / item.budgeted) * 100) : 0;

              return (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedRow(selectedRow === item.id ? null : item.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(item.budgeted)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(item.actual)}
                  </TableCell>
                  <TableCell className={cn('text-right tabular-nums', getVarianceColor(variance))}>
                    {variance >= 0 ? '+' : ''}
                    {formatCurrency(variance)}
                  </TableCell>
                  <TableCell className={cn('text-right tabular-nums font-medium', getPercentageColor(pct))}>
                    {pct}%
                  </TableCell>
                  <TableCell>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full transition-all', getBarColor(pct))}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Summary Row */}
            <TableRow className="border-t-2 bg-muted/30 font-semibold hover:bg-muted/30">
              <TableCell>Total</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(totals.budgeted)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(totals.actual)}
              </TableCell>
              <TableCell className={cn('text-right tabular-nums', getVarianceColor(totalVariance))}>
                {totalVariance >= 0 ? '+' : ''}
                {formatCurrency(totalVariance)}
              </TableCell>
              <TableCell className={cn('text-right tabular-nums', getPercentageColor(totalPct))}>
                {totalPct}%
              </TableCell>
              <TableCell>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', getBarColor(totalPct))}
                    style={{ width: `${Math.min(totalPct, 100)}%` }}
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Drill-down placeholder */}
      {selectedRow && (
        <div className="rounded-lg border border-dashed border-[#1e3a5f]/30 bg-[#1e3a5f]/5 p-4">
          <p className="text-sm text-[#1e3a5f]">
            Linked POs and expenses for{' '}
            <span className="font-semibold">
              {items.find((i) => i.id === selectedRow)?.category}
            </span>{' '}
            will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
