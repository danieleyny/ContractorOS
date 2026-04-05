'use client';

import React from 'react';
import {
  Phone,
  Mail,
  Star,
  Shield,
  FileCheck,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplianceItem {
  type: 'insurance' | 'license' | 'w9';
  label: string;
  status: 'current' | 'expiring_soon' | 'expired' | 'on_file' | 'missing';
  expiryDate?: string;
}

interface SubcontractorData {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  tradeSpecialties: string[];
  ratings: {
    quality: number;
    timeliness: number;
    communication: number;
    price: number;
    overall: number;
  };
  compliance: ComplianceItem[];
  bidHistory: {
    totalBids: number;
    winRate: number;
    averageBidAmount: number;
  };
  wouldHireAgain: boolean;
  recentProjects: string[];
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3.5',
            i < Math.floor(rating)
              ? 'fill-[#e8913a] text-[#e8913a]'
              : i < rating
                ? 'fill-[#e8913a]/50 text-[#e8913a]'
                : 'fill-muted text-muted'
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

function ComplianceStatusBadge({ item }: { item: ComplianceItem }) {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    current: { color: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20', icon: CheckCircle2, label: 'Current' },
    expiring_soon: { color: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20', icon: AlertTriangle, label: 'Expiring Soon' },
    expired: { color: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20', icon: XCircle, label: 'Expired' },
    on_file: { color: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20', icon: CheckCircle2, label: 'On File' },
    missing: { color: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20', icon: XCircle, label: 'Missing' },
  };

  const cfg = config[item.status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {item.type === 'insurance' && <Shield className="size-3.5 text-muted-foreground" />}
        {item.type === 'license' && <FileCheck className="size-3.5 text-muted-foreground" />}
        {item.type === 'w9' && <FileText className="size-3.5 text-muted-foreground" />}
        <span className="text-xs">{item.label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {item.expiryDate && (
          <span className="text-[10px] text-muted-foreground">{item.expiryDate}</span>
        )}
        <Badge className={cn('gap-0.5 text-[10px]', cfg.color)}>
          <Icon className="size-2.5" />
          {cfg.label}
        </Badge>
      </div>
    </div>
  );
}

interface SubcontractorProfileProps {
  data: SubcontractorData;
  compact?: boolean;
  onClick?: () => void;
}

export type { SubcontractorData, ComplianceItem };

export function SubcontractorProfile({ data, compact = false, onClick }: SubcontractorProfileProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white light-card shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
              <Building2 className="size-5 text-[#1e3a5f]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{data.companyName}</h3>
              <p className="text-xs text-muted-foreground">{data.contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-[#e8913a]/10 px-2 py-1">
            <Star className="size-4 fill-[#e8913a] text-[#e8913a]" />
            <span className="text-sm font-bold text-[#e8913a]">
              {data.ratings.overall.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone className="size-3" />
            {data.phone}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="size-3" />
            {data.email}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {data.tradeSpecialties.map((trade) => (
            <Badge
              key={trade}
              className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20 text-[10px]"
            >
              {trade}
            </Badge>
          ))}
        </div>
      </div>

      {!compact && (
        <>
          {/* Ratings */}
          <div className="border-b px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Performance</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
              <div className="flex items-center justify-between">
                <span className="text-xs">Quality</span>
                <StarRating rating={data.ratings.quality} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Timeliness</span>
                <StarRating rating={data.ratings.timeliness} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Communication</span>
                <StarRating rating={data.ratings.communication} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Price</span>
                <StarRating rating={data.ratings.price} />
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="border-b px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Compliance</p>
            <div className="space-y-1.5">
              {data.compliance.map((item) => (
                <ComplianceStatusBadge key={item.type} item={item} />
              ))}
            </div>
          </div>

          {/* Bid History & Hire Again */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Bids</p>
                  <p className="text-sm font-bold">{data.bidHistory.totalBids}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-sm font-bold">{data.bidHistory.winRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg Bid</p>
                  <p className="text-sm font-bold">
                    ${(data.bidHistory.averageBidAmount / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                  data.wouldHireAgain
                    ? 'bg-[#22c55e]/10 text-[#22c55e]'
                    : 'bg-[#ef4444]/10 text-[#ef4444]'
                )}
              >
                {data.wouldHireAgain ? (
                  <ThumbsUp className="size-3" />
                ) : (
                  <ThumbsDown className="size-3" />
                )}
                {data.wouldHireAgain ? 'Would Hire Again' : 'Would Not Rehire'}
              </div>
            </div>

            {data.recentProjects.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold text-muted-foreground">Recent Projects</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {data.recentProjects.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
