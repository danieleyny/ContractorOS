'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, User } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  projectNumber: number | null;
  clientName: string;
  status: string;
  projectType: string | null;
  budgetTotal: number;
  budgetSpent: number;
  completionPercentage: number;
  startDate: string | null;
  targetEndDate: string | null;
  assignedPmName: string | null;
  assignedPmAvatar: string | null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getBudgetHealthColor(percentage: number): string {
  if (percentage <= 70) return 'bg-[#22c55e]';
  if (percentage <= 90) return 'bg-[#f59e0b]';
  return 'bg-[#ef4444]';
}

export function ProjectCard({
  id,
  name,
  projectNumber,
  clientName,
  status,
  projectType,
  budgetTotal,
  budgetSpent,
  completionPercentage,
  startDate,
  targetEndDate,
  assignedPmName,
  assignedPmAvatar,
}: ProjectCardProps) {
  const router = useRouter();
  const budgetPercentage = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;

  return (
    <div
      onClick={() => router.push(`/projects/${id}`)}
      className="cursor-pointer rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {projectNumber && (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                #{projectNumber}
              </span>
            )}
            <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{clientName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Project Type */}
      {projectType && (
        <span className="mt-2 inline-block rounded-md bg-[#1e3a5f]/5 px-2 py-0.5 text-xs font-medium text-[#1e3a5f]">
          {projectType}
        </span>
      )}

      {/* Budget Health Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">
            {formatCurrency(budgetSpent)} / {formatCurrency(budgetTotal)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all', getBudgetHealthColor(budgetPercentage))}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">{budgetPercentage}% consumed</p>
      </div>

      {/* Progress */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#1e3a5f] transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {formatDate(startDate)} - {formatDate(targetEndDate)}
          </span>
        </div>
        {assignedPmName && (
          <div className="flex items-center gap-1.5">
            {assignedPmAvatar ? (
              <img
                src={assignedPmAvatar}
                alt={assignedPmName}
                className="size-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-5 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[10px] font-medium text-[#1e3a5f]">
                {assignedPmName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{assignedPmName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
