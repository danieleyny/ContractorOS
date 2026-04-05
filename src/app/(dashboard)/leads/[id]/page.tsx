'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Edit,
  Trash2,
  ArrowRightLeft,
  Building2,
  MapPin,
  Tag,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InteractionTimeline } from '@/components/leads/InteractionTimeline';
import { LeadForm } from '@/components/leads/LeadForm';
import { cn } from '@/lib/utils';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const MOCK_LEAD = {
  id: 'l1',
  first_name: 'John',
  last_name: 'Martinez',
  company_name: 'Martinez Properties',
  email: 'john@martinez.com',
  phone: '(555) 123-4567',
  mobile: '(555) 123-9999',
  address: '450 Oak Avenue',
  city: 'Brooklyn',
  state: 'NY',
  zip: '11201',
  source: 'referral' as const,
  source_detail: 'Referred by Patricia Jackson',
  lead_temperature: 'hot' as const,
  lead_score: 78,
  assigned_to_name: 'Mike Johnson',
  stage_name: 'Estimate Sent',
  stage_color: '#e8913a',
  estimated_value: 4500000,
  project_type: 'Kitchen Remodel',
  tags: ['residential', 'high-value', 'referral'],
  notes: 'Client wants to start the project in June. Prefers modern design. Budget is flexible for premium materials.',
  created_at: '2026-03-28T16:45:00Z',
};

const MOCK_ESTIMATES = [
  { id: 'e1', name: 'Kitchen Remodel - Phase 1', amount: '$32,500', status: 'sent', date: 'Apr 2, 2026' },
  { id: 'e2', name: 'Kitchen Remodel - Full Scope', amount: '$45,000', status: 'draft', date: 'Apr 3, 2026' },
];

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const tempConfig: Record<string, { label: string; color: string; dot: string }> = {
  hot: { label: 'Hot', color: 'text-red-600', dot: 'bg-red-500' },
  warm: { label: 'Warm', color: 'text-[#e8913a]', dot: 'bg-[#e8913a]' },
  cold: { label: 'Cold', color: 'text-blue-600', dot: 'bg-blue-500' },
  dead: { label: 'Dead', color: 'text-gray-500', dot: 'bg-gray-400' },
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function LeadDetailPage() {
  const params = useParams();
  const [showEdit, setShowEdit] = useState(false);
  const lead = MOCK_LEAD; // In production, fetch by params.id

  const fullName = `${lead.first_name} ${lead.last_name}`;
  const temp = tempConfig[lead.lead_temperature] || tempConfig.cold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={fullName}
        breadcrumbs={[
          { label: 'Leads', href: '/leads' },
          { label: fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit className="mr-1.5 size-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-1.5 size-4" />
              Delete
            </Button>
            <Button size="sm" className="bg-[#e8913a] hover:bg-[#e8913a]/90">
              <ArrowRightLeft className="mr-1.5 size-4" />
              Convert to Project
            </Button>
          </div>
        }
      />

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Phone className="mr-1.5 size-4" />
          Call
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="mr-1.5 size-4" />
          Email
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-1.5 size-4" />
          Schedule Meeting
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="mr-1.5 size-4" />
          Create Estimate
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2/3): Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white p-5">
            <InteractionTimeline />
          </div>
        </div>

        {/* Right column (1/3): Info cards */}
        <div className="space-y-5">
          {/* Contact info card */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lead.company_name || '--'}</p>
                  <p className="text-xs text-muted-foreground">Company</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-[#1e3a5f] hover:underline">
                    {lead.email}
                  </a>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lead.phone}</p>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {lead.mobile && (
                    <>
                      <p className="mt-1 text-sm font-medium">{lead.mobile}</p>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lead.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.city}, {lead.state} {lead.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead info card */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Lead Info
            </h3>
            <div className="space-y-4">
              {/* Stage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stage</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: lead.stage_color }}
                >
                  {lead.stage_name}
                </span>
              </div>

              {/* Temperature */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', temp.dot)} />
                  <span className={cn('text-sm font-medium', temp.color)}>
                    {temp.label}
                  </span>
                </div>
              </div>

              {/* Lead Score */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lead Score</span>
                  <span className="text-sm font-semibold">{lead.lead_score}/100</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#1e3a5f]"
                    style={{ width: `${lead.lead_score}%` }}
                  />
                </div>
              </div>

              {/* Source */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium capitalize">{lead.source}</span>
              </div>
              {lead.source_detail && (
                <p className="text-xs text-muted-foreground">{lead.source_detail}</p>
              )}

              {/* Assigned to */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assigned To</span>
                <span className="text-sm font-medium">{lead.assigned_to_name}</span>
              </div>

              {/* Value */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Value</span>
                <span className="text-sm font-bold text-[#1e3a5f]">
                  {formatCurrency(lead.estimated_value)}
                </span>
              </div>

              {/* Project type */}
              {lead.project_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Project Type</span>
                  <span className="text-sm font-medium">{lead.project_type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Linked estimates card */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Linked Estimates
            </h3>
            {MOCK_ESTIMATES.length > 0 ? (
              <div className="space-y-2.5">
                {MOCK_ESTIMATES.map((est) => (
                  <div
                    key={est.id}
                    className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{est.name}</p>
                      <p className="text-xs text-muted-foreground">{est.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{est.amount}</p>
                      <StatusBadge status={est.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked estimates.</p>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="mr-1 size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-xl border bg-white p-5">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Notes
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <LeadForm
        open={showEdit}
        onOpenChange={setShowEdit}
        initialData={{
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company_name: lead.company_name,
          email: lead.email,
          phone: lead.phone,
          mobile: lead.mobile,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip: lead.zip,
          source: lead.source,
          source_detail: lead.source_detail,
          lead_temperature: lead.lead_temperature,
          notes: lead.notes,
          tags: lead.tags,
        } as any}
        onSubmit={(data) => {
          console.log('Update lead:', data);
          setShowEdit(false);
        }}
      />
    </div>
  );
}
