'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadTemperature } from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface LeadCardData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  lead_temperature: LeadTemperature | null;
  estimated_value: number; // cents
  days_in_stage: number;
  assigned_user_name: string | null;
  project_type?: string | null;
  stage_id: string;
}

interface LeadCardProps {
  lead: LeadCardData;
  overlay?: boolean;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const tempColors: Record<string, string> = {
  hot: 'bg-red-500',
  warm: 'bg-[#e8913a]',
  cold: 'bg-blue-500',
  dead: 'bg-gray-400',
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function LeadCard({ lead, overlay = false }: LeadCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: 'lead', lead },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unnamed';

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={() => router.push(`/leads/${lead.id}`)}
      className={cn(
        'group cursor-pointer rounded-lg border bg-white light-card p-3 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-[#1e3a5f]/20',
        isDragging && 'ring-2 ring-[#e8913a]',
        overlay && 'shadow-lg ring-2 ring-[#e8913a]'
      )}
    >
      {/* Top row: name + temp indicator */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {fullName}
          </p>
          {lead.company_name && (
            <p className="truncate text-xs text-muted-foreground">
              {lead.company_name}
            </p>
          )}
        </div>
        {lead.lead_temperature && (
          <span
            className={cn(
              'mt-1 inline-block size-2.5 shrink-0 rounded-full',
              tempColors[lead.lead_temperature] || 'bg-gray-300'
            )}
            title={lead.lead_temperature}
          />
        )}
      </div>

      {/* Project type */}
      {lead.project_type && (
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          {lead.project_type}
        </p>
      )}

      {/* Value + days in stage */}
      <div className="mt-2.5 flex items-center justify-between text-xs">
        {lead.estimated_value > 0 && (
          <span className="flex items-center gap-1 font-medium text-[#1e3a5f]">
            <DollarSign className="size-3" />
            {formatCurrency(lead.estimated_value)}
          </span>
        )}
        <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
          <Clock className="size-3" />
          {lead.days_in_stage}d
        </span>
      </div>

      {/* Bottom row: assigned avatar + quick actions */}
      <div className="mt-2.5 flex items-center justify-between">
        {lead.assigned_user_name ? (
          <div
            className="flex size-6 items-center justify-center rounded-full bg-[#1e3a5f] text-[10px] font-medium text-white"
            title={lead.assigned_user_name}
          >
            {getInitials(lead.assigned_user_name)}
          </div>
        ) : (
          <div className="size-6" />
        )}

        {/* Quick actions on hover */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {lead.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${lead.phone}`);
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-[#1e3a5f]"
              title="Call"
            >
              <Phone className="size-3.5" />
            </button>
          )}
          {lead.email && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${lead.email}`);
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-[#1e3a5f]"
              title="Email"
            >
              <Mail className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
