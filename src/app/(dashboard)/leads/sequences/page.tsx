'use client';

import React, { useState } from 'react';
import {
  Plus,
  Play,
  Pause,
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  ClipboardList,
  Clock,
  ArrowDown,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface SequenceStep {
  id: string;
  type: 'email' | 'sms' | 'task';
  delay_days: number;
  subject?: string;
  body?: string;
  task_description?: string;
  assign_to?: string;
}

interface SequenceCard {
  id: string;
  name: string;
  description: string;
  trigger_stage: string;
  steps_count: number;
  active_leads: number;
  is_active: boolean;
}

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const MOCK_SEQUENCES: SequenceCard[] = [
  {
    id: 'seq1',
    name: 'New Lead Nurture',
    description: 'Automated follow-up for new website inquiries',
    trigger_stage: 'New Inquiry',
    steps_count: 5,
    active_leads: 12,
    is_active: true,
  },
  {
    id: 'seq2',
    name: 'Post-Estimate Follow-Up',
    description: 'Follow up after sending an estimate to keep leads warm',
    trigger_stage: 'Estimate Sent',
    steps_count: 3,
    active_leads: 8,
    is_active: true,
  },
  {
    id: 'seq3',
    name: 'Cold Lead Reactivation',
    description: 'Re-engage leads that have gone cold after 30 days',
    trigger_stage: 'Contacted',
    steps_count: 4,
    active_leads: 0,
    is_active: false,
  },
];

const MOCK_STAGES = [
  { id: 's1', name: 'New Inquiry' },
  { id: 's2', name: 'Contacted' },
  { id: 's3', name: 'Estimate Sent' },
  { id: 's4', name: 'Negotiation' },
];

const MOCK_USERS = [
  { id: 'u1', name: 'Mike Johnson' },
  { id: 'u2', name: 'Sarah Adams' },
  { id: 'u3', name: 'Tom Rivera' },
];

const STEP_TYPE_CONFIG = {
  email: { icon: Mail, label: 'Email', color: 'text-purple-600', bg: 'bg-purple-100' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-green-600', bg: 'bg-green-100' },
  task: { icon: ClipboardList, label: 'Internal Task', color: 'text-[#e8913a]', bg: 'bg-[#e8913a]/10' },
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function SequencesPage() {
  const [sequences, setSequences] = useState<SequenceCard[]>(MOCK_SEQUENCES);
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder state
  const [seqName, setSeqName] = useState('');
  const [seqDescription, setSeqDescription] = useState('');
  const [seqTrigger, setSeqTrigger] = useState('');
  const [steps, setSteps] = useState<SequenceStep[]>([
    {
      id: 'step-1',
      type: 'email',
      delay_days: 0,
      subject: 'Thanks for reaching out, {{first_name}}!',
      body: 'Hi {{first_name}},\n\nThank you for contacting us about your {{project_type}} project. We received your inquiry and one of our specialists will be in touch within 24 hours.\n\nBest regards,\n{{company_name}}',
    },
    {
      id: 'step-2',
      type: 'task',
      delay_days: 1,
      task_description: 'Call new lead to discuss project requirements',
      assign_to: 'u1',
    },
    {
      id: 'step-3',
      type: 'email',
      delay_days: 3,
      subject: 'Did you have any questions, {{first_name}}?',
      body: 'Hi {{first_name}},\n\nI wanted to follow up on your {{project_type}} inquiry. Do you have any questions about our process or would you like to schedule a free consultation?\n\nFeel free to reply to this email or call us at {{company_phone}}.\n\nBest,\n{{assigned_user}}',
    },
    {
      id: 'step-4',
      type: 'sms',
      delay_days: 5,
      body: 'Hi {{first_name}}, just checking in about your {{project_type}} project. Reply YES if you\'d like to schedule a free estimate! - {{company_name}}',
    },
  ]);

  function toggleSequenceActive(seqId: string) {
    setSequences((prev) =>
      prev.map((s) => (s.id === seqId ? { ...s, is_active: !s.is_active } : s))
    );
  }

  function addStep() {
    const id = `step-${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      { id, type: 'email', delay_days: 3, subject: '', body: '' },
    ]);
  }

  function removeStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }

  function updateStep(stepId: string, updates: Partial<SequenceStep>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-Up Sequences"
        description="Automate your lead follow-up with multi-step sequences"
        breadcrumbs={[
          { label: 'Leads', href: '/leads' },
          { label: 'Sequences' },
        ]}
        actions={
          <Button
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            onClick={() => setShowBuilder(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Create Sequence
          </Button>
        }
      />

      {/* Sequences list */}
      <div className="space-y-4">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    seq.is_active ? 'bg-[#1e3a5f]/10' : 'bg-muted'
                  )}
                >
                  <Zap
                    className={cn(
                      'size-5',
                      seq.is_active ? 'text-[#1e3a5f]' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{seq.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {seq.description}
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  'text-xs',
                  seq.is_active
                    ? 'bg-[#22c55e]/10 text-[#22c55e]'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {seq.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5" />
                Trigger: <span className="font-medium text-foreground">{seq.trigger_stage}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDown className="size-3.5" />
                <span className="font-medium text-foreground">{seq.steps_count}</span> steps
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span className="font-medium text-foreground">{seq.active_leads}</span> active leads
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSequenceActive(seq.id)}
              >
                {seq.is_active ? (
                  <>
                    <Pause className="mr-1 size-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 size-3.5" /> Activate
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1 size-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="mr-1 size-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Sequence Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Follow-Up Sequence</DialogTitle>
            <DialogDescription>
              Build an automated sequence of follow-ups for your leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name & description */}
            <div className="space-y-1.5">
              <Label htmlFor="seq-name">Sequence Name</Label>
              <Input
                id="seq-name"
                value={seqName}
                onChange={(e) => setSeqName(e.target.value)}
                placeholder="e.g. New Lead Nurture"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seq-desc">Description</Label>
              <Input
                id="seq-desc"
                value={seqDescription}
                onChange={(e) => setSeqDescription(e.target.value)}
                placeholder="Brief description of this sequence"
              />
            </div>

            {/* Trigger */}
            <div className="space-y-1.5">
              <Label>Trigger: When lead enters stage</Label>
              <Select value={seqTrigger} onValueChange={(v) => v && setSeqTrigger(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger stage" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Steps timeline */}
            <div>
              <Label className="mb-3 block">Sequence Steps</Label>
              <div className="relative space-y-0">
                {steps.map((step, index) => {
                  const config = STEP_TYPE_CONFIG[step.type];
                  const Icon = config.icon;

                  return (
                    <div key={step.id} className="relative">
                      {/* Connector line */}
                      {index > 0 && (
                        <div className="flex items-center gap-2 py-2 pl-5">
                          <div className="h-6 w-px bg-border" />
                          <div className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Wait{' '}
                            <Input
                              type="number"
                              value={step.delay_days}
                              onChange={(e) =>
                                updateStep(step.id, {
                                  delay_days: parseInt(e.target.value) || 0,
                                })
                              }
                              className="mx-1 h-5 w-12 text-center text-xs"
                              min={0}
                            />{' '}
                            days
                          </div>
                        </div>
                      )}

                      {/* Step card */}
                      <div className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'flex size-7 items-center justify-center rounded-full',
                                config.bg
                              )}
                            >
                              <Icon className={cn('size-3.5', config.color)} />
                            </div>
                            <span className="text-sm font-medium">
                              Step {index + 1}
                            </span>
                            <Select
                              value={step.type}
                              onValueChange={(v) =>
                                updateStep(step.id, {
                                  type: v as SequenceStep['type'],
                                })
                              }
                            >
                              <SelectTrigger className="h-7 w-32 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="task">Internal Task</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>

                        {/* Step content based on type */}
                        {step.type === 'email' && (
                          <div className="space-y-2">
                            <Input
                              value={step.subject || ''}
                              onChange={(e) =>
                                updateStep(step.id, { subject: e.target.value })
                              }
                              placeholder="Email subject..."
                              className="text-sm"
                            />
                            <Textarea
                              value={step.body || ''}
                              onChange={(e) =>
                                updateStep(step.id, { body: e.target.value })
                              }
                              placeholder="Email body... Use {{first_name}}, {{company_name}}, {{project_type}} for merge fields"
                              rows={4}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Merge fields: {'{{first_name}}'}, {'{{last_name}}'}, {'{{company_name}}'}, {'{{project_type}}'}, {'{{assigned_user}}'}, {'{{company_phone}}'}
                            </p>
                          </div>
                        )}

                        {step.type === 'sms' && (
                          <div className="space-y-2">
                            <Textarea
                              value={step.body || ''}
                              onChange={(e) =>
                                updateStep(step.id, { body: e.target.value })
                              }
                              placeholder="SMS message... Use {{first_name}}, {{company_name}} for merge fields"
                              rows={2}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Max 160 characters recommended for SMS
                            </p>
                          </div>
                        )}

                        {step.type === 'task' && (
                          <div className="space-y-2">
                            <Input
                              value={step.task_description || ''}
                              onChange={(e) =>
                                updateStep(step.id, {
                                  task_description: e.target.value,
                                })
                              }
                              placeholder="Task description..."
                              className="text-sm"
                            />
                            <Select
                              value={step.assign_to || ''}
                              onValueChange={(v) =>
                                updateStep(step.id, { assign_to: v ?? undefined })
                              }
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Assign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {MOCK_USERS.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add step button */}
                <div className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={addStep}
                  >
                    <Plus className="mr-1.5 size-4" />
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              onClick={() => {
                console.log('Save sequence:', {
                  name: seqName,
                  description: seqDescription,
                  trigger: seqTrigger,
                  steps,
                });
                setShowBuilder(false);
              }}
            >
              Save Sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
