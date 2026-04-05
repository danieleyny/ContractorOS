'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Upload,
  Folder,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  ArrowLeft,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

interface DocFolder {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
}

interface DocFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: string;
  folder: string;
  sharedWithClient: boolean;
}

const FOLDERS: DocFolder[] = [
  { id: 'contracts', name: 'Contracts', icon: FileText, count: 2 },
  { id: 'plans', name: 'Plans', icon: FileImage, count: 1 },
  { id: 'permits', name: 'Permits', icon: FileText, count: 1 },
  { id: 'photos', name: 'Photos', icon: FileImage, count: 0 },
  { id: 'invoices', name: 'Invoices', icon: FileSpreadsheet, count: 1 },
  { id: 'other', name: 'Other', icon: File, count: 1 },
];

const MOCK_FILES: DocFile[] = [
  {
    id: 'f1',
    name: 'General Contract - Riverside Holdings.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedBy: 'Sarah Johnson',
    date: '2026-01-10',
    folder: 'contracts',
    sharedWithClient: true,
  },
  {
    id: 'f2',
    name: 'Subcontractor Agreement - HVAC Co.pdf',
    type: 'pdf',
    size: '1.1 MB',
    uploadedBy: 'Sarah Johnson',
    date: '2026-01-15',
    folder: 'contracts',
    sharedWithClient: false,
  },
  {
    id: 'f3',
    name: 'Floor Plans - Revised v3.pdf',
    type: 'pdf',
    size: '8.7 MB',
    uploadedBy: 'Mike Rodriguez',
    date: '2026-02-20',
    folder: 'plans',
    sharedWithClient: true,
  },
  {
    id: 'f4',
    name: 'Building Permit BP-2026-1423.pdf',
    type: 'pdf',
    size: '540 KB',
    uploadedBy: 'Sarah Johnson',
    date: '2026-01-10',
    folder: 'permits',
    sharedWithClient: true,
  },
  {
    id: 'f5',
    name: 'Progress Invoice #3.xlsx',
    type: 'xlsx',
    size: '320 KB',
    uploadedBy: 'Sarah Johnson',
    date: '2026-03-31',
    folder: 'invoices',
    sharedWithClient: true,
  },
  {
    id: 'f6',
    name: 'Safety Compliance Checklist.pdf',
    type: 'pdf',
    size: '185 KB',
    uploadedBy: 'Mike Rodriguez',
    date: '2026-02-01',
    folder: 'other',
    sharedWithClient: false,
  },
];

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  jpg: FileImage,
  png: FileImage,
  default: File,
};

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentsPage() {
  const params = useParams();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState(MOCK_FILES);

  const currentFiles = currentFolder
    ? files.filter((f) => f.folder === currentFolder)
    : [];

  const currentFolderData = FOLDERS.find((f) => f.id === currentFolder);

  const toggleShare = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, sharedWithClient: !f.sharedWithClient } : f
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Riverside Office Renovation', href: `/projects/${params.id}` },
          { label: 'Documents' },
        ]}
        actions={
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
            <Upload className="mr-2 size-4" />
            Upload
          </Button>
        }
      />

      {!currentFolder ? (
        /* Folder Grid */
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {FOLDERS.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setCurrentFolder(folder.id)}
              className="flex flex-col items-center gap-2 rounded-xl bg-white light-card p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]">
                <Folder className="size-6" />
              </div>
              <span className="text-sm font-medium">{folder.name}</span>
              <span className="text-xs text-muted-foreground">
                {folder.count} files
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* File List */
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder(null)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-1 size-4" />
            Back to folders
          </Button>

          <h2 className="text-lg font-semibold">{currentFolderData?.name}</h2>

          <div className="rounded-xl bg-white light-card shadow-sm ring-1 ring-foreground/10">
            {currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <File className="mb-2 size-8" />
                <p className="text-sm">No files in this folder</p>
              </div>
            ) : (
              currentFiles.map((file, index) => {
                const FileIcon = FILE_ICONS[file.type] || FILE_ICONS.default;

                return (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3',
                      index < currentFiles.length - 1 && 'border-b'
                    )}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f]">
                      <FileIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{file.size}</span>
                        <div className="flex items-center gap-1">
                          <User className="size-3" />
                          {file.uploadedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(file.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Label htmlFor={`share-${file.id}`} className="text-xs text-muted-foreground">
                        Share
                      </Label>
                      <Switch
                        id={`share-${file.id}`}
                        checked={file.sharedWithClient}
                        onCheckedChange={() => toggleShare(file.id)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
