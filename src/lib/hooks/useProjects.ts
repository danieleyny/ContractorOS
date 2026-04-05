'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Project,
  ProjectBudgetItem,
  Task,
  InsertDTO,
} from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface ProjectsParams {
  search?: string;
  status?: string;
  assigned_pm?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

interface ProjectsResponse {
  data: Project[];
  count: number;
  limit: number;
  offset: number;
}

// -------------------------------------------------------------------
// Fetchers
// -------------------------------------------------------------------

async function fetchProjects(params: ProjectsParams): Promise<ProjectsResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.assigned_pm) searchParams.set('assigned_pm', params.assigned_pm);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`/api/projects?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects?search=${id}&limit=1`);
  if (!res.ok) throw new Error('Failed to fetch project');
  const json = await res.json();
  return json.data?.[0];
}

async function createProject(body: InsertDTO<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create project');
  const json = await res.json();
  return json.data;
}

async function updateProject({
  id,
  ...body
}: Partial<Project> & { id: string }): Promise<Project> {
  const res = await fetch(`/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...body }),
  });
  if (!res.ok) throw new Error('Failed to update project');
  const json = await res.json();
  return json.data;
}

// -------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------

export function useProjects(params: ProjectsParams = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useProjectBudget(projectId: string) {
  return useQuery<ProjectBudgetItem[]>({
    queryKey: ['projects', projectId, 'budget'],
    queryFn: async () => {
      const res = await fetch(`/api/projects?search=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      return [];
    },
    enabled: !!projectId,
  });
}

export function useProjectTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['projects', projectId, 'tasks'],
    queryFn: async () => {
      const res = await fetch(`/api/projects?search=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return [];
    },
    enabled: !!projectId,
  });
}
