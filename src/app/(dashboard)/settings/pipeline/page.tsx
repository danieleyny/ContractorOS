'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Trophy,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PipelineStage {
  id: string;
  name: string;
  color: string;
  daysUntilStale: number;
  isWon: boolean;
  isLost: boolean;
}

const STAGE_COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#22c55e', // green
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#1e3a5f', // navy
  '#e8913a', // brand orange
];

const defaultStages: PipelineStage[] = [
  { id: '1', name: 'New Lead', color: '#6366f1', daysUntilStale: 3, isWon: false, isLost: false },
  { id: '2', name: 'Contacted', color: '#3b82f6', daysUntilStale: 5, isWon: false, isLost: false },
  { id: '3', name: 'Site Visit Scheduled', color: '#0ea5e9', daysUntilStale: 7, isWon: false, isLost: false },
  { id: '4', name: 'Estimate Sent', color: '#14b8a6', daysUntilStale: 10, isWon: false, isLost: false },
  { id: '5', name: 'Negotiating', color: '#f59e0b', daysUntilStale: 14, isWon: false, isLost: false },
  { id: '6', name: 'Won', color: '#22c55e', daysUntilStale: 0, isWon: true, isLost: false },
  { id: '7', name: 'Lost', color: '#ef4444', daysUntilStale: 0, isWon: false, isLost: true },
];

let nextId = 8;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>(defaultStages);

  const updateStage = (id: string, updates: Partial<PipelineStage>) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        // If marking as Won, clear Lost (and vice versa)
        if (updates.isWon) updated.isLost = false;
        if (updates.isLost) updated.isWon = false;
        return updated;
      }),
    );
  };

  const removeStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const addStage = () => {
    const color = STAGE_COLORS[stages.length % STAGE_COLORS.length];
    setStages((prev) => [
      ...prev,
      {
        id: String(nextId++),
        name: '',
        color,
        daysUntilStale: 7,
        isWon: false,
        isLost: false,
      },
    ]);
  };

  const handleSave = () => {
    const emptyNames = stages.filter((s) => !s.name.trim());
    if (emptyNames.length > 0) {
      toast.error('All stages must have a name');
      return;
    }
    toast.success('Pipeline stages saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Stages"
        description="Configure your lead pipeline"
      />

      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_120px_80px_80px_40px] items-center gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
            <span />
            <span>Stage Name</span>
            <span>Days Until Stale</span>
            <span className="text-center">Won</span>
            <span className="text-center">Lost</span>
            <span />
          </div>

          {/* Stage rows */}
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="grid grid-cols-[40px_1fr_120px_80px_80px_40px] items-center gap-3 border-b px-4 py-3 last:border-b-0"
            >
              {/* Drag handle + color swatch */}
              <div className="flex items-center gap-1">
                <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) => updateStage(stage.id, { color: e.target.value })}
                  className="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                  title="Stage color"
                />
              </div>

              {/* Name */}
              <Input
                value={stage.name}
                onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                placeholder="Stage name"
                className="h-8"
              />

              {/* Days until stale */}
              <Input
                type="number"
                min={0}
                value={stage.daysUntilStale}
                onChange={(e) =>
                  updateStage(stage.id, { daysUntilStale: Number(e.target.value) })
                }
                className="h-8"
              />

              {/* Won toggle */}
              <div className="flex items-center justify-center gap-1">
                <Switch
                  checked={stage.isWon}
                  onCheckedChange={(checked: boolean) =>
                    updateStage(stage.id, { isWon: checked })
                  }
                />
                {stage.isWon && <Trophy className="size-3.5 text-[#22c55e]" />}
              </div>

              {/* Lost toggle */}
              <div className="flex items-center justify-center gap-1">
                <Switch
                  checked={stage.isLost}
                  onCheckedChange={(checked: boolean) =>
                    updateStage(stage.id, { isLost: checked })
                  }
                />
                {stage.isLost && <XCircle className="size-3.5 text-[#ef4444]" />}
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeStage(stage.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {/* Add stage */}
          <div className="p-4">
            <Button variant="outline" onClick={addStage} className="w-full border-dashed">
              <Plus className="size-4" />
              Add Stage
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
          <Save className="size-4" />
          Save Pipeline
        </Button>
      </div>
    </div>
  );
}
