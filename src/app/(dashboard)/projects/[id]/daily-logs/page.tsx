'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Sun,
  Cloud,
  CloudRain,
  Camera,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { DailyLogForm } from '@/components/projects/DailyLogForm';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  date: string;
  weather: string;
  tempHigh: number;
  tempLow: number;
  workSummary: string;
  materialsUsed: string;
  crewCount: number;
  totalHours: number;
  photoCount: number;
  loggedBy: string;
  visitors: string;
  safetyIncidents: string;
  delays: string;
}

const WEATHER_ICONS: Record<string, React.ElementType> = {
  Sunny: Sun,
  Cloudy: Cloud,
  Rainy: CloudRain,
};

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'dl1',
    date: '2026-04-03',
    weather: 'Sunny',
    tempHigh: 78,
    tempLow: 55,
    workSummary: 'Continued framing second floor exterior walls. Installed window headers on north side. Crew made good progress despite afternoon wind.',
    materialsUsed: '120 2x6x12 studs, 45 sheets 1/2" plywood, 8 LVL beams, 3 boxes 16d nails',
    crewCount: 6,
    totalHours: 48,
    photoCount: 8,
    loggedBy: 'Mike Rodriguez',
    visitors: 'Building inspector (routine check)',
    safetyIncidents: 'None',
    delays: '',
  },
  {
    id: 'dl2',
    date: '2026-04-02',
    weather: 'Cloudy',
    tempHigh: 72,
    tempLow: 51,
    workSummary: 'Began second floor framing. Set floor joists and subfloor on the west wing. Electrical rough-in started on first floor.',
    materialsUsed: '80 2x10x16 floor joists, 30 sheets 3/4" T&G plywood, 500ft Romex 12/2',
    crewCount: 8,
    totalHours: 64,
    photoCount: 12,
    loggedBy: 'Mike Rodriguez',
    visitors: '',
    safetyIncidents: 'None',
    delays: '',
  },
  {
    id: 'dl3',
    date: '2026-04-01',
    weather: 'Rainy',
    tempHigh: 65,
    tempLow: 48,
    workSummary: 'Rain delay in morning. Afternoon crew worked on interior first floor wall framing. Protected exposed lumber with tarps.',
    materialsUsed: '60 2x4x8 studs, 20 sheets OSB',
    crewCount: 4,
    totalHours: 24,
    photoCount: 3,
    loggedBy: 'Tony Sullivan',
    visitors: '',
    safetyIncidents: 'None',
    delays: 'Morning rain delayed start by 3 hours',
  },
  {
    id: 'dl4',
    date: '2026-03-31',
    weather: 'Sunny',
    tempHigh: 80,
    tempLow: 58,
    workSummary: 'Completed first floor wall framing. All load-bearing walls in place. Installed temporary bracing. Ready for second floor.',
    materialsUsed: '40 2x6x8 studs, 12 Simpson strong-ties, hardware',
    crewCount: 6,
    totalHours: 48,
    photoCount: 15,
    loggedBy: 'Mike Rodriguez',
    visitors: 'Client site visit (David Chen)',
    safetyIncidents: 'None',
    delays: '',
  },
  {
    id: 'dl5',
    date: '2026-03-30',
    weather: 'Sunny',
    tempHigh: 76,
    tempLow: 54,
    workSummary: 'Foundation inspection passed. Backfilled and compacted around foundation walls. Prepared sill plates and anchor bolts.',
    materialsUsed: '200ft sill gasket, 30 anchor bolts, pressure-treated sill plates',
    crewCount: 5,
    totalHours: 40,
    photoCount: 6,
    loggedBy: 'Carlos Delgado',
    visitors: 'Foundation inspector - Passed',
    safetyIncidents: 'None',
    delays: '',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DailyLogsPage() {
  const params = useParams();
  const [showForm, setShowForm] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Logs"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Daily Logs' },
        ]}
        actions={
          <Button
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-2 size-4" />
            New Log Entry
          </Button>
        }
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-foreground/10">
          <h3 className="mb-4 text-lg font-semibold">New Daily Log</h3>
          <DailyLogForm
            onSubmit={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Log entries */}
      <div className="space-y-3">
        {MOCK_LOGS.map((log) => {
          const isExpanded = expandedLog === log.id;
          const WeatherIcon = WEATHER_ICONS[log.weather] || Sun;

          return (
            <div
              key={log.id}
              className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10 transition-all"
            >
              {/* Collapsed summary */}
              <button
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]">
                  <WeatherIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{formatDate(log.date)}</p>
                    <span className="text-xs text-muted-foreground">
                      {log.weather} {log.tempHigh}&deg;/{log.tempLow}&deg;F
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {log.workSummary}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
                  <div className="flex items-center gap-1">
                    <Camera className="size-3.5" />
                    {log.photoCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {log.loggedBy}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Work Performed
                      </h4>
                      <p className="mt-1 text-sm">{log.workSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Materials Used
                      </h4>
                      <p className="mt-1 text-sm">{log.materialsUsed}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Crew
                      </h4>
                      <p className="mt-1 text-sm">
                        {log.crewCount} workers, {log.totalHours} total hours
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Visitors
                      </h4>
                      <p className="mt-1 text-sm">{log.visitors || 'None'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Safety Incidents
                      </h4>
                      <p className="mt-1 text-sm">{log.safetyIncidents}</p>
                    </div>
                  </div>
                  {log.delays && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Delays
                      </h4>
                      <p className="mt-1 text-sm text-[#f59e0b]">{log.delays}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
