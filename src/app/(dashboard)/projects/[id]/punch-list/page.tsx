'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Camera, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface PunchItem {
  id: string;
  description: string;
  assignedTo: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified';
  photoCount: number;
  location: string;
}

const MOCK_ITEMS: PunchItem[] = [
  { id: 'pi1', description: 'Touch up paint on north wall - conference room', assignedTo: 'Alex Foster', status: 'completed', photoCount: 2, location: 'Conf Room A' },
  { id: 'pi2', description: 'Fix gap in baseboard trim - hallway', assignedTo: 'Tony Sullivan', status: 'verified', photoCount: 1, location: 'Main Hall' },
  { id: 'pi3', description: 'Replace cracked outlet cover plate - Room 204', assignedTo: 'Dave Edwards', status: 'completed', photoCount: 1, location: 'Room 204' },
  { id: 'pi4', description: 'Adjust door closer tension - main entrance', assignedTo: 'Mike Rodriguez', status: 'in_progress', photoCount: 0, location: 'Entry' },
  { id: 'pi5', description: 'Caulk gap around window frame - office 3', assignedTo: 'Alex Foster', status: 'open', photoCount: 3, location: 'Office 3' },
  { id: 'pi6', description: 'Level cabinet doors in break room', assignedTo: 'Tony Sullivan', status: 'open', photoCount: 2, location: 'Break Room' },
  { id: 'pi7', description: 'Clean HVAC vent covers throughout', assignedTo: 'HVAC Co.', status: 'open', photoCount: 0, location: 'All Rooms' },
  { id: 'pi8', description: 'Patch drywall behind storage room door', assignedTo: 'Alex Foster', status: 'in_progress', photoCount: 1, location: 'Storage' },
];

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  in_progress: 1,
  completed: 2,
  verified: 3,
};

export default function PunchListPage() {
  const params = useParams();
  const [items, setItems] = useState(MOCK_ITEMS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newItemText, setNewItemText] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const completedCount = items.filter(
    (i) => i.status === 'completed' || i.status === 'verified'
  ).length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'completed' ? 'open' : 'completed' }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Punch List"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Punch List' },
        ]}
        actions={
          <Button
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="mr-2 size-4" />
            Add Item
          </Button>
        }
      />

      {/* Progress bar */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {completedCount} of {items.length} items completed
          </span>
          <span className="text-sm font-semibold text-[#1e3a5f]">{progressPct}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#22c55e] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Punch List Items */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3',
              index < filteredItems.length - 1 && 'border-b'
            )}
          >
            <Checkbox
              checked={item.status === 'completed' || item.status === 'verified'}
              onCheckedChange={() => toggleComplete(item.id)}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  (item.status === 'completed' || item.status === 'verified') &&
                    'text-muted-foreground line-through'
                )}
              >
                {item.description}
              </p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.assignedTo}</span>
                <span>{item.location}</span>
              </div>
            </div>
            <StatusBadge status={item.status} />
            {item.photoCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Camera className="size-3.5" />
                {item.photoCount}
              </div>
            )}
          </div>
        ))}

        {/* Inline add */}
        {showAdd && (
          <div className="flex items-center gap-3 border-t px-4 py-3">
            <Plus className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Describe the punch list item..."
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItemText.trim()) {
                  setItems((prev) => [
                    ...prev,
                    {
                      id: `pi-new-${Date.now()}`,
                      description: newItemText,
                      assignedTo: 'Unassigned',
                      status: 'open',
                      photoCount: 0,
                      location: '--',
                    },
                  ]);
                  setNewItemText('');
                }
                if (e.key === 'Escape') {
                  setShowAdd(false);
                  setNewItemText('');
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setNewItemText('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
