'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Contact, LeadSource, LeadTemperature } from '@/lib/types';

// -------------------------------------------------------------------
// Validation Schema
// -------------------------------------------------------------------

const leadFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  source: z.string().optional(),
  source_detail: z.string().optional(),
  project_type: z.string().optional(),
  estimated_value: z.coerce.number().min(0).optional(),
  lead_temperature: z.string().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  stage_id: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<Contact>;
  onSubmit: (data: LeadFormValues) => void;
  isLoading?: boolean;
}

// -------------------------------------------------------------------
// Options
// -------------------------------------------------------------------

const SOURCE_OPTIONS: { label: string; value: LeadSource }[] = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Advertising', value: 'advertising' },
  { label: 'Repeat Client', value: 'repeat' },
  { label: 'Other', value: 'other' },
];

const TEMPERATURE_OPTIONS: { label: string; value: LeadTemperature }[] = [
  { label: 'Hot', value: 'hot' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cold', value: 'cold' },
  { label: 'Dead', value: 'dead' },
];

const PROJECT_TYPES = [
  'Kitchen Remodel',
  'Bathroom Renovation',
  'Full Home Renovation',
  'Deck Construction',
  'Basement Finishing',
  'Roof Replacement',
  'Commercial Buildout',
  'New Home Build',
  'Addition',
  'Flooring',
  'Painting',
  'Landscaping',
  'Other',
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
  { id: 's4', name: 'Negotiation' },
];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function LeadForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading = false,
}: LeadFormProps) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      company_name: initialData?.company_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      mobile: initialData?.mobile || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zip: initialData?.zip || '',
      source: initialData?.source || '',
      source_detail: initialData?.source_detail || '',
      lead_temperature: initialData?.lead_temperature || '',
      assigned_to: initialData?.assigned_to || '',
      notes: initialData?.notes || '',
      tags: initialData?.tags?.join(', ') || '',
      estimated_value: 0,
      project_type: '',
      stage_id: '',
    },
  });

  function handleFormSubmit(data: LeadFormValues) {
    onSubmit(data);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lead' : 'New Lead'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update lead contact information.'
              : 'Add a new lead to your pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register('first_name')} placeholder="John" />
              {errors.first_name && (
                <p className="text-xs text-red-500">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register('last_name')} placeholder="Doe" />
              {errors.last_name && (
                <p className="text-xs text-red-500">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" {...register('company_name')} placeholder="Acme Construction" />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" {...register('mobile')} placeholder="(555) 987-6543" />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="New York" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} placeholder="NY" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" {...register('zip')} placeholder="10001" />
            </div>
          </div>

          {/* Lead details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select
                value={watch('source') || ''}
                onValueChange={(v) => v && setValue('source', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source_detail">Source Detail</Label>
              <Input id="source_detail" {...register('source_detail')} placeholder="e.g. Google Ads campaign" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project Type</Label>
              <Select
                value={watch('project_type') || ''}
                onValueChange={(v) => v && setValue('project_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((pt) => (
                    <SelectItem key={pt} value={pt}>
                      {pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimated_value">Estimated Value ($)</Label>
              <Input
                id="estimated_value"
                type="number"
                {...register('estimated_value')}
                placeholder="50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lead Temperature</Label>
              <Select
                value={watch('lead_temperature') || ''}
                onValueChange={(v) => v && setValue('lead_temperature', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned To</Label>
              <Select
                value={watch('assigned_to') || ''}
                onValueChange={(v) => v && setValue('assigned_to', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
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
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label>Initial Pipeline Stage</Label>
              <Select
                value={watch('stage_id') || ''}
                onValueChange={(v) => v && setValue('stage_id', v)}
              >
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
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} placeholder="Additional notes..." rows={3} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" {...register('tags')} placeholder="residential, urgent, vip" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
