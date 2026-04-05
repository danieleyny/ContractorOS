'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Upload, X, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

interface PhotoItem {
  id: string;
  caption: string;
  date: string;
  uploadedBy: string;
  category: string;
  color: string; // placeholder color
}

const MOCK_PHOTOS: PhotoItem[] = [
  { id: 'ph1', caption: 'Foundation pour - west side', date: '2026-03-20', uploadedBy: 'Carlos Delgado', category: 'Foundation', color: 'bg-amber-200' },
  { id: 'ph2', caption: 'Framing first floor complete', date: '2026-03-31', uploadedBy: 'Mike Rodriguez', category: 'Framing', color: 'bg-blue-200' },
  { id: 'ph3', caption: 'Electrical rough-in progress', date: '2026-04-02', uploadedBy: 'Dave Edwards', category: 'Electrical', color: 'bg-yellow-200' },
  { id: 'ph4', caption: 'Second floor joists installed', date: '2026-04-02', uploadedBy: 'Tony Sullivan', category: 'Framing', color: 'bg-green-200' },
  { id: 'ph5', caption: 'Site overview aerial shot', date: '2026-04-01', uploadedBy: 'Mike Rodriguez', category: 'General', color: 'bg-purple-200' },
  { id: 'ph6', caption: 'Window header detail', date: '2026-04-03', uploadedBy: 'Tony Sullivan', category: 'Framing', color: 'bg-pink-200' },
  { id: 'ph7', caption: 'Foundation inspection passed', date: '2026-03-30', uploadedBy: 'Carlos Delgado', category: 'Inspection', color: 'bg-teal-200' },
  { id: 'ph8', caption: 'Material delivery - lumber', date: '2026-03-28', uploadedBy: 'Mike Rodriguez', category: 'Materials', color: 'bg-orange-200' },
];

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PhotosPage() {
  const params = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');

  const uniqueDates = [...new Set(MOCK_PHOTOS.map((p) => p.date))].sort().reverse();

  const filteredPhotos = MOCK_PHOTOS.filter((p) => {
    if (dateFilter !== 'all' && p.date !== dateFilter) return false;
    return true;
  });

  const selectedPhotoData = MOCK_PHOTOS.find((p) => p.id === selectedPhoto);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photos"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Photos' },
        ]}
        actions={
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
            <Upload className="mr-2 size-4" />
            Upload Photos
          </Button>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {uniqueDates.map((d) => (
              <SelectItem key={d} value={d}>
                {formatDate(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo.id)}
            className="cursor-pointer overflow-hidden rounded-xl bg-white light-card shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
          >
            {/* Placeholder image */}
            <div
              className={cn(
                'flex aspect-[4/3] items-center justify-center',
                photo.color
              )}
            >
              <ImageIcon className="size-12 text-white/60" />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{photo.caption}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(photo.date)}</span>
                <span>{photo.uploadedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhotoData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full mx-4 overflow-hidden rounded-xl bg-white light-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="size-5" />
            </Button>
            <div
              className={cn(
                'flex aspect-[16/10] items-center justify-center',
                selectedPhotoData.color
              )}
            >
              <ImageIcon className="size-24 text-white/60" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold">{selectedPhotoData.caption}</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(selectedPhotoData.date)}
                </div>
                <div className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {selectedPhotoData.uploadedBy}
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                  {selectedPhotoData.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
