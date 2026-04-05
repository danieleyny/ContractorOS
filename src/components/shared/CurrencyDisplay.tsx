import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

function formatCents(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CurrencyDisplay({
  amount,
  className,
  showSign = false,
}: CurrencyDisplayProps) {
  const formatted = formatCents(amount);
  const isNegative = amount < 0;
  const isPositive = amount > 0;

  let display = formatted;
  if (showSign && isPositive) {
    display = `+${formatted}`;
  } else if (isNegative) {
    display = `-${formatted}`;
  }

  return (
    <span
      className={cn(
        'tabular-nums',
        showSign && isPositive && 'text-[#22c55e]',
        showSign && isNegative && 'text-[#ef4444]',
        className
      )}
    >
      {display}
    </span>
  );
}
