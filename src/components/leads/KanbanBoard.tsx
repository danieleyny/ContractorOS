'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { LeadCard, type LeadCardData } from './LeadCard';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface PipelineStageData {
  id: string;
  name: string;
  color: string | null;
  display_order: number;
  is_won_stage: boolean;
  is_lost_stage: boolean;
}

interface KanbanBoardProps {
  stages: PipelineStageData[];
  leadsByStage: Record<string, LeadCardData[]>;
  onMoveLeadStage: (leadId: string, fromStageId: string, toStageId: string) => void;
}

// -------------------------------------------------------------------
// Mock data for development
// -------------------------------------------------------------------

const MOCK_STAGES: PipelineStageData[] = [
  { id: 's1', name: 'New Inquiry', color: '#6366f1', display_order: 1, is_won_stage: false, is_lost_stage: false },
  { id: 's2', name: 'Contacted', color: '#0ea5e9', display_order: 2, is_won_stage: false, is_lost_stage: false },
  { id: 's3', name: 'Estimate Sent', color: '#e8913a', display_order: 3, is_won_stage: false, is_lost_stage: false },
  { id: 's4', name: 'Negotiation', color: '#f59e0b', display_order: 4, is_won_stage: false, is_lost_stage: false },
  { id: 's5', name: 'Won', color: '#22c55e', display_order: 5, is_won_stage: true, is_lost_stage: false },
  { id: 's6', name: 'Lost', color: '#ef4444', display_order: 6, is_won_stage: false, is_lost_stage: true },
];

const MOCK_LEADS: Record<string, LeadCardData[]> = {
  s1: [
    { id: 'l1', first_name: 'John', last_name: 'Martinez', company_name: 'Martinez Properties', email: 'john@martinez.com', phone: '(555) 123-4567', lead_temperature: 'hot', estimated_value: 4500000, days_in_stage: 2, assigned_user_name: 'Mike Johnson', project_type: 'Kitchen Remodel', stage_id: 's1' },
    { id: 'l2', first_name: 'Sarah', last_name: 'Chen', company_name: null, email: 'sarah.chen@email.com', phone: '(555) 987-6543', lead_temperature: 'warm', estimated_value: 1200000, days_in_stage: 5, assigned_user_name: 'Mike Johnson', project_type: 'Bathroom Renovation', stage_id: 's1' },
    { id: 'l3', first_name: 'Robert', last_name: 'Williams', company_name: 'Williams & Co', email: 'rwilliams@co.com', phone: null, lead_temperature: 'cold', estimated_value: 800000, days_in_stage: 12, assigned_user_name: null, project_type: null, stage_id: 's1' },
  ],
  s2: [
    { id: 'l4', first_name: 'Emily', last_name: 'Davis', company_name: 'Davis Development', email: 'emily@davis-dev.com', phone: '(555) 456-7890', lead_temperature: 'hot', estimated_value: 8500000, days_in_stage: 1, assigned_user_name: 'Sarah Adams', project_type: 'Full Home Renovation', stage_id: 's2' },
    { id: 'l5', first_name: 'Michael', last_name: 'Brown', company_name: null, email: 'mbrown@email.com', phone: '(555) 321-0987', lead_temperature: 'warm', estimated_value: 2200000, days_in_stage: 7, assigned_user_name: 'Mike Johnson', project_type: 'Deck Construction', stage_id: 's2' },
  ],
  s3: [
    { id: 'l6', first_name: 'Lisa', last_name: 'Anderson', company_name: 'Anderson Real Estate', email: 'lisa@anderson-re.com', phone: '(555) 654-3210', lead_temperature: 'hot', estimated_value: 12000000, days_in_stage: 3, assigned_user_name: 'Sarah Adams', project_type: 'Commercial Buildout', stage_id: 's3' },
    { id: 'l7', first_name: 'David', last_name: 'Wilson', company_name: null, email: 'dwilson@email.com', phone: '(555) 111-2222', lead_temperature: 'warm', estimated_value: 3500000, days_in_stage: 14, assigned_user_name: 'Mike Johnson', project_type: 'Basement Finishing', stage_id: 's3' },
    { id: 'l8', first_name: 'Jennifer', last_name: 'Taylor', company_name: 'Taylor Holdings', email: 'jen@taylorhold.com', phone: null, lead_temperature: 'cold', estimated_value: 1800000, days_in_stage: 21, assigned_user_name: null, project_type: 'Roof Replacement', stage_id: 's3' },
  ],
  s4: [
    { id: 'l9', first_name: 'James', last_name: 'Moore', company_name: 'Moore Construction', email: 'james@moorec.com', phone: '(555) 333-4444', lead_temperature: 'hot', estimated_value: 25000000, days_in_stage: 6, assigned_user_name: 'Sarah Adams', project_type: 'New Home Build', stage_id: 's4' },
  ],
  s5: [
    { id: 'l10', first_name: 'Patricia', last_name: 'Jackson', company_name: null, email: 'pjackson@email.com', phone: '(555) 555-6666', lead_temperature: 'hot', estimated_value: 6700000, days_in_stage: 0, assigned_user_name: 'Mike Johnson', project_type: 'Kitchen Remodel', stage_id: 's5' },
  ],
  s6: [],
};

// -------------------------------------------------------------------
// Droppable Column
// -------------------------------------------------------------------

function KanbanColumn({
  stage,
  leads,
  children,
}: {
  stage: PipelineStageData;
  leads: LeadCardData[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = leads.reduce((sum, l) => sum + l.estimated_value, 0);
  const formattedValue = (totalValue / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-[300px] shrink-0 flex-col rounded-xl border bg-muted/30',
        isOver && 'ring-2 ring-[#e8913a]/50'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full"
            style={{ backgroundColor: stage.color || '#6b7280' }}
          />
          <h3 className="text-sm font-semibold">{stage.name}</h3>
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {formattedValue}
        </span>
      </div>

      {/* Cards list */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {children}
        {leads.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No leads in this stage
          </p>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main Board
// -------------------------------------------------------------------

export function KanbanBoard({
  stages: propStages,
  leadsByStage: propLeadsByStage,
  onMoveLeadStage,
}: Partial<KanbanBoardProps>) {
  // Fall back to mock data during development
  const stages = propStages || MOCK_STAGES;
  const initialLeads = propLeadsByStage || MOCK_LEADS;

  const [leadsByStage, setLeadsByStage] = useState<Record<string, LeadCardData[]>>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Flat list of all leads for finding the active card
  const allLeads = useMemo(
    () => Object.values(leadsByStage).flat(),
    [leadsByStage]
  );

  const activeLead = activeId ? allLeads.find((l) => l.id === activeId) : null;

  function findStageForLead(leadId: string): string | null {
    for (const [stageId, leads] of Object.entries(leadsByStage)) {
      if (leads.some((l) => l.id === leadId)) return stageId;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    const fromStageId = findStageForLead(activeLeadId);
    if (!fromStageId) return;

    // Determine target stage: either droppable column or another card's stage
    let toStageId: string | null = null;
    if (stages.some((s) => s.id === overId)) {
      toStageId = overId;
    } else {
      toStageId = findStageForLead(overId);
    }

    if (!toStageId || fromStageId === toStageId) return;

    // Move lead optimistically
    setLeadsByStage((prev) => {
      const fromLeads = prev[fromStageId]?.filter((l) => l.id !== activeLeadId) || [];
      const movedLead = prev[fromStageId]?.find((l) => l.id === activeLeadId);
      if (!movedLead) return prev;

      const toLeads = [...(prev[toStageId!] || []), { ...movedLead, stage_id: toStageId! }];

      return { ...prev, [fromStageId]: fromLeads, [toStageId!]: toLeads };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const toStageId = findStageForLead(leadId);
    if (!toStageId) return;

    // Only call API if stage actually changed
    const originalStageId = lead.stage_id;
    if (originalStageId !== toStageId && onMoveLeadStage) {
      onMoveLeadStage(leadId, originalStageId, toStageId);
    }
  }

  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStages.map((stage) => {
          const stageLeads = leadsByStage[stage.id] || [];
          const leadIds = stageLeads.map((l) => l.id);

          return (
            <KanbanColumn key={stage.id} stage={stage} leads={stageLeads}>
              <SortableContext
                items={leadIds}
                strategy={verticalListSortingStrategy}
              >
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
