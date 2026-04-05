'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Send,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import type { POStatus } from '@/lib/types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

interface MockPOLineItem {
  id: string;
  description: string;
  qty_ordered: number;
  unit_price: number;
  total: number;
  qty_received: number;
  checked: boolean;
  receive_qty: number;
}

interface MockPODetail {
  id: string;
  po_number: number;
  vendor_name: string;
  vendor_contact: string;
  vendor_email: string;
  project_name: string;
  status: POStatus;
  created_date: string;
  expected_delivery: string;
  delivery_address: string;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: MockPOLineItem[];
}

const MOCK_PO: MockPODetail = {
  id: 'po2',
  po_number: 5002,
  vendor_name: 'National Lumber',
  vendor_contact: 'Mike Reynolds',
  vendor_email: 'mike@nationallumber.com',
  project_name: 'Office Build-Out Phase 2',
  status: 'partially_received',
  created_date: '2026-03-15',
  expected_delivery: '2026-04-08',
  delivery_address: '1250 Commerce Blvd, Suite 200, Austin TX 78701',
  notes: 'Deliver to loading dock B. Call 30 min before arrival.',
  subtotal: 26760,
  tax: 2140,
  total: 28900,
  line_items: [
    {
      id: 'li1',
      description: '2x4x8 Kiln-Dried Studs',
      qty_ordered: 200,
      unit_price: 4.85,
      total: 970,
      qty_received: 200,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li2',
      description: '4x8 OSB Sheathing (7/16")',
      qty_ordered: 80,
      unit_price: 28.5,
      total: 2280,
      qty_received: 80,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li3',
      description: 'LVL Beam 1-3/4x9-1/2x20\'',
      qty_ordered: 12,
      unit_price: 185,
      total: 2220,
      qty_received: 8,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li4',
      description: 'Simpson Strong-Tie Joist Hangers',
      qty_ordered: 50,
      unit_price: 8.9,
      total: 445,
      qty_received: 50,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li5',
      description: '3/4" T&G Plywood Subfloor',
      qty_ordered: 60,
      unit_price: 42.75,
      total: 2565,
      qty_received: 0,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li6',
      description: 'Pressure Treated 6x6x10 Posts',
      qty_ordered: 24,
      unit_price: 52,
      total: 1248,
      qty_received: 24,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li7',
      description: 'Tyvek HomeWrap 9\'x150\'',
      qty_ordered: 4,
      unit_price: 195,
      total: 780,
      qty_received: 0,
      checked: false,
      receive_qty: 0,
    },
    {
      id: 'li8',
      description: 'R-19 Kraft Faced Insulation Rolls',
      qty_ordered: 30,
      unit_price: 68.4,
      total: 2052,
      qty_received: 0,
      checked: false,
      receive_qty: 0,
    },
  ],
};

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const poId = params.id as string;
  const isNew = poId === 'new';

  const [lineItems, setLineItems] = useState(MOCK_PO.line_items);

  const handleCheckItem = (id: string, checked: boolean) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: checked } : item
      )
    );
  };

  const handleReceiveQtyChange = (id: string, qty: number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, receive_qty: qty } : item
      )
    );
  };

  const totalReceived = lineItems.reduce((s, li) => s + li.qty_received, 0);
  const totalOrdered = lineItems.reduce((s, li) => s + li.qty_ordered, 0);
  const receivedPct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'New Purchase Order' : `PO #${MOCK_PO.po_number}`}
        breadcrumbs={[
          { label: 'Purchase Orders', href: '/purchase-orders' },
          {
            label: isNew ? 'New PO' : `PO #${MOCK_PO.po_number}`,
          },
        ]}
      />

      {/* PO Info Header */}
      <div className="grid gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 sm:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-[#1e3a5f]" />
            <h3 className="font-semibold">PO-{MOCK_PO.po_number}</h3>
            <StatusBadge status={MOCK_PO.status} />
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Vendor:</span>{' '}
              <span className="font-medium">{MOCK_PO.vendor_name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Contact:</span>{' '}
              {MOCK_PO.vendor_contact}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{' '}
              {MOCK_PO.vendor_email}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-[#e8913a]" />
            <h3 className="font-semibold">Delivery</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Project:</span>{' '}
              <span className="font-medium">{MOCK_PO.project_name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span>{' '}
              {MOCK_PO.delivery_address}
            </p>
            <p>
              <span className="text-muted-foreground">Notes:</span>{' '}
              {MOCK_PO.notes}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-muted-foreground" />
            <h3 className="font-semibold">Dates & Total</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Created:</span>{' '}
              {formatDate(MOCK_PO.created_date)}
            </p>
            <p>
              <span className="text-muted-foreground">Expected:</span>{' '}
              {formatDate(MOCK_PO.expected_delivery)}
            </p>
            <p>
              <span className="text-muted-foreground">Received:</span>{' '}
              <span className="font-medium">{receivedPct}%</span>
            </p>
            <p className="pt-1 text-lg font-bold tabular-nums text-[#1e3a5f]">
              {formatCurrency(MOCK_PO.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items with receiving */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10">
        <div className="border-b p-5">
          <h3 className="font-semibold">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px]" />
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead className="text-right">Qty Ordered</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Qty Received</TableHead>
                <TableHead className="w-[120px] text-right">Receive Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => {
                const fullyReceived = item.qty_received >= item.qty_ordered;
                return (
                  <TableRow
                    key={item.id}
                    className={fullyReceived ? 'bg-[#22c55e]/5' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) =>
                          handleCheckItem(item.id, checked as boolean)
                        }
                        disabled={fullyReceived}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.qty_ordered}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`tabular-nums ${
                          fullyReceived
                            ? 'font-medium text-[#22c55e]'
                            : item.qty_received > 0
                              ? 'text-[#e8913a]'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {item.qty_received} / {item.qty_ordered}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!fullyReceived && item.checked && (
                        <Input
                          type="number"
                          min={0}
                          max={item.qty_ordered - item.qty_received}
                          value={item.receive_qty || ''}
                          onChange={(e) =>
                            handleReceiveQtyChange(
                              item.id,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="h-8 w-20 text-right ml-auto"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell />
                <TableCell className="font-semibold">Subtotal</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(MOCK_PO.subtotal)}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell />
                <TableCell className="text-muted-foreground">Tax</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(MOCK_PO.tax)}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell />
                <TableCell className="text-lg font-bold">Total</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right text-lg font-bold tabular-nums text-[#1e3a5f]">
                  {formatCurrency(MOCK_PO.total)}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
          <Send className="mr-2 size-4" />
          Send to Vendor
        </Button>
        <Button
          variant="outline"
          className="border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10"
          disabled={!lineItems.some((li) => li.checked && li.receive_qty > 0)}
        >
          <CheckCircle2 className="mr-2 size-4" />
          Mark Received
        </Button>
        <Button
          variant="outline"
          className="border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10"
        >
          <XCircle className="mr-2 size-4" />
          Cancel PO
        </Button>
      </div>
    </div>
  );
}
