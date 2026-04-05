'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GanttTask {
  id: string;
  name: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  isMilestone: boolean;
  dependencies: string[];
  completionPercentage: number;
}

const MOCK_TASKS: GanttTask[] = [
  { id: 't1', name: 'Site Preparation', assignedTo: 'Mike R.', startDate: '2026-03-02', endDate: '2026-03-13', status: 'completed', isMilestone: false, dependencies: [], completionPercentage: 100 },
  { id: 't2', name: 'Foundation Work', assignedTo: 'Carlos D.', startDate: '2026-03-16', endDate: '2026-03-27', status: 'completed', isMilestone: false, dependencies: ['t1'], completionPercentage: 100 },
  { id: 't3', name: 'Foundation Inspection', assignedTo: 'Inspector', startDate: '2026-03-30', endDate: '2026-03-30', status: 'completed', isMilestone: true, dependencies: ['t2'], completionPercentage: 100 },
  { id: 't4', name: 'Framing', assignedTo: 'Tony S.', startDate: '2026-03-31', endDate: '2026-04-17', status: 'in_progress', isMilestone: false, dependencies: ['t3'], completionPercentage: 65 },
  { id: 't5', name: 'Rough Electrical', assignedTo: 'Dave E.', startDate: '2026-04-13', endDate: '2026-04-24', status: 'in_progress', isMilestone: false, dependencies: ['t4'], completionPercentage: 30 },
  { id: 't6', name: 'Rough Plumbing', assignedTo: 'Jim P.', startDate: '2026-04-13', endDate: '2026-04-24', status: 'not_started', isMilestone: false, dependencies: ['t4'], completionPercentage: 0 },
  { id: 't7', name: 'HVAC Rough-In', assignedTo: 'HVAC Co.', startDate: '2026-04-20', endDate: '2026-05-01', status: 'not_started', isMilestone: false, dependencies: ['t4'], completionPercentage: 0 },
  { id: 't8', name: 'Framing Inspection', assignedTo: 'Inspector', startDate: '2026-04-27', endDate: '2026-04-27', status: 'not_started', isMilestone: true, dependencies: ['t5', 't6'], completionPercentage: 0 },
  { id: 't9', name: 'Insulation', assignedTo: 'Tony S.', startDate: '2026-04-28', endDate: '2026-05-08', status: 'not_started', isMilestone: false, dependencies: ['t8'], completionPercentage: 0 },
  { id: 't10', name: 'Drywall', assignedTo: 'Alex F.', startDate: '2026-05-11', endDate: '2026-05-22', status: 'not_started', isMilestone: false, dependencies: ['t9'], completionPercentage: 0 },
  { id: 't11', name: 'Interior Finishes', assignedTo: 'Alex F.', startDate: '2026-05-25', endDate: '2026-06-05', status: 'blocked', isMilestone: false, dependencies: ['t10'], completionPercentage: 0 },
  { id: 't12', name: 'Final Inspection', assignedTo: 'Inspector', startDate: '2026-06-08', endDate: '2026-06-08', status: 'not_started', isMilestone: true, dependencies: ['t11'], completionPercentage: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-300',
  in_progress: 'bg-[#1e3a5f]',
  completed: 'bg-[#22c55e]',
  blocked: 'bg-[#ef4444]',
};

const STATUS_COLORS_LIGHT: Record<string, string> = {
  not_started: 'bg-gray-100',
  in_progress: 'bg-[#1e3a5f]/10',
  completed: 'bg-[#22c55e]/10',
  blocked: 'bg-[#ef4444]/10',
};

function parseDate(d: string): Date {
  return new Date(d + 'T00:00:00');
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GanttChart() {
  const [timeScale, setTimeScale] = useState<'days' | 'weeks'>('weeks');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { startDate, endDate, totalDays } = useMemo(() => {
    const allDates = MOCK_TASKS.flatMap((t) => [parseDate(t.startDate), parseDate(t.endDate)]);
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    // add padding
    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 7);
    return {
      startDate: min,
      endDate: max,
      totalDays: daysBetween(min, max),
    };
  }, []);

  const dayWidth = timeScale === 'days' ? 32 : 12;
  const chartWidth = totalDays * dayWidth;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset = daysBetween(startDate, today);

  // Generate time scale headers
  const timeHeaders = useMemo(() => {
    const headers: { label: string; left: number; width: number }[] = [];
    if (timeScale === 'weeks') {
      const curr = new Date(startDate);
      // align to Monday
      const day = curr.getDay();
      curr.setDate(curr.getDate() - (day === 0 ? 6 : day - 1));
      while (curr <= endDate) {
        const weekStart = new Date(curr);
        const offset = daysBetween(startDate, weekStart);
        headers.push({
          label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          left: offset * dayWidth,
          width: 7 * dayWidth,
        });
        curr.setDate(curr.getDate() + 7);
      }
    } else {
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        if (d.getDate() === 1 || i === 0) {
          const remaining = Math.min(
            totalDays - i,
            new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1
          );
          headers.push({
            label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            left: i * dayWidth,
            width: remaining * dayWidth,
          });
        }
      }
    }
    return headers;
  }, [timeScale, startDate, endDate, totalDays, dayWidth]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Scale:</span>
        <Button
          size="sm"
          variant={timeScale === 'days' ? 'default' : 'outline'}
          onClick={() => setTimeScale('days')}
          className={timeScale === 'days' ? 'bg-[#1e3a5f] text-white' : ''}
        >
          Days
        </Button>
        <Button
          size="sm"
          variant={timeScale === 'weeks' ? 'default' : 'outline'}
          onClick={() => setTimeScale('weeks')}
          className={timeScale === 'weeks' ? 'bg-[#1e3a5f] text-white' : ''}
        >
          Weeks
        </Button>
      </div>

      {/* Chart */}
      <div className="flex rounded-lg border">
        {/* Left panel - Task list */}
        <div className="w-[300px] shrink-0 border-r">
          <div className="flex h-10 items-center border-b bg-muted/50 px-3">
            <span className="text-xs font-semibold text-muted-foreground">TASK</span>
            <span className="ml-auto text-xs font-semibold text-muted-foreground">DATES</span>
          </div>
          {MOCK_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex h-10 items-center border-b px-3 text-xs last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                {task.isMilestone ? (
                  <Diamond className="size-3 shrink-0 text-[#e8913a]" />
                ) : (
                  <div className={cn('size-2 shrink-0 rounded-full', STATUS_COLORS[task.status])} />
                )}
                <span className="truncate font-medium">{task.name}</span>
              </div>
              <span className="ml-2 shrink-0 text-muted-foreground">
                {formatShortDate(task.startDate)}
              </span>
            </div>
          ))}
        </div>

        {/* Right panel - Timeline */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div style={{ width: chartWidth, minWidth: '100%' }}>
            {/* Time header */}
            <div className="relative h-10 border-b bg-muted/50">
              {timeHeaders.map((h, i) => (
                <div
                  key={i}
                  className="absolute top-0 flex h-full items-center border-r px-2 text-xs text-muted-foreground"
                  style={{ left: h.left, width: h.width }}
                >
                  {h.label}
                </div>
              ))}
            </div>

            {/* Task bars */}
            <div className="relative">
              {/* Today line */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div
                  className="absolute top-0 z-10 h-full w-px border-l-2 border-dashed border-[#ef4444]"
                  style={{ left: todayOffset * dayWidth }}
                >
                  <span className="absolute -top-0 left-1 rounded bg-[#ef4444] px-1 py-0.5 text-[9px] font-medium text-white">
                    Today
                  </span>
                </div>
              )}

              {MOCK_TASKS.map((task) => {
                const taskStart = daysBetween(startDate, parseDate(task.startDate));
                const taskEnd = daysBetween(startDate, parseDate(task.endDate));
                const taskDuration = Math.max(taskEnd - taskStart, 1);
                const left = taskStart * dayWidth;
                const width = taskDuration * dayWidth;

                return (
                  <div key={task.id} className="relative flex h-10 items-center border-b last:border-b-0">
                    {/* Dependency arrows */}
                    {task.dependencies.map((depId) => {
                      const dep = MOCK_TASKS.find((t) => t.id === depId);
                      if (!dep) return null;
                      const depEnd = daysBetween(startDate, parseDate(dep.endDate)) * dayWidth;
                      return (
                        <svg
                          key={depId}
                          className="pointer-events-none absolute top-0 h-full"
                          style={{
                            left: Math.min(depEnd, left) - 4,
                            width: Math.abs(left - depEnd) + 12,
                          }}
                        >
                          <line
                            x1={depEnd < left ? 4 : Math.abs(left - depEnd) + 4}
                            y1="50%"
                            x2={depEnd < left ? Math.abs(left - depEnd) + 4 : 4}
                            y2="50%"
                            stroke="#94a3b8"
                            strokeWidth="1"
                            strokeDasharray="3,2"
                            markerEnd="url(#arrowhead)"
                          />
                          <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                              <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
                            </marker>
                          </defs>
                        </svg>
                      );
                    })}

                    {/* Task bar or milestone */}
                    {task.isMilestone ? (
                      <div
                        className="absolute flex size-5 -translate-x-1/2 rotate-45 items-center justify-center rounded-sm bg-[#e8913a]"
                        style={{ left: left + width / 2 }}
                        title={task.name}
                      />
                    ) : (
                      <div
                        className={cn(
                          'absolute flex h-6 items-center rounded',
                          STATUS_COLORS_LIGHT[task.status]
                        )}
                        style={{ left, width: Math.max(width, dayWidth) }}
                        title={`${task.name} (${task.completionPercentage}%)`}
                      >
                        <div
                          className={cn('h-full rounded', STATUS_COLORS[task.status])}
                          style={{ width: `${task.completionPercentage}%`, minWidth: task.completionPercentage > 0 ? 4 : 0 }}
                        />
                        {width > 60 && (
                          <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-foreground">
                            {task.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-gray-300" />
          Not Started
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#1e3a5f]" />
          In Progress
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#22c55e]" />
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#ef4444]" />
          Blocked
        </div>
        <div className="flex items-center gap-1.5">
          <Diamond className="size-3 text-[#e8913a]" />
          Milestone
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-4 border-t-2 border-dashed border-[#ef4444]" />
          Today
        </div>
      </div>
    </div>
  );
}
