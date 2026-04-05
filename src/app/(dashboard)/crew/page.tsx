'use client';

import React from 'react';
import {
  Plus,
  HardHat,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { CrewCalendar } from '@/components/crew/CrewCalendar';
import { Progress } from '@/components/ui/progress';

export default function CrewPage() {
  const utilizationPct = 78;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crew & Resources"
        description="Schedule and manage your crew assignments"
        actions={
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
            <Plus className="mr-2 size-4" />
            Add Assignment
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Crew Size"
          value="6"
          icon={HardHat}
          description="active members"
        />
        <StatCard
          title="Assigned Today"
          value="5"
          icon={UserCheck}
          change="83%"
          changeType="positive"
          description="utilization"
        />
        <StatCard
          title="Available Today"
          value="1"
          icon={UserX}
          description="unassigned"
        />
        <StatCard
          title="Overtime This Week"
          value="4.5h"
          icon={Clock}
          change="+2h"
          changeType="negative"
          description="vs last week"
        />
      </div>

      {/* Calendar */}
      <CrewCalendar />

      {/* Capacity Summary */}
      <div className="rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Capacity Utilization</h3>
            <p className="text-xs text-muted-foreground">
              This week: {utilizationPct}% of crew time is assigned to projects
            </p>
          </div>
          <span className="text-2xl font-bold text-[#1e3a5f]">{utilizationPct}%</span>
        </div>
        <div className="mt-3">
          <Progress value={utilizationPct} className="h-3 bg-muted" />
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-[#1e3a5f]" />
            Assigned: 210h
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-muted" />
            Available: 60h
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-[#f59e0b]" />
            Overtime: 4.5h
          </span>
        </div>
      </div>
    </div>
  );
}
