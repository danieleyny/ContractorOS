'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  FileText,
  Globe,
  Plus,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { InteractionType } from '@/lib/types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface TimelineEntry {
  id: string;
  type: InteractionType;
  subject: string | null;
  body: string | null;
  created_at: string;
  logged_by_name: string | null;
  direction?: 'inbound' | 'outbound' | null;
  follow_up_date?: string | null;
}

interface InteractionTimelineProps {
  interactions?: TimelineEntry[];
  onLogActivity?: (data: LogActivityValues) => void;
}

// -------------------------------------------------------------------
// Icons & colors per type
// -------------------------------------------------------------------

const TYPE_CONFIG: Record<
  InteractionType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  phone_call: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Phone Call' },
  email: { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Email' },
  sms: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100', label: 'SMS' },
  meeting: { icon: Calendar, color: 'text-[#e8913a]', bg: 'bg-[#e8913a]/10', label: 'Meeting' },
  site_visit: { icon: MapPin, color: 'text-red-600', bg: 'bg-red-100', label: 'Site Visit' },
  note: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Note' },
  form_submission: { icon: Globe, color: 'text-[#1e3a5f]', bg: 'bg-[#1e3a5f]/10', label: 'Form Submission' },
};

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const MOCK_INTERACTIONS: TimelineEntry[] = [
  {
    id: 'i1',
    type: 'phone_call',
    subject: 'Initial consultation call',
    body: 'Discussed kitchen remodel scope. Client wants granite countertops and new cabinets. Budget around $45k.',
    created_at: '2026-04-03T14:30:00Z',
    logged_by_name: 'Mike Johnson',
    direction: 'outbound',
    follow_up_date: '2026-04-07',
  },
  {
    id: 'i2',
    type: 'email',
    subject: 'Sent project overview document',
    body: 'Emailed the client our portfolio of similar kitchen remodel projects and a rough timeline estimate.',
    created_at: '2026-04-02T10:15:00Z',
    logged_by_name: 'Mike Johnson',
    direction: 'outbound',
  },
  {
    id: 'i3',
    type: 'site_visit',
    subject: 'On-site measurement & assessment',
    body: 'Took measurements of the kitchen. Noted the existing plumbing layout needs modification. Took photos for the estimate.',
    created_at: '2026-03-30T09:00:00Z',
    logged_by_name: 'Sarah Adams',
    direction: 'outbound',
  },
  {
    id: 'i4',
    type: 'form_submission',
    subject: 'Website contact form submission',
    body: 'Client submitted the kitchen remodel inquiry form from our website.',
    created_at: '2026-03-28T16:45:00Z',
    logged_by_name: null,
    direction: 'inbound',
  },
  {
    id: 'i5',
    type: 'note',
    subject: 'Internal note',
    body: 'Client was referred by Patricia Jackson (past customer). High-value lead, prioritize follow-up.',
    created_at: '2026-03-28T17:00:00Z',
    logged_by_name: 'Mike Johnson',
  },
  {
    id: 'i6',
    type: 'meeting',
    subject: 'Design consultation meeting',
    body: 'Met with client and designer to review material selections and finalize the layout.',
    created_at: '2026-04-01T11:00:00Z',
    logged_by_name: 'Sarah Adams',
    direction: 'outbound',
  },
];

// -------------------------------------------------------------------
// Log Activity Form Schema
// -------------------------------------------------------------------

const logActivitySchema = z.object({
  type: z.string().min(1, 'Type is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().optional(),
  follow_up_date: z.string().optional(),
});

type LogActivityValues = z.infer<typeof logActivitySchema>;

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function InteractionTimeline({
  interactions: propInteractions,
  onLogActivity,
}: InteractionTimelineProps) {
  const [showForm, setShowForm] = useState(false);
  const interactions = propInteractions || MOCK_INTERACTIONS;

  const sorted = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LogActivityValues>({
    resolver: zodResolver(logActivitySchema),
    defaultValues: { type: '', subject: '', body: '', follow_up_date: '' },
  });

  function handleFormSubmit(data: LogActivityValues) {
    onLogActivity?.(data);
    reset();
    setShowForm(false);
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <Button
          size="sm"
          className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-1.5 size-4" />
          Log Activity
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 h-full w-px bg-border" />

        <div className="space-y-6">
          {sorted.map((entry) => {
            const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.note;
            const Icon = config.icon;

            return (
              <div key={entry.id} className="relative flex gap-4 pl-0">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                    config.bg
                  )}
                >
                  <Icon className={cn('size-4', config.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 rounded-lg border bg-white light-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {entry.subject || config.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                        {entry.logged_by_name && ` -- ${entry.logged_by_name}`}
                        {entry.direction && (
                          <span className="ml-1 capitalize">({entry.direction})</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        config.bg,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  {entry.body && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {entry.body}
                    </p>
                  )}
                  {entry.follow_up_date && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#e8913a]">
                      <Clock className="size-3" />
                      Follow-up: {new Date(entry.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No activity logged yet. Click &quot;Log Activity&quot; to add the first entry.
        </div>
      )}

      {/* Log Activity Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record an interaction with this lead.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => v && setValue('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" {...register('subject')} placeholder="e.g. Follow-up call" />
              {errors.subject && (
                <p className="text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body">Details</Label>
              <Textarea id="body" {...register('body')} placeholder="Notes about the interaction..." rows={4} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input id="follow_up_date" type="date" {...register('follow_up_date')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                Save Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
