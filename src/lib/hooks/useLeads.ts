'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Contact,
  LeadPipelineStage,
  LeadStageHistory,
  InsertDTO,
} from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface LeadWithStage extends Contact {
  lead_stage_history: (LeadStageHistory & {
    lead_pipeline_stages: LeadPipelineStage;
  })[];
}

interface LeadsParams {
  search?: string;
  source?: string;
  temperature?: string;
  assigned_to?: string;
  stage_id?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

interface LeadsResponse {
  data: LeadWithStage[];
  count: number;
  limit: number;
  offset: number;
}

interface LeadsByStageMap {
  [stageId: string]: LeadWithStage[];
}

// -------------------------------------------------------------------
// Fetchers
// -------------------------------------------------------------------

async function fetchLeads(params: LeadsParams): Promise<LeadsResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.source) searchParams.set('source', params.source);
  if (params.temperature) searchParams.set('temperature', params.temperature);
  if (params.assigned_to) searchParams.set('assigned_to', params.assigned_to);
  if (params.stage_id) searchParams.set('stage_id', params.stage_id);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`/api/leads?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

async function fetchPipelineStages(): Promise<LeadPipelineStage[]> {
  const res = await fetch('/api/leads/stages');
  if (!res.ok) throw new Error('Failed to fetch pipeline stages');
  const json = await res.json();
  return json.data;
}

async function moveLeadStage({
  contactId,
  fromStageId,
  toStageId,
  movedBy,
}: {
  contactId: string;
  fromStageId: string;
  toStageId: string;
  movedBy?: string;
}): Promise<void> {
  const res = await fetch('/api/leads/move-stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactId, fromStageId, toStageId, movedBy }),
  });
  if (!res.ok) throw new Error('Failed to move lead stage');
}

async function createLead(body: {
  contact: InsertDTO<Contact>;
  stage_id: string;
}): Promise<Contact> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create lead');
  const json = await res.json();
  return json.data;
}

// -------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------

export function useLeads(params: LeadsParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
  });
}

export function useLeadsByStage() {
  return useQuery({
    queryKey: ['leads', 'by-stage'],
    queryFn: async (): Promise<LeadsByStageMap> => {
      const { data: leads } = await fetchLeads({ limit: 500 });
      const grouped: LeadsByStageMap = {};
      for (const lead of leads) {
        const currentStage = lead.lead_stage_history?.[0];
        if (currentStage) {
          const stageId = currentStage.stage_id;
          if (!grouped[stageId]) grouped[stageId] = [];
          grouped[stageId].push(lead);
        }
      }
      return grouped;
    },
  });
}

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: fetchPipelineStages,
  });
}

export function useMoveLeadStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveLeadStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
