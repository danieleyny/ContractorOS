'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ViewMode = 'week' | 'month';

interface Assignment {
  id: string;
  crewMemberId: string;
  projectName: string;
  projectColor: string;
  taskName: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  type: 'full' | 'partial' | 'off';
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

const PROJECT_COLORS: Record<string, string> = {
  'Riverside Office': '#1e3a5f',
  'Oakwood Home': '#e8913a',
  'Downtown Retail': '#22c55e',
  'Hillcrest Remodel': '#8b5cf6',
  'Warehouse Lofts': '#ef4444',
  'Park Ave Duplex': '#06b6d4',
};

const CREW_MEMBERS: CrewMember[] = [
  { id: 'cm1', name: 'Carlos Mendez', role: 'Foreman' },
  { id: 'cm2', name: 'Jake Williams', role: 'Carpenter' },
  { id: 'cm3', name: 'Tony Rossi', role: 'Electrician' },
  { id: 'cm4', name: 'Marcus Brown', role: 'Laborer' },
  { id: 'cm5', name: 'Andrei Petrov', role: 'Plumber' },
  { id: 'cm6', name: 'Devon Harris', role: 'Painter' },
];

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day === 0 ? 7 : day) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthDates(baseDate: Date): Date[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const dates: Date[] = [];
  for (let i = -startOffset; i <= lastDay.getDate() - 1 + (6 - ((lastDay.getDay() + 6) % 7)); i++) {
    const d = new Date(year, month, i + 1);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateMockAssignments(): Assignment[] {
  const today = new Date();
  const weekDates = getWeekDates(today);

  const assignments: Assignment[] = [];
  const projects = Object.keys(PROJECT_COLORS);

  const schedule: [string, number[], string][] = [
    ['cm1', [0, 1, 2, 3, 4], 'Riverside Office'],
    ['cm2', [0, 1, 2], 'Riverside Office'],
    ['cm2', [3, 4], 'Oakwood Home'],
    ['cm3', [0, 1], 'Downtown Retail'],
    ['cm3', [2, 3, 4], 'Oakwood Home'],
    ['cm4', [0, 1, 2, 3, 4], 'Hillcrest Remodel'],
    ['cm5', [0, 2, 4], 'Warehouse Lofts'],
    ['cm5', [1, 3], 'Park Ave Duplex'],
    ['cm6', [0, 1, 2, 3], 'Hillcrest Remodel'],
    // Double-booking conflict for Carlos on Wednesday
    ['cm1', [2], 'Downtown Retail'],
  ];

  schedule.forEach(([memberId, days, project]) => {
    days.forEach((dayIdx) => {
      assignments.push({
        id: `${memberId}-${dayIdx}-${project}`,
        crewMemberId: memberId,
        projectName: project,
        projectColor: PROJECT_COLORS[project],
        taskName: project === 'Riverside Office' ? 'Framing' : project === 'Oakwood Home' ? 'Electrical' : project === 'Downtown Retail' ? 'Demo' : project === 'Hillcrest Remodel' ? 'Painting' : project === 'Warehouse Lofts' ? 'Plumbing' : 'Finish Work',
        date: formatDateKey(weekDates[dayIdx]),
        type: dayIdx >= 5 ? 'off' : 'full',
      });
    });
  });

  // Weekend off for everyone
  CREW_MEMBERS.forEach((member) => {
    [5, 6].forEach((dayIdx) => {
      if (!assignments.some((a) => a.crewMemberId === member.id && a.date === formatDateKey(weekDates[dayIdx]))) {
        assignments.push({
          id: `${member.id}-${dayIdx}-off`,
          crewMemberId: member.id,
          projectName: '',
          projectColor: '',
          taskName: '',
          date: formatDateKey(weekDates[dayIdx]),
          type: 'off',
        });
      }
    });
  });

  return assignments;
}

const MOCK_ASSIGNMENTS = generateMockAssignments();

function getAvailability(
  memberId: string,
  dateKey: string,
  assignments: Assignment[]
): 'available' | 'partial' | 'full' | 'off' | 'conflict' {
  const dayAssignments = assignments.filter(
    (a) => a.crewMemberId === memberId && a.date === dateKey
  );
  if (dayAssignments.length === 0) return 'available';
  if (dayAssignments.some((a) => a.type === 'off')) return 'off';
  if (dayAssignments.length > 1 && dayAssignments.filter((a) => a.projectName).length > 1) return 'conflict';
  if (dayAssignments.some((a) => a.type === 'partial')) return 'partial';
  if (dayAssignments.some((a) => a.type === 'full')) return 'full';
  return 'available';
}

const availabilityColors: Record<string, string> = {
  available: 'bg-[#22c55e]/15 border-[#22c55e]/30',
  partial: 'bg-[#f59e0b]/15 border-[#f59e0b]/30',
  full: 'bg-[#ef4444]/10 border-[#ef4444]/20',
  off: 'bg-muted/50 border-muted',
  conflict: 'bg-[#ef4444]/15 border-[#ef4444]/40',
};

interface CrewCalendarProps {
  onCellClick?: (memberId: string, date: string) => void;
}

export function CrewCalendar({ onCellClick }: CrewCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [baseDate, setBaseDate] = useState(new Date());
  const assignments = MOCK_ASSIGNMENTS;

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const monthDates = useMemo(() => getMonthDates(baseDate), [baseDate]);

  const navigate = (dir: number) => {
    const d = new Date(baseDate);
    if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setBaseDate(d);
  };

  const dateRangeLabel =
    viewMode === 'week'
      ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[200px] text-center text-sm font-semibold">
            {dateRangeLabel}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBaseDate(new Date())}
            className="ml-2"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            className={viewMode === 'week' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            className={viewMode === 'month' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="w-[160px] border-b border-r p-2 text-left text-xs font-semibold text-muted-foreground">
                  Crew Member
                </th>
                {weekDates.map((d, i) => {
                  const isToday = formatDateKey(d) === formatDateKey(new Date());
                  return (
                    <th
                      key={i}
                      className={cn(
                        'border-b border-r p-2 text-center text-xs font-semibold',
                        isToday
                          ? 'bg-[#1e3a5f]/5 text-[#1e3a5f]'
                          : 'text-muted-foreground',
                        i >= 5 && 'bg-muted/20'
                      )}
                    >
                      <div>{DAY_LABELS[i]}</div>
                      <div className="text-[11px]">
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {CREW_MEMBERS.map((member) => (
                <tr key={member.id} className="hover:bg-muted/10">
                  <td className="border-b border-r p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-xs font-bold text-[#1e3a5f]">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((d, i) => {
                    const dateKey = formatDateKey(d);
                    const dayAssignments = assignments.filter(
                      (a) => a.crewMemberId === member.id && a.date === dateKey && a.projectName
                    );
                    const availability = getAvailability(member.id, dateKey, assignments);

                    return (
                      <td
                        key={i}
                        className={cn(
                          'border-b border-r p-1 align-top',
                          availabilityColors[availability],
                          'cursor-pointer transition-colors hover:opacity-80',
                          i >= 5 && 'bg-muted/20'
                        )}
                        onClick={() => onCellClick?.(member.id, dateKey)}
                      >
                        <div className="min-h-[52px] space-y-0.5">
                          {availability === 'conflict' && (
                            <div className="flex items-center gap-0.5 text-[10px] font-medium text-[#ef4444]">
                              <AlertTriangle className="size-3" />
                              Conflict
                            </div>
                          )}
                          {dayAssignments.map((a) => (
                            <div
                              key={a.id}
                              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
                              style={{ backgroundColor: a.projectColor }}
                            >
                              {a.projectName}
                              <div className="text-[10px] opacity-80">{a.taskName}</div>
                            </div>
                          ))}
                          {dayAssignments.length === 0 && availability === 'off' && (
                            <span className="text-[10px] text-muted-foreground">Off</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="w-[140px] border-b border-r p-2 text-left text-xs font-semibold text-muted-foreground">
                  Crew Member
                </th>
                {monthDates.slice(0, 7).map((d, i) => (
                  <th
                    key={i}
                    className="border-b border-r p-1 text-center text-[10px] font-semibold text-muted-foreground"
                  >
                    {DAY_LABELS[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CREW_MEMBERS.map((member) => (
                <tr key={member.id}>
                  <td className="border-b border-r p-2">
                    <p className="text-xs font-medium">{member.name}</p>
                  </td>
                  {monthDates.slice(0, 7).map((d, i) => {
                    const dateKey = formatDateKey(d);
                    const dayAssignments = assignments.filter(
                      (a) => a.crewMemberId === member.id && a.date === dateKey && a.projectName
                    );
                    const availability = getAvailability(member.id, dateKey, assignments);

                    return (
                      <td
                        key={i}
                        className={cn(
                          'border-b border-r p-0.5 text-center',
                          availabilityColors[availability],
                          'cursor-pointer'
                        )}
                        onClick={() => onCellClick?.(member.id, dateKey)}
                      >
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {dayAssignments.map((a) => (
                            <div
                              key={a.id}
                              className="size-2 rounded-full"
                              style={{ backgroundColor: a.projectColor }}
                              title={a.projectName}
                            />
                          ))}
                          {availability === 'conflict' && (
                            <AlertTriangle className="size-3 text-[#ef4444]" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/20 px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground">Projects:</span>
        {Object.entries(PROJECT_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div
              className="size-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs">{name}</span>
          </div>
        ))}
        <span className="ml-4 text-xs font-semibold text-muted-foreground">Status:</span>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-[#22c55e]/40" />
          <span className="text-xs">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-[#f59e0b]/40" />
          <span className="text-xs">Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-[#ef4444]/30" />
          <span className="text-xs">Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-muted" />
          <span className="text-xs">Off</span>
        </div>
      </div>
    </div>
  );
}
