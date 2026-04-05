'use client';

import React, { useState } from 'react';
import {
  Plus,
  Globe,
  Copy,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  Code,
  ToggleLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
// Mock data
// -------------------------------------------------------------------

interface FormCard {
  id: string;
  name: string;
  slug: string;
  submissions: number;
  is_active: boolean;
  created_at: string;
}

const MOCK_FORMS: FormCard[] = [
  {
    id: 'f1',
    name: 'Website Contact Form',
    slug: 'contact',
    submissions: 47,
    is_active: true,
    created_at: '2026-01-15',
  },
  {
    id: 'f2',
    name: 'Kitchen Remodel Inquiry',
    slug: 'kitchen-remodel',
    submissions: 23,
    is_active: true,
    created_at: '2026-02-20',
  },
  {
    id: 'f3',
    name: 'General Estimate Request',
    slug: 'estimate-request',
    submissions: 12,
    is_active: false,
    created_at: '2026-03-05',
  },
];

// -------------------------------------------------------------------
// Field type config
// -------------------------------------------------------------------

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

const DEFAULT_FIELDS: FormField[] = [
  { id: 'f-name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your full name' },
  { id: 'f-email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
  { id: 'f-phone', label: 'Phone', type: 'tel', required: false, placeholder: '(555) 123-4567' },
  { id: 'f-project', label: 'Project Type', type: 'select', required: false, placeholder: 'Select project type' },
  { id: 'f-budget', label: 'Budget Range', type: 'select', required: false, placeholder: 'Select budget range' },
  { id: 'f-message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your project...' },
];

const AVAILABLE_FIELDS = [
  'Full Name',
  'Email',
  'Phone',
  'Project Type',
  'Budget Range',
  'Message',
  'Address',
  'Preferred Contact Method',
];

const MOCK_USERS = [
  { id: 'u1', name: 'Mike Johnson' },
  { id: 'u2', name: 'Sarah Adams' },
  { id: 'u3', name: 'Tom Rivera' },
];

const MOCK_STAGES = [
  { id: 's1', name: 'New Inquiry' },
  { id: 's2', name: 'Contacted' },
  { id: 's3', name: 'Estimate Sent' },
];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function LeadFormsPage() {
  const [forms, setForms] = useState<FormCard[]>(MOCK_FORMS);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showEmbed, setShowEmbed] = useState<string | null>(null);
  const [builderFormName, setBuilderFormName] = useState('');
  const [builderFields, setBuilderFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [builderAssign, setBuilderAssign] = useState('');
  const [builderStage, setBuilderStage] = useState('');
  const [builderConfirmation, setBuilderConfirmation] = useState(
    'Thank you for your inquiry! We will get back to you within 24 hours.'
  );

  function toggleFormActive(formId: string) {
    setForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, is_active: !f.is_active } : f))
    );
  }

  function toggleFieldRequired(fieldId: string) {
    setBuilderFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f))
    );
  }

  function removeField(fieldId: string) {
    setBuilderFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  function addField(label: string) {
    const id = `f-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const type = label === 'Message' ? 'textarea' : label.includes('Type') || label.includes('Method') || label.includes('Budget') ? 'select' : 'text';
    setBuilderFields((prev) => [
      ...prev,
      { id, label, type, required: false, placeholder: '' },
    ]);
  }

  const embedCode = showEmbed
    ? `<iframe src="https://app.contractoros.com/forms/${forms.find((f) => f.id === showEmbed)?.slug || ''}" width="100%" height="600" frameborder="0"></iframe>`
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Capture Forms"
        description="Create embeddable forms to capture leads from your website"
        breadcrumbs={[
          { label: 'Leads', href: '/leads' },
          { label: 'Forms' },
        ]}
        actions={
          <Button
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            onClick={() => setShowBuilder(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Create Form
          </Button>
        }
      />

      {/* Forms grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <div
            key={form.id}
            className="rounded-xl border bg-white light-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
                  <Globe className="size-4 text-[#1e3a5f]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{form.name}</h3>
                  <p className="text-xs text-muted-foreground">/{form.slug}</p>
                </div>
              </div>
              <Badge
                className={cn(
                  'text-xs',
                  form.is_active
                    ? 'bg-[#22c55e]/10 text-[#22c55e]'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {form.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{form.submissions}</span>{' '}
              submissions
            </div>

            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowEmbed(form.id)}
              >
                <Code className="mr-1 size-3.5" />
                Embed
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleFormActive(form.id)}>
                <ToggleLeft className="size-3.5" />
              </Button>
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Embed code dialog */}
      <Dialog open={!!showEmbed} onOpenChange={() => setShowEmbed(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
            <DialogDescription>
              Copy and paste this code into your website to display the lead capture form.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3">
            <code className="break-all text-xs">{embedCode}</code>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
              }}
            >
              <Copy className="mr-1.5 size-4" />
              Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lead Capture Form</DialogTitle>
            <DialogDescription>
              Build a custom form to capture leads from your website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Form name */}
            <div className="space-y-1.5">
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                value={builderFormName}
                onChange={(e) => setBuilderFormName(e.target.value)}
                placeholder="e.g. Kitchen Remodel Inquiry"
              />
            </div>

            {/* Fields */}
            <div>
              <Label className="mb-2 block">Form Fields</Label>
              <div className="space-y-2 rounded-lg border p-3">
                {builderFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          setBuilderFields((prev) =>
                            prev.map((f) =>
                              f.id === field.id ? { ...f, label: e.target.value } : f
                            )
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <Input
                      value={field.placeholder}
                      onChange={(e) =>
                        setBuilderFields((prev) =>
                          prev.map((f) =>
                            f.id === field.id ? { ...f, placeholder: e.target.value } : f
                          )
                        )
                      }
                      placeholder="Placeholder"
                      className="h-8 w-40 text-sm"
                    />
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-muted-foreground">Req</label>
                      <Switch
                        checked={field.required}
                        onCheckedChange={() => toggleFieldRequired(field.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-red-500 hover:text-red-700"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}

                {/* Add field dropdown */}
                <Select onValueChange={(v) => v && addField(v as string)}>
                  <SelectTrigger className="border-dashed">
                    <SelectValue placeholder="+ Add field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FIELDS.filter(
                      (f) => !builderFields.some((bf) => bf.label === f)
                    ).map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Auto-Assign To</Label>
                <Select value={builderAssign} onValueChange={(v) => v && setBuilderAssign(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user or Round Robin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    {MOCK_USERS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Initial Pipeline Stage</Label>
                <Select value={builderStage} onValueChange={(v) => v && setBuilderStage(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
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
            </div>

            {/* Confirmation message */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmation">Confirmation Message</Label>
              <Textarea
                id="confirmation"
                value={builderConfirmation}
                onChange={(e) => setBuilderConfirmation(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Eye className="mr-1.5 size-4" />
              Preview
            </Button>
            <Button
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              onClick={() => {
                console.log('Save form:', {
                  name: builderFormName,
                  fields: builderFields,
                  assign: builderAssign,
                  stage: builderStage,
                  confirmation: builderConfirmation,
                });
                setShowBuilder(false);
              }}
            >
              Save Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
