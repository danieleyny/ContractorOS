'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Invoice,
  InvoiceLineItem,
  Payment,
  Contact,
  Project,
  InsertDTO,
} from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface InvoiceWithRelations extends Invoice {
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'company_name' | 'email'>;
  projects: Pick<Project, 'id' | 'name' | 'project_number'>;
  invoice_line_items?: InvoiceLineItem[];
  payments?: Payment[];
}

interface InvoicesParams {
  search?: string;
  status?: string;
  project_id?: string;
  contact_id?: string;
  type?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

interface InvoicesResponse {
  data: InvoiceWithRelations[];
  count: number;
  limit: number;
  offset: number;
}

// -------------------------------------------------------------------
// Fetchers
// -------------------------------------------------------------------

async function fetchInvoices(params: InvoicesParams): Promise<InvoicesResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.project_id) searchParams.set('project_id', params.project_id);
  if (params.contact_id) searchParams.set('contact_id', params.contact_id);
  if (params.type) searchParams.set('type', params.type);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`/api/invoices?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

async function fetchInvoice(id: string): Promise<InvoiceWithRelations> {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice');
  const json = await res.json();
  return json.data;
}

async function createInvoice(
  body: InsertDTO<Invoice> & { line_items?: InsertDTO<InvoiceLineItem>[] }
): Promise<Invoice> {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  const json = await res.json();
  return json.data;
}

async function updateInvoice({
  id,
  ...data
}: { id: string } & Partial<InsertDTO<Invoice>>): Promise<Invoice> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  const json = await res.json();
  return json.data;
}

async function sendInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/invoices/${id}/send`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to send invoice');
}

async function recordPayment(body: InsertDTO<Payment>): Promise<Payment> {
  const res = await fetch(`/api/invoices/${body.invoice_id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to record payment');
  const json = await res.json();
  return json.data;
}

// -------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------

export function useInvoices(params: InvoicesParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
