'use client';

import React from 'react';
import { MoreHorizontal, Send, FileText, CreditCard, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { InvoiceStatus } from '@/lib/types';

interface InvoiceCardProps {
  invoiceNumber: number;
  clientName: string;
  projectName: string;
  status: InvoiceStatus;
  amount: number; // dollars
  dueDate: string; // ISO date string
  amountPaid: number;
  onView?: () => void;
  onSend?: () => void;
  onRecordPayment?: () => void;
  onVoid?: () => void;
}

export function InvoiceCard({
  invoiceNumber,
  clientName,
  projectName,
  status,
  amount,
  dueDate,
  amountPaid,
  onView,
  onSend,
  onRecordPayment,
  onVoid,
}: InvoiceCardProps) {
  const isOverdue =
    status !== 'paid' &&
    status !== 'void' &&
    new Date(dueDate) < new Date();

  const balance = amount - amountPaid;

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
    <div
      className="flex items-center justify-between rounded-xl bg-white light-card p-4 shadow-sm ring-1 ring-foreground/10 transition-colors hover:bg-muted/30 cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#1e3a5f]/10">
          <FileText className="size-5 text-[#1e3a5f]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">INV-{invoiceNumber}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {clientName} &middot; {projectName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold tabular-nums">{formatCurrency(amount)}</p>
          {isOverdue ? (
            <p className="text-xs font-medium text-[#ef4444]">
              Overdue &middot; Due {formatDate(dueDate)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Due {formatDate(dueDate)}</p>
          )}
          {amountPaid > 0 && status !== 'paid' && (
            <p className="text-xs text-muted-foreground">
              Balance: {formatCurrency(balance)}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <FileText className="mr-2 size-4" />
              View Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSend}>
              <Send className="mr-2 size-4" />
              Send to Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRecordPayment}>
              <CreditCard className="mr-2 size-4" />
              Record Payment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onVoid}
              className="text-[#ef4444] focus:text-[#ef4444]"
            >
              <XCircle className="mr-2 size-4" />
              Void Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
