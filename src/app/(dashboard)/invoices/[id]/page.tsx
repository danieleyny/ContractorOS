'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PaymentMethod } from '@/lib/types';

// -------------------------------------------------------------------
// Mock payment history
// -------------------------------------------------------------------

interface MockPayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string;
  notes: string;
}

const MOCK_PAYMENTS: MockPayment[] = [
  {
    id: 'pay1',
    amount: 10000,
    payment_date: '2026-03-15',
    payment_method: 'check',
    reference_number: 'CHK-4521',
    notes: 'First progress payment',
  },
  {
    id: 'pay2',
    amount: 5000,
    payment_date: '2026-03-28',
    payment_method: 'ach',
    reference_number: 'ACH-88712',
    notes: 'Second progress payment',
  },
];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const invoiceNumber = invoiceId === 'new' ? 1009 : 1001;

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

  const formatMethod = (method: PaymentMethod) =>
    method
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoiceId === 'new' ? 'New Invoice' : `Invoice #${invoiceNumber}`}
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          {
            label:
              invoiceId === 'new'
                ? 'New Invoice'
                : `Invoice #${invoiceNumber}`,
          },
        ]}
      />

      <InvoiceBuilder
        initialData={
          invoiceId === 'new'
            ? { invoice_number: 1009, status: 'draft', line_items: [] }
            : undefined
        }
        onSave={(data) => console.log('Save draft:', data)}
        onSend={(data) => console.log('Send invoice:', data)}
        onRecordPayment={(data) => console.log('Record payment:', data)}
      />

      {/* Payment History */}
      {invoiceId !== 'new' && (
        <div className="rounded-xl bg-white light-card shadow-sm ring-1 ring-foreground/10">
          <div className="border-b p-5">
            <h3 className="font-semibold">Payment History</h3>
          </div>
          <div className="divide-y">
            {MOCK_PAYMENTS.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No payments recorded yet.
              </div>
            ) : (
              MOCK_PAYMENTS.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#22c55e]/10">
                      <CheckCircle className="size-4 text-[#22c55e]" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.payment_date)} &middot;{' '}
                        {formatMethod(payment.payment_method)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-muted-foreground">
                      {payment.reference_number}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {MOCK_PAYMENTS.length > 0 && (
            <div className="border-t bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Paid
                </span>
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-[#22c55e]" />
                  <span className="font-semibold tabular-nums text-[#22c55e]">
                    {formatCurrency(
                      MOCK_PAYMENTS.reduce((s, p) => s + p.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
