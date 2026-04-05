'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface TaskItem {
  id: string;
  name: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completionPercentage: number;
  subtasks?: TaskItem[];
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: 'tk1',
    name: 'Site Preparation',
    assignedTo: 'Mike Rodriguez',
    dueDate: '2026-03-13',
    priority: 'high',
    status: 'completed',
    completionPercentage: 100,
    subtasks: [
      { id: 'tk1-1', name: 'Clear vegetation', assignedTo: 'Mike Rodriguez', dueDate: '2026-03-06', priority: 'medium', status: 'completed', completionPercentage: 100 },
      { id: 'tk1-2', name: 'Grade site', assignedTo: 'Mike Rodriguez', dueDate: '2026-03-10', priority: 'medium', status: 'completed', completionPercentage: 100 },
      { id: 'tk1-3', name: 'Install erosion controls', assignedTo: 'Mike Rodriguez', dueDate: '2026-03-13', priority: 'high', status: 'completed', completionPercentage: 100 },
    ],
  },
  {
    id: 'tk2',
    name: 'Foundation Work',
    assignedTo: 'Carlos Delgado',
    dueDate: '2026-03-27',
    priority: 'high',
    status: 'completed',
    completionPercentage: 100,
    subtasks: [
      { id: 'tk2-1', name: 'Excavation', assignedTo: 'Carlos Delgado', dueDate: '2026-03-20', priority: 'high', status: 'completed', completionPercentage: 100 },
      { id: 'tk2-2', name: 'Pour footings', assignedTo: 'Carlos Delgado', dueDate: '2026-03-27', priority: 'high', status: 'completed', completionPercentage: 100 },
    ],
  },
  {
    id: 'tk3',
    name: 'Framing',
    assignedTo: 'Tony Sullivan',
    dueDate: '2026-04-17',
    priority: 'high',
    status: 'in_progress',
    completionPercentage: 65,
    subtasks: [
      { id: 'tk3-1', name: 'First floor walls', assignedTo: 'Tony Sullivan', dueDate: '2026-04-07', priority: 'high', status: 'completed', completionPercentage: 100 },
      { id: 'tk3-2', name: 'Second floor & roof', assignedTo: 'Tony Sullivan', dueDate: '2026-04-17', priority: 'high', status: 'in_progress', completionPercentage: 30 },
    ],
  },
  {
    id: 'tk4',
    name: 'Rough Electrical',
    assignedTo: 'Dave Edwards',
    dueDate: '2026-04-24',
    priority: 'medium',
    status: 'in_progress',
    completionPercentage: 30,
  },
  {
    id: 'tk5',
    name: 'Rough Plumbing',
    assignedTo: 'Jim Patterson',
    dueDate: '2026-04-24',
    priority: 'medium',
    status: 'not_started',
    completionPercentage: 0,
  },
  {
    id: 'tk6',
    name: 'HVAC Rough-In',
    assignedTo: 'HVAC Co.',
    dueDate: '2026-05-01',
    priority: 'medium',
    status: 'not_started',
    completionPercentage: 0,
  },
  {
    id: 'tk7',
    name: 'Insulation',
    assignedTo: 'Tony Sullivan',
    dueDate: '2026-05-08',
    priority: 'low',
    status: 'not_started',
    completionPercentage: 0,
  },
  {
    id: 'tk8',
    name: 'Drywall Installation',
    assignedTo: 'Alex Foster',
    dueDate: '2026-05-22',
    priority: 'medium',
    status: 'not_started',
    completionPercentage: 0,
  },
  {
    id: 'tk9',
    name: 'Interior Finishes',
    assignedTo: 'Alex Foster',
    dueDate: '2026-06-05',
    priority: 'high',
    status: 'blocked',
    completionPercentage: 0,
  },
  {
    id: 'tk10',
    name: 'Final Punch List',
    assignedTo: 'Mike Rodriguez',
    dueDate: '2026-06-08',
    priority: 'urgent',
    status: 'not_started',
    completionPercentage: 0,
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-[#1e3a5f]/10 text-[#1e3a5f]',
  high: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  urgent: 'bg-[#ef4444]/10 text-[#ef4444]',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function TaskRow({
  task,
  depth = 0,
}: {
  task: TaskItem;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [status, setStatus] = useState(task.status);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 border-b px-3 py-2.5 text-sm transition-colors hover:bg-muted/30',
          depth > 0 && 'bg-muted/10'
        )}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Expand toggle */}
        <div className="w-4 shrink-0">
          {hasSubtasks && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )}
        </div>

        {/* Checkbox */}
        <Checkbox
          checked={status === 'completed'}
          onCheckedChange={(checked) => {
            setStatus(checked ? 'completed' : 'not_started');
          }}
        />

        {/* Name */}
        <span
          className={cn(
            'min-w-0 flex-1 truncate font-medium',
            status === 'completed' && 'text-muted-foreground line-through'
          )}
        >
          {task.name}
        </span>

        {/* Assigned to */}
        <span className="hidden w-[120px] shrink-0 truncate text-xs text-muted-foreground sm:block">
          {task.assignedTo}
        </span>

        {/* Due date */}
        <span className="w-[70px] shrink-0 text-xs text-muted-foreground">
          {formatDate(task.dueDate)}
        </span>

        {/* Priority badge */}
        <span
          className={cn(
            'shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium capitalize',
            PRIORITY_COLORS[task.priority]
          )}
        >
          {task.priority}
        </span>

        {/* Status */}
        <div className="w-[100px] shrink-0">
          <Select value={status} onValueChange={(val) => setStatus(val as TaskItem['status'])}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Completion */}
        <div className="hidden w-[80px] shrink-0 items-center gap-2 lg:flex">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#1e3a5f] transition-all"
              style={{ width: `${task.completionPercentage}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {task.completionPercentage}%
          </span>
        </div>
      </div>

      {/* Subtasks */}
      {hasSubtasks &&
        expanded &&
        task.subtasks!.map((sub) => (
          <TaskRow key={sub.id} task={sub} depth={depth + 1} />
        ))}
    </>
  );
}

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newTaskName, setNewTaskName] = useState('');

  const filteredTasks = MOCK_TASKS.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
          <div className="w-4 shrink-0" />
          <div className="w-5 shrink-0" />
          <span className="min-w-0 flex-1">Task</span>
          <span className="hidden w-[120px] shrink-0 sm:block">Assigned</span>
          <span className="w-[70px] shrink-0">Due</span>
          <span className="w-[70px] shrink-0">Priority</span>
          <span className="w-[100px] shrink-0">Status</span>
          <span className="hidden w-[80px] shrink-0 lg:block">Progress</span>
        </div>

        {filteredTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}

        {/* Quick add */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-4 shrink-0" />
          <Plus className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add a new task..."
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTaskName.trim()) {
                setNewTaskName('');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
