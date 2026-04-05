'use client';

import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  Send,
  Save,
  FileText,
  CreditCard,
  CalendarDays,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import type {
  InvoiceType,
  InvoiceStatus,
  PaymentTerms,
  PaymentMethod,
} from '@/lib/types';

// -------------------------------------------------------------------
// Schema
// -------------------------------------------------------------------

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be > 0'),
  unit_price: z.number().min(0, 'Unit price must be >= 0'),
  budget_item_id: z.string().optional(),
});

const invoiceSchema = z.object({
  invoice_number: z.number().int().positive(),
  status: z.string() as z.ZodType<InvoiceStatus>,
  type: z.string() as z.ZodType<InvoiceType>,
  contact_id: z.string().min(1, 'Client is required'),
  project_id: z.string().min(1, 'Project is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  payment_terms: z.string() as z.ZodType<PaymentTerms>,
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  payment_instructions: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be > 0'),
  payment_date: z.string().min(1, 'Date is required'),
  payment_method: z.string() as z.ZodType<PaymentMethod>,
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Anderson Residence' },
  { id: 'c2', name: 'Metro Commercial LLC' },
  { id: 'c3', name: 'Greenfield Development' },
  { id: 'c4', name: 'Summit Properties' },
];

const MOCK_PROJECTS = [
  { id: 'p1', name: 'Kitchen Remodel - Anderson' },
  { id: 'p2', name: 'Office Build-Out Phase 2' },
  { id: 'p3', name: 'Greenfield Townhomes' },
  { id: 'p4', name: 'Summit Retail Renovation' },
];

const MOCK_BUDGET_ITEMS = [
  { id: 'b1', label: 'Framing - Labor' },
  { id: 'b2', label: 'Electrical - Materials' },
  { id: 'b3', label: 'Plumbing - Rough In' },
  { id: 'b4', label: 'Drywall Installation' },
];

const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: 'progress', label: 'Progress' },
  { value: 'final', label: 'Final' },
  { value: 'retainage', label: 'Retainage' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'deposit', label: 'Deposit' },
];

const PAYMENT_TERMS: { value: PaymentTerms; label: string; days: number }[] = [
  { value: 'due_on_receipt', label: 'Due on Receipt', days: 0 },
  { value: 'net_15', label: 'Net 15', days: 15 },
  { value: 'net_30', label: 'Net 30', days: 30 },
  { value: 'net_45', label: 'Net 45', days: 45 },
  { value: 'net_60', label: 'Net 60', days: 60 },
  { value: 'custom', label: 'Custom', days: 0 },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
];

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface InvoiceBuilderProps {
  initialData?: Partial<InvoiceFormValues> & { status?: InvoiceStatus };
  onSave?: (data: InvoiceFormValues) => void;
  onSend?: (data: InvoiceFormValues) => void;
  onRecordPayment?: (data: PaymentFormValues) => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function InvoiceBuilder({
  initialData,
  onSave,
  onSend,
  onRecordPayment,
}: InvoiceBuilderProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const defaultValues: InvoiceFormValues = {
    invoice_number: initialData?.invoice_number ?? 1001,
    status: (initialData?.status as InvoiceStatus) ?? 'draft',
    type: (initialData?.type as InvoiceType) ?? 'progress',
    contact_id: initialData?.contact_id ?? 'c1',
    project_id: initialData?.project_id ?? 'p1',
    issue_date: initialData?.issue_date ?? new Date().toISOString().split('T')[0],
    due_date: initialData?.due_date ?? '',
    payment_terms: (initialData?.payment_terms as PaymentTerms) ?? 'net_30',
    tax_rate: initialData?.tax_rate ?? 8.25,
    notes: initialData?.notes ?? '',
    payment_instructions:
      initialData?.payment_instructions ??
      'Please make checks payable to ContractorOS LLC.\nBank: First National Bank\nAccount: XXXX-1234\nRouting: 021000021',
    line_items: initialData?.line_items ?? [
      {
        description: 'Demolition and site prep - Phase 1',
        quantity: 1,
        unit_price: 4500,
        budget_item_id: 'b1',
      },
      {
        description: 'Framing labor - 120 hours @ $75/hr',
        quantity: 120,
        unit_price: 75,
        budget_item_id: 'b1',
      },
      {
        description: 'Electrical rough-in materials',
        quantity: 1,
        unit_price: 3200,
        budget_item_id: 'b2',
      },
      {
        description: 'Plumbing rough-in labor and materials',
        quantity: 1,
        unit_price: 5800,
        budget_item_id: 'b3',
      },
    ],
  };

  const form = useForm<InvoiceFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'line_items',
  });

  const paymentForm = useForm<PaymentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'check',
      reference_number: '',
      notes: '',
    },
  });

  const watchLineItems = form.watch('line_items');
  const watchTaxRate = form.watch('tax_rate');
  const watchStatus = form.watch('status');
  const watchPaymentTerms = form.watch('payment_terms');
  const watchIssueDate = form.watch('issue_date');

  const subtotal = useMemo(() => {
    return (watchLineItems || []).reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
      0
    );
  }, [watchLineItems]);

  const taxAmount = useMemo(() => {
    return subtotal * ((watchTaxRate || 0) / 100);
  }, [subtotal, watchTaxRate]);

  const total = subtotal + taxAmount;

  // Auto-calculate due date when payment terms or issue date changes
  React.useEffect(() => {
    if (watchIssueDate && watchPaymentTerms !== 'custom') {
      const termConfig = PAYMENT_TERMS.find((t) => t.value === watchPaymentTerms);
      if (termConfig) {
        const issueDate = new Date(watchIssueDate);
        issueDate.setDate(issueDate.getDate() + termConfig.days);
        form.setValue('due_date', issueDate.toISOString().split('T')[0]);
      }
    }
  }, [watchIssueDate, watchPaymentTerms, form]);

  const handleSave = form.handleSubmit((data: InvoiceFormValues) => {
    onSave?.(data);
  });

  const handleSend = form.handleSubmit((data: InvoiceFormValues) => {
    onSend?.(data);
  });

  const handleRecordPayment = paymentForm.handleSubmit((data: PaymentFormValues) => {
    onRecordPayment?.(data);
    setPaymentDialogOpen(false);
    paymentForm.reset();
  });

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Invoice #</Label>
            <Input
              {...form.register('invoice_number')}
              className="mt-1 w-28 font-mono font-semibold"
            />
          </div>
          <StatusBadge status={watchStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Client</Label>
            <Select
              value={form.watch('contact_id')}
              onValueChange={(v) => form.setValue('contact_id', v ?? '')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <Label className="text-xs text-muted-foreground">Project</Label>
            <Select
              value={form.watch('project_id')}
              onValueChange={(v) => form.setValue('project_id', v ?? '')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PROJECTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Type, Dates, Terms */}
      <div className="grid gap-4 rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10 sm:grid-cols-4">
        <div>
          <Label className="text-xs text-muted-foreground">Invoice Type</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(v) => form.setValue('type', (v ?? 'progress') as InvoiceType)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Issue Date</Label>
          <div className="relative mt-1">
            <CalendarDays className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input {...form.register('issue_date')} type="date" className="pl-9" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Payment Terms</Label>
          <Select
            value={form.watch('payment_terms')}
            onValueChange={(v) => form.setValue('payment_terms', (v ?? 'net_30') as PaymentTerms)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Due Date</Label>
          <div className="relative mt-1">
            <CalendarDays className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register('due_date')}
              type="date"
              className="pl-9"
              disabled={watchPaymentTerms !== 'custom'}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl bg-white light-card shadow-sm ring-1 ring-foreground/10">
        <div className="border-b p-5">
          <h3 className="font-semibold">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[300px]">Description</TableHead>
                <TableHead className="w-[100px] text-right">Qty</TableHead>
                <TableHead className="w-[140px] text-right">Unit Price ($)</TableHead>
                <TableHead className="w-[140px] text-right">Total ($)</TableHead>
                <TableHead className="w-[160px]">Budget Item</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const qty = form.watch(`line_items.${index}.quantity`) || 0;
                const price = form.watch(`line_items.${index}.unit_price`) || 0;
                const lineTotal = qty * price;
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        {...form.register(`line_items.${index}.description`)}
                        placeholder="Item description"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...form.register(`line_items.${index}.quantity`)}
                        type="number"
                        step="0.01"
                        className="border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...form.register(`line_items.${index}.unit_price`)}
                        type="number"
                        step="0.01"
                        className="border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(lineTotal)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={form.watch(`line_items.${index}.budget_item_id`) || ''}
                        onValueChange={(v) =>
                          form.setValue(`line_items.${index}.budget_item_id`, v ?? undefined)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <Link2 className="mr-1 size-3" />
                          <SelectValue placeholder="Link..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_BUDGET_ITEMS.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-[#ef4444]"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#1e3a5f]"
                    onClick={() =>
                      append({
                        description: '',
                        quantity: 1,
                        unit_price: 0,
                        budget_item_id: undefined,
                      })
                    }
                  >
                    <Plus className="mr-1 size-4" />
                    Add Line Item
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Totals */}
        <div className="border-t p-5">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tax</span>
                <Input
                  {...form.register('tax_rate')}
                  type="number"
                  step="0.01"
                  className="h-7 w-16 text-right text-xs"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <span className="font-medium tabular-nums">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums text-[#1e3a5f]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Payment Instructions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            {...form.register('notes')}
            placeholder="Notes visible to client..."
            className="mt-1 min-h-[100px]"
          />
        </div>
        <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
          <Label className="text-xs text-muted-foreground">Payment Instructions</Label>
          <Textarea
            {...form.register('payment_instructions')}
            placeholder="Payment instructions..."
            className="mt-1 min-h-[100px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={handleSave}
          className="border-[#1e3a5f]/20"
        >
          <Save className="mr-2 size-4" />
          Save Draft
        </Button>
        <Button
          onClick={handleSend}
          className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
        >
          <Send className="mr-2 size-4" />
          Send to Client
        </Button>
        <Button variant="outline">
          <FileText className="mr-2 size-4" />
          Preview PDF
        </Button>
        <Button
          variant="outline"
          className="border-[#e8913a]/30 text-[#e8913a] hover:bg-[#e8913a]/10"
          onClick={() => setPaymentDialogOpen(true)}
        >
          <CreditCard className="mr-2 size-4" />
          Record Payment
        </Button>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Amount ($)</Label>
              <Input
                {...paymentForm.register('amount')}
                type="number"
                step="0.01"
                className="mt-1"
                placeholder="0.00"
              />
              {paymentForm.formState.errors.amount && (
                <p className="mt-1 text-xs text-[#ef4444]">
                  {paymentForm.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                {...paymentForm.register('payment_date')}
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select
                value={paymentForm.watch('payment_method')}
                onValueChange={(v) =>
                  paymentForm.setValue('payment_method', (v ?? 'check') as PaymentMethod)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference #</Label>
              <Input
                {...paymentForm.register('reference_number')}
                className="mt-1"
                placeholder="Check #, transaction ID, etc."
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                {...paymentForm.register('notes')}
                className="mt-1"
                placeholder="Payment notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
