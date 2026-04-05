'use client';

import React, { useState } from 'react';
import {
  Clock,
  Play,
  Square,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  date: string;
  startTime: string;
  endTime: string | null;
  hours: number | null;
  status: 'active' | 'pending' | 'approved' | 'rejected';
}

const PROJECTS = [
  'Riverside Office Renovation',
  'Oakwood Custom Home',
  'Downtown Retail Buildout',
  'Hillcrest Kitchen & Bath',
];

const TASKS = [
  'Framing',
  'Electrical Rough-In',
  'Plumbing',
  'Drywall',
  'Painting',
  'Finish Carpentry',
  'Demo',
  'Site Prep',
  'Inspection Prep',
];

const MOCK_ENTRIES: TimeEntry[] = [
  {
    id: 'te1',
    project: 'Riverside Office Renovation',
    task: 'Framing',
    date: '2026-04-04',
    startTime: '07:00',
    endTime: '10:30',
    hours: 3.5,
    status: 'approved',
  },
  {
    id: 'te2',
    project: 'Riverside Office Renovation',
    task: 'Electrical Rough-In',
    date: '2026-04-04',
    startTime: '10:45',
    endTime: '12:00',
    hours: 1.25,
    status: 'approved',
  },
  {
    id: 'te3',
    project: 'Oakwood Custom Home',
    task: 'Plumbing',
    date: '2026-04-04',
    startTime: '12:30',
    endTime: '15:30',
    hours: 3,
    status: 'pending',
  },
  {
    id: 'te4',
    project: 'Oakwood Custom Home',
    task: 'Drywall',
    date: '2026-04-04',
    startTime: '15:45',
    endTime: null,
    hours: null,
    status: 'active',
  },
];

const WEEKLY_SUMMARY = {
  totalHours: 38.5,
  regularHours: 38.5,
  overtimeHours: 0,
  hourlyRate: 45,
  totalCost: 1732.5,
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: { label: 'Active', color: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20', icon: Clock },
  pending: { label: 'Pending', color: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20', icon: XCircle },
};

export function TimeTracker() {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime] = useState('15:45');
  const [entries] = useState<TimeEntry[]>(MOCK_ENTRIES);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(PROJECTS[1]);
  const [selectedTask, setSelectedTask] = useState(TASKS[3]);

  const todayEntries = entries.filter((e) => e.date === '2026-04-04');
  const todayHours = todayEntries.reduce((sum, e) => sum + (e.hours ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      <div className="rounded-xl bg-white light-card p-6 shadow-sm ring-1 ring-foreground/10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-muted-foreground">Current Status</p>
            {isClockedIn ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-[#22c55e]" />
                </span>
                <span className="text-lg font-semibold">
                  Clocked In since {clockInTime}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-lg font-semibold text-muted-foreground">
                Not Clocked In
              </p>
            )}
            {isClockedIn && (
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span>Project: <strong className="text-foreground">{selectedProject}</strong></span>
                <span>Task: <strong className="text-foreground">{selectedTask}</strong></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isClockedIn && (
              <div className="flex gap-2">
                <Select value={selectedProject} onValueChange={(v) => v && setSelectedProject(v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTask} onValueChange={(v) => v && setSelectedTask(v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASKS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              size="lg"
              className={cn(
                'min-w-[140px] text-base font-semibold',
                isClockedIn
                  ? 'bg-[#ef4444] hover:bg-[#ef4444]/90'
                  : 'bg-[#22c55e] hover:bg-[#22c55e]/90'
              )}
              onClick={() => setIsClockedIn(!isClockedIn)}
            >
              {isClockedIn ? (
                <>
                  <Square className="mr-2 size-5" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="mr-2 size-5" />
                  Clock In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Entries */}
      <div className="rounded-xl bg-white light-card p-6 shadow-sm ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Today&apos;s Entries</h3>
            <p className="text-xs text-muted-foreground">
              {todayEntries.length} entries &middot; {todayHours.toFixed(1)} hours logged
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setManualDialogOpen(true)}>
            <Plus className="mr-1.5 size-3.5" />
            Add Manual Entry
          </Button>
          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Project</Label>
                  <Select defaultValue={PROJECTS[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECTS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Task</Label>
                  <Select defaultValue={TASKS[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASKS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" defaultValue="2026-04-04" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Start Time</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Time</Label>
                    <Input type="time" defaultValue="12:00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="What did you work on?" rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setManualDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                    onClick={() => setManualDialogOpen(false)}
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 space-y-2">
          {todayEntries.map((entry) => {
            const cfg = statusConfig[entry.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-4 py-3',
                  entry.status === 'active' && 'border-[#22c55e]/30 bg-[#22c55e]/5'
                )}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{entry.project}</p>
                    <p className="text-xs text-muted-foreground">{entry.task}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm tabular-nums">
                      {entry.startTime} - {entry.endTime ?? 'now'}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {entry.hours ? `${entry.hours}h` : 'Running...'}
                    </p>
                  </div>
                  <Badge className={cn('gap-1', cfg.color)}>
                    <StatusIcon className="size-3" />
                    {cfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="rounded-xl bg-white light-card p-6 shadow-sm ring-1 ring-foreground/10">
        <h3 className="text-sm font-semibold">Weekly Summary</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg bg-[#1e3a5f]/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Hours</p>
            <p className="mt-1 text-xl font-bold text-[#1e3a5f]">
              {WEEKLY_SUMMARY.totalHours}
            </p>
          </div>
          <div className="rounded-lg bg-[#1e3a5f]/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Regular</p>
            <p className="mt-1 text-xl font-bold">
              {WEEKLY_SUMMARY.regularHours}
            </p>
          </div>
          <div className="rounded-lg bg-[#f59e0b]/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Overtime</p>
            <p className="mt-1 text-xl font-bold text-[#f59e0b]">
              {WEEKLY_SUMMARY.overtimeHours}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="mt-1 text-xl font-bold">
              ${WEEKLY_SUMMARY.hourlyRate}/hr
            </p>
          </div>
          <div className="rounded-lg bg-[#22c55e]/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="mt-1 text-xl font-bold text-[#22c55e]">
              ${WEEKLY_SUMMARY.totalCost.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
