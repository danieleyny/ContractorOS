'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Contact, InsertDTO, UpdateDTO } from '@/lib/types';

interface ContactsParams {
  type?: string;
  search?: string;
  assigned_to?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

interface ContactsResponse {
  data: Contact[];
  count: number;
  limit: number;
  offset: number;
}

async function fetchContacts(params: ContactsParams): Promise<ContactsResponse> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);
  if (params.assigned_to) searchParams.set('assigned_to', params.assigned_to);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`/api/contacts?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

async function fetchContact(id: string): Promise<Contact> {
  const res = await fetch(`/api/contacts?search=${id}`);
  if (!res.ok) throw new Error('Failed to fetch contact');
  const json = await res.json();
  return json.data?.[0];
}

async function createContact(body: InsertDTO<Contact>): Promise<Contact> {
  const res = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create contact');
  const json = await res.json();
  return json.data;
}

async function updateContact({
  id,
  ...body
}: UpdateDTO<Contact> & { id: string }): Promise<Contact> {
  const res = await fetch(`/api/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update contact');
  const json = await res.json();
  return json.data;
}

async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete contact');
}

export function useContacts(params: ContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => fetchContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => fetchContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
