'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Copy,
  Send,
  Download,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { EstimateStatus } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

interface EstimateCardProps {
  id: string;
  estimateNumber: number;
  name: string;
  clientName: string;
  status: EstimateStatus;
  totalCents: number;
  createdAt: string;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function centsToDollars(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// Component
// ============================================================================

export function EstimateCard({
  id,
  estimateNumber,
  name,
  clientName,
  status,
  totalCents,
  createdAt,
  onDuplicate,
  onDelete,
}: EstimateCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/estimates/${id}`)}
      className="group cursor-pointer rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              #{estimateNumber}
            </span>
            <StatusBadge status={status} />
          </div>
          <h3 className="font-semibold leading-tight">{name}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/estimates/${id}`); }}>
              <Edit className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(id); }}>
              <Copy className="mr-2 size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Send className="mr-2 size-4" />
              Send
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Download className="mr-2 size-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="size-3.5" />
            <span>{clientName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
        <p className="text-lg font-bold text-[#1e3a5f]">
          {centsToDollars(totalCents)}
        </p>
      </div>
    </div>
  );
}
