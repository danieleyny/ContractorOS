'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ChangeOrderLineItem {
  description: string;
  quantity: number;
  unit_cost: number;
}

interface ChangeOrderFormData {
  title: string;
  description?: string;
  reason?: string;
  line_items: ChangeOrderLineItem[];
  schedule_impact_days?: number;
}

interface ChangeOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ChangeOrderFormData) => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function ChangeOrderForm({ open, onOpenChange, onSubmit }: ChangeOrderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ChangeOrderFormData>({
    defaultValues: {
      title: '',
      description: '',
      reason: '',
      line_items: [{ description: '', quantity: 1, unit_cost: 0 }],
      schedule_impact_days: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const lineItems = watch('line_items');
  const totalAmount = lineItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unit_cost || 0);
  }, 0);

  const handleFormSubmit = (data: ChangeOrderFormData) => {
    onSubmit?.(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Change Order</SheetTitle>
          <SheetDescription>
            Create a change order to modify the project scope, cost, or schedule.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="co_title">Title</Label>
            <Input id="co_title" placeholder="Change order title..." {...register('title')} />
            {errors.title && (
              <p className="text-xs text-[#ef4444]">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="co_description">Description</Label>
            <Textarea
              id="co_description"
              rows={3}
              placeholder="Describe the change..."
              {...register('description')}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="co_reason">Reason</Label>
            <Input
              id="co_reason"
              placeholder="Reason for change..."
              {...register('reason')}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <Label>Line Items</Label>
            <div className="space-y-3">
              {fields.map((field, index) => {
                const qty = lineItems[index]?.quantity || 0;
                const cost = lineItems[index]?.unit_cost || 0;
                const lineTotal = qty * cost;

                return (
                  <div
                    key={field.id}
                    className="rounded-lg border p-3 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="size-7 p-0 text-muted-foreground hover:text-[#ef4444]"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Item description"
                      {...register(`line_items.${index}.description`)}
                    />
                    {errors.line_items?.[index]?.description && (
                      <p className="text-xs text-[#ef4444]">
                        {errors.line_items[index].description?.message}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`line_items.${index}.quantity`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Cost ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`line_items.${index}.unit_cost`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <div className="flex h-9 items-center rounded-md bg-muted px-3 text-sm font-medium tabular-nums">
                          ${lineTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unit_cost: 0 })}
            >
              <Plus className="mr-1 size-4" />
              Add Line Item
            </Button>
            {errors.line_items?.root && (
              <p className="text-xs text-[#ef4444]">{errors.line_items.root.message}</p>
            )}
          </div>

          {/* Total */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Amount</span>
              <span className="text-lg font-bold text-[#1e3a5f] tabular-nums">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Schedule Impact */}
          <div className="space-y-2">
            <Label htmlFor="schedule_impact">Schedule Impact (days)</Label>
            <Input
              id="schedule_impact"
              type="number"
              min={0}
              placeholder="0"
              {...register('schedule_impact_days')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#e8913a] text-white hover:bg-[#e8913a]/90">
              Submit for Approval
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
