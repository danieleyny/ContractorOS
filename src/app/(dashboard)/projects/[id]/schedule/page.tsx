'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { GanttChart } from '@/components/projects/GanttChart';
import { TaskList } from '@/components/projects/TaskList';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarPlaceholder() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Mock events on some days
  const eventDays = new Set([3, 7, 10, 14, 17, 21, 24, 28]);

  return (
    <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
      <h3 className="mb-4 text-center text-lg font-semibold">{monthName}</h3>
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`relative flex min-h-[80px] flex-col border p-1.5 text-sm ${
              day === today.getDate()
                ? 'bg-[#1e3a5f]/5 font-semibold'
                : day
                ? 'bg-white light-card'
                : 'bg-muted/30'
            }`}
          >
            {day && (
              <>
                <span
                  className={
                    day === today.getDate()
                      ? 'flex size-6 items-center justify-center rounded-full bg-[#1e3a5f] text-xs text-white'
                      : 'text-xs'
                  }
                >
                  {day}
                </span>
                {eventDays.has(day) && (
                  <div className="mt-1 rounded bg-[#e8913a]/10 px-1 py-0.5 text-[10px] text-[#e8913a]">
                    Task
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Schedule' },
        ]}
      />

      <Tabs defaultValue="gantt">
        <TabsList>
          <TabsTrigger value="gantt">Gantt View</TabsTrigger>
          <TabsTrigger value="tasks">Task List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt">
          <div className="mt-4 rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
            <GanttChart />
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="mt-4 rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
            <TaskList />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="mt-4">
            <CalendarPlaceholder />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
