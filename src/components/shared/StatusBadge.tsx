import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const statusToVariant: Record<string, StatusVariant> = {
  approved: 'success',
  completed: 'success',
  paid: 'success',
  passed: 'success',
  active: 'success',
  pending: 'default',
  draft: 'default',
  scheduled: 'default',
  new: 'default',
  overdue: 'danger',
  rejected: 'danger',
  failed: 'danger',
  cancelled: 'danger',
  expired: 'danger',
  in_progress: 'info',
  sent: 'info',
  viewed: 'info',
  review: 'info',
  on_hold: 'warning',
  expiring_soon: 'warning',
  at_risk: 'warning',
};

const variantStyles: Record<StatusVariant, string> = {
  default: 'bg-muted text-muted-foreground border-muted',
  success: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  warning: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  danger: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
  info: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20',
};

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant ?? statusToVariant[status.toLowerCase()] ?? 'default';
  const label = formatStatus(status);

  return (
    <Badge
      className={cn(
        'font-medium',
        variantStyles[resolvedVariant],
        className
      )}
    >
      {label}
    </Badge>
  );
}
