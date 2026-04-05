'use client';

import React from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { InvoiceStatus } from '@/lib/types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

interface AgingInvoice {
  id: string;
  invoiceNumber: number;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOutstanding: number;
  bucket: '0-30' | '31-60' | '61-90' | '90+';
  status: InvoiceStatus;
}

const AGING_INVOICES: AgingInvoice[] = [
  {
    id: '1',
    invoiceNumber: 1001,
    clientName: 'Anderson Residence',
    amount: 12500,
    dueDate: '2026-03-20',
    daysOutstanding: 15,
    bucket: '0-30',
    status: 'sent',
  },
  {
    id: '2',
    invoiceNumber: 1002,
    clientName: 'Metro Commercial LLC',
    amount: 45000,
    dueDate: '2026-03-10',
    daysOutstanding: 25,
    bucket: '0-30',
    status: 'viewed',
  },
  {
    id: '3',
    invoiceNumber: 993,
    clientName: 'Greenfield Development',
    amount: 28750,
    dueDate: '2026-02-15',
    daysOutstanding: 48,
    bucket: '31-60',
    status: 'overdue',
  },
  {
    id: '4',
    invoiceNumber: 988,
    clientName: 'Summit Properties',
    amount: 18200,
    dueDate: '2026-02-01',
    daysOutstanding: 62,
    bucket: '61-90',
    status: 'overdue',
  },
  {
    id: '5',
    invoiceNumber: 985,
    clientName: 'Oakridge Builders',
    amount: 9400,
    dueDate: '2026-01-28',
    daysOutstanding: 66,
    bucket: '61-90',
    status: 'overdue',
  },
  {
    id: '6',
    invoiceNumber: 976,
    clientName: 'Riverside Condos',
    amount: 32100,
    dueDate: '2025-12-20',
    daysOutstanding: 105,
    bucket: '90+',
    status: 'overdue',
  },
  {
    id: '7',
    invoiceNumber: 970,
    clientName: 'Heritage Homes',
    amount: 15600,
    dueDate: '2025-12-05',
    daysOutstanding: 120,
    bucket: '90+',
    status: 'overdue',
  },
  {
    id: '8',
    invoiceNumber: 998,
    clientName: 'Parkview Estates',
    amount: 22300,
    dueDate: '2026-03-01',
    daysOutstanding: 34,
    bucket: '31-60',
    status: 'partially_paid',
  },
];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function AgingReport() {
  const buckets = {
    '0-30': AGING_INVOICES.filter((i) => i.bucket === '0-30'),
    '31-60': AGING_INVOICES.filter((i) => i.bucket === '31-60'),
    '61-90': AGING_INVOICES.filter((i) => i.bucket === '61-90'),
    '90+': AGING_INVOICES.filter((i) => i.bucket === '90+'),
  };

  const bucketTotals = {
    '0-30': buckets['0-30'].reduce((s, i) => s + i.amount, 0),
    '31-60': buckets['31-60'].reduce((s, i) => s + i.amount, 0),
    '61-90': buckets['61-90'].reduce((s, i) => s + i.amount, 0),
    '90+': buckets['90+'].reduce((s, i) => s + i.amount, 0),
  };

  const grandTotal = Object.values(bucketTotals).reduce((s, v) => s + v, 0);

  const chartData = [
    { name: '0-30 Days', amount: bucketTotals['0-30'], fill: '#1e3a5f' },
    { name: '31-60 Days', amount: bucketTotals['31-60'], fill: '#e8913a' },
    { name: '61-90 Days', amount: bucketTotals['61-90'], fill: '#f59e0b' },
    { name: '90+ Days', amount: bucketTotals['90+'], fill: '#ef4444' },
  ];

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
        <h3 className="mb-4 font-semibold">Accounts Receivable Aging</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
              />
              <Legend />
              <Bar dataKey="amount" name="Outstanding" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bucket summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(bucketTotals).map(([bucket, total]) => {
          const colors: Record<string, string> = {
            '0-30': 'bg-[#1e3a5f]/10 text-[#1e3a5f]',
            '31-60': 'bg-[#e8913a]/10 text-[#e8913a]',
            '61-90': 'bg-[#f59e0b]/10 text-[#f59e0b]',
            '90+': 'bg-[#ef4444]/10 text-[#ef4444]',
          };
          return (
            <div
              key={bucket}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10"
            >
              <p className="text-sm text-muted-foreground">{bucket} Days</p>
              <p className="mt-1 text-xl font-bold tabular-nums">
                {formatCurrency(total)}
              </p>
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${colors[bucket]}`}
              >
                {buckets[bucket as keyof typeof buckets].length} invoices
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10">
        <div className="border-b p-5">
          <h3 className="font-semibold">Outstanding Invoices</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Client</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Days Outstanding</TableHead>
              <TableHead>Bucket</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AGING_INVOICES.sort(
              (a, b) => b.daysOutstanding - a.daysOutstanding
            ).map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.clientName}</TableCell>
                <TableCell className="font-mono">INV-{inv.invoiceNumber}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(inv.amount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span
                    className={
                      inv.daysOutstanding > 90
                        ? 'font-medium text-[#ef4444]'
                        : inv.daysOutstanding > 60
                          ? 'text-[#f59e0b]'
                          : ''
                    }
                  >
                    {inv.daysOutstanding}
                  </span>
                </TableCell>
                <TableCell>{inv.bucket} days</TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell />
              <TableCell className="text-right font-semibold tabular-nums">
                {formatCurrency(grandTotal)}
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
