'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MOCK_CREW = [
  { id: 'c1', name: 'Mike Rodriguez' },
  { id: 'c2', name: 'Carlos Delgado' },
  { id: 'c3', name: 'Tony Sullivan' },
  { id: 'c4', name: 'Dave Edwards' },
  { id: 'c5', name: 'Jim Patterson' },
  { id: 'c6', name: 'Alex Foster' },
  { id: 'c7', name: 'Ryan Chen' },
  { id: 'c8', name: 'Sam Williams' },
];

const DELAY_REASONS = [
  { value: 'weather', label: 'Weather' },
  { value: 'material', label: 'Material Delay' },
  { value: 'labor', label: 'Labor Shortage' },
  { value: 'inspection', label: 'Inspection Hold' },
  { value: 'client', label: 'Client Decision' },
  { value: 'permit', label: 'Permit Issue' },
  { value: 'other', label: 'Other' },
];

interface DailyLogFormData {
  log_date: string;
  weather_conditions?: string;
  temperature_high?: number;
  temperature_low?: number;
  work_performed?: string;
  materials_used?: string;
  visitors?: string;
  safety_incidents?: string;
  delays?: string;
  delay_reason?: string;
  crew_on_site: {
    crew_id: string;
    name: string;
    present: boolean;
    hours?: number;
  }[];
}

interface DailyLogFormProps {
  onSubmit?: (data: DailyLogFormData) => void;
  onCancel?: () => void;
}

export function DailyLogForm({ onSubmit, onCancel }: DailyLogFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DailyLogFormData>({
    defaultValues: {
      log_date: today,
      weather_conditions: '',
      temperature_high: undefined,
      temperature_low: undefined,
      work_performed: '',
      materials_used: '',
      visitors: '',
      safety_incidents: '',
      delays: '',
      delay_reason: '',
      crew_on_site: MOCK_CREW.map((c) => ({
        crew_id: c.id,
        name: c.name,
        present: false,
        hours: 8,
      })),
    },
  });

  const delays = watch('delays');
  const crewOnSite = watch('crew_on_site');

  const handleFormSubmit = (data: DailyLogFormData) => {
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Date & Weather */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="log_date">Date</Label>
          <Input type="date" id="log_date" {...register('log_date')} />
          {errors.log_date && (
            <p className="text-xs text-[#ef4444]">{errors.log_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature_high">Temp High (&deg;F)</Label>
          <Input
            type="number"
            id="temperature_high"
            placeholder="85"
            {...register('temperature_high')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature_low">Temp Low (&deg;F)</Label>
          <Input
            type="number"
            id="temperature_low"
            placeholder="62"
            {...register('temperature_low')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weather_conditions">Weather Conditions</Label>
        <div className="flex gap-2">
          {[
            { icon: Sun, label: 'Sunny' },
            { icon: Cloud, label: 'Cloudy' },
            { icon: CloudRain, label: 'Rainy' },
            { icon: CloudSnow, label: 'Snow' },
            { icon: Wind, label: 'Windy' },
          ].map(({ icon: Icon, label }) => (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={watch('weather_conditions') === label ? 'default' : 'outline'}
              className={
                watch('weather_conditions') === label
                  ? 'bg-[#1e3a5f] text-white'
                  : ''
              }
              onClick={() => setValue('weather_conditions', label)}
            >
              <Icon className="mr-1 size-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Work performed */}
      <div className="space-y-2">
        <Label htmlFor="work_performed">Work Performed</Label>
        <Textarea
          id="work_performed"
          rows={4}
          placeholder="Describe work completed today..."
          {...register('work_performed')}
        />
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label htmlFor="materials_used">Materials Used</Label>
        <Textarea
          id="materials_used"
          rows={3}
          placeholder="List materials delivered or used..."
          {...register('materials_used')}
        />
      </div>

      {/* Crew on site */}
      <div className="space-y-3">
        <Label>Crew on Site</Label>
        <div className="rounded-lg border">
          <div className="grid grid-cols-[auto_1fr_80px] items-center gap-3 border-b bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>Present</span>
            <span>Name</span>
            <span>Hours</span>
          </div>
          {crewOnSite?.map((member, index) => (
            <div
              key={member.crew_id}
              className="grid grid-cols-[auto_1fr_80px] items-center gap-3 border-b px-3 py-2 last:border-b-0"
            >
              <Checkbox
                checked={member.present}
                onCheckedChange={(checked) =>
                  setValue(`crew_on_site.${index}.present`, !!checked)
                }
              />
              <span className="text-sm">{member.name}</span>
              <Input
                type="number"
                min={0}
                max={24}
                step={0.5}
                className="h-8 text-sm"
                disabled={!member.present}
                {...register(`crew_on_site.${index}.hours`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Visitors */}
      <div className="space-y-2">
        <Label htmlFor="visitors">Visitors</Label>
        <Textarea
          id="visitors"
          rows={2}
          placeholder="List any site visitors..."
          {...register('visitors')}
        />
      </div>

      {/* Safety */}
      <div className="space-y-2">
        <Label htmlFor="safety_incidents">Safety Incidents</Label>
        <Textarea
          id="safety_incidents"
          rows={2}
          placeholder="Report any safety incidents or concerns..."
          {...register('safety_incidents')}
        />
      </div>

      {/* Delays */}
      <div className="space-y-2">
        <Label htmlFor="delays">Delays</Label>
        <Textarea
          id="delays"
          rows={2}
          placeholder="Describe any delays encountered..."
          {...register('delays')}
        />
      </div>

      {delays && delays.trim().length > 0 && (
        <div className="space-y-2">
          <Label>Delay Reason</Label>
          <Select
            value={watch('delay_reason') || ''}
            onValueChange={(val) => setValue('delay_reason', val ?? '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delay reason" />
            </SelectTrigger>
            <SelectContent>
              {DELAY_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-[#1e3a5f]/40 hover:bg-muted/50">
          <div className="text-center">
            <Upload className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag & drop photos here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60">
              PNG, JPG up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
          Save Daily Log
        </Button>
      </div>
    </form>
  );
}
