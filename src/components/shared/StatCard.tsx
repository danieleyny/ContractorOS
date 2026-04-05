import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  description?: string;
}

const changeTypeStyles = {
  positive: {
    badge: 'bg-[#22c55e]/10 text-[#22c55e]',
    iconBg: 'bg-[#22c55e]/10 text-[#22c55e]',
  },
  negative: {
    badge: 'bg-[#ef4444]/10 text-[#ef4444]',
    iconBg: 'bg-[#ef4444]/10 text-[#ef4444]',
  },
  neutral: {
    badge: 'bg-muted text-muted-foreground',
    iconBg: 'bg-[#1e3a5f]/10 text-[#1e3a5f]',
  },
} as const;

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
}: StatCardProps) {
  const styles = changeTypeStyles[changeType];

  return (
    <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full',
              styles.iconBg
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-3 flex items-center gap-2">
          {change && (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
                styles.badge
              )}
            >
              {change}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
