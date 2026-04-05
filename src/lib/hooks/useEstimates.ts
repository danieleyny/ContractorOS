'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Estimate,
  EstimateSection,
  EstimateLineItem,
  EstimateStatus,
  InsertDTO,
} from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface EstimateWithDetails extends Estimate {
  sections: (EstimateSection & { line_items: EstimateLineItem[] })[];
  client_name: string;
}

interface EstimatesParams {
  search?: string;
  status?: EstimateStatus | 'all';
  contact_id?: string;
  project_id?: string;
  sort?: string;
  order?: string;
}

interface EstimatesResponse {
  data: EstimateWithDetails[];
  count: number;
}

// -------------------------------------------------------------------
// Fetchers
// -------------------------------------------------------------------

async function fetchEstimates(params: EstimatesParams): Promise<EstimatesResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.contact_id) searchParams.set('contact_id', params.contact_id);
  if (params.project_id) searchParams.set('project_id', params.project_id);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);

  const res = await fetch(`/api/estimates?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch estimates');
  return res.json();
}

async function fetchEstimate(id: string): Promise<EstimateWithDetails> {
  const res = await fetch(`/api/estimates?search=${id}`);
  if (!res.ok) throw new Error('Failed to fetch estimate');
  const json = await res.json();
  const estimate = json.data?.find((e: EstimateWithDetails) => e.id === id);
  if (!estimate) throw new Error('Estimate not found');
  return estimate;
}

async function createEstimate(
  body: Partial<InsertDTO<Estimate>> & { client_name?: string; sections?: unknown[] }
): Promise<EstimateWithDetails> {
  const res = await fetch('/api/estimates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create estimate');
  const json = await res.json();
  return json.data;
}

async function updateEstimate({
  id,
  ...body
}: { id: string } & Partial<Estimate>): Promise<EstimateWithDetails> {
  // Mock: in production this would be a PATCH/PUT request
  const res = await fetch(`/api/estimates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, id }),
  });
  if (!res.ok) throw new Error('Failed to update estimate');
  const json = await res.json();
  return json.data;
}

async function duplicateEstimate(id: string): Promise<EstimateWithDetails> {
  const original = await fetchEstimate(id);
  const duplicate = {
    ...original,
    name: `${original.name} (Copy)`,
    status: 'draft' as EstimateStatus,
    estimate_number: undefined,
    sent_at: null,
    viewed_at: null,
    approved_at: null,
  };
  return createEstimate(duplicate);
}

// -------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------

export function useEstimates(params: EstimatesParams = {}) {
  return useQuery({
    queryKey: ['estimates', params],
    queryFn: () => fetchEstimates(params),
  });
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimates', id],
    queryFn: () => fetchEstimate(id),
    enabled: !!id,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
}

export function useDuplicateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
}
