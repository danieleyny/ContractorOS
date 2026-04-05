'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  File,
  Shield,
  ClipboardCheck,
  Image,
  FolderOpen,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  project: string;
  category: 'contract' | 'insurance' | 'permit' | 'plan' | 'photo' | 'other';
  uploadDate: string;
  uploadedBy: string;
  size: string;
  shared: boolean;
  expiryDate?: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Documents', icon: FolderOpen },
  { value: 'contract', label: 'Contracts', icon: FileText },
  { value: 'insurance', label: 'Insurance', icon: Shield },
  { value: 'permit', label: 'Permits', icon: ClipboardCheck },
  { value: 'plan', label: 'Plans', icon: File },
  { value: 'photo', label: 'Photos', icon: Image },
  { value: 'other', label: 'Other', icon: FolderOpen },
];

const categoryBadgeColors: Record<string, string> = {
  contract: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20',
  insurance: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
  permit: 'bg-[#e8913a]/10 text-[#e8913a] border-[#e8913a]/20',
  plan: 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20',
  photo: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  other: 'bg-muted text-muted-foreground border-muted',
};

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    name: 'Prime Contract - Riverside Office',
    project: 'Riverside Office Renovation',
    category: 'contract',
    uploadDate: '2026-01-10',
    uploadedBy: 'Sarah Johnson',
    size: '2.4 MB',
    shared: true,
  },
  {
    id: 'doc2',
    name: 'Subcontract - Volt Electric',
    project: 'Riverside Office Renovation',
    category: 'contract',
    uploadDate: '2026-01-15',
    uploadedBy: 'Sarah Johnson',
    size: '1.8 MB',
    shared: false,
  },
  {
    id: 'doc3',
    name: 'General Liability Policy',
    project: 'Company Wide',
    category: 'insurance',
    uploadDate: '2025-12-01',
    uploadedBy: 'Admin',
    size: '856 KB',
    shared: true,
    expiryDate: '2026-12-01',
  },
  {
    id: 'doc4',
    name: 'Workers Comp Certificate',
    project: 'Company Wide',
    category: 'insurance',
    uploadDate: '2025-11-15',
    uploadedBy: 'Admin',
    size: '432 KB',
    shared: true,
    expiryDate: '2026-04-15',
  },
  {
    id: 'doc5',
    name: 'Building Permit #BP-2026-0142',
    project: 'Riverside Office Renovation',
    category: 'permit',
    uploadDate: '2026-01-20',
    uploadedBy: 'Mike Rodriguez',
    size: '1.2 MB',
    shared: true,
    expiryDate: '2026-07-20',
  },
  {
    id: 'doc6',
    name: 'Electrical Permit #EP-2026-0089',
    project: 'Downtown Retail Buildout',
    category: 'permit',
    uploadDate: '2026-03-28',
    uploadedBy: 'Sarah Johnson',
    size: '945 KB',
    shared: false,
    expiryDate: '2026-09-28',
  },
  {
    id: 'doc7',
    name: 'Architectural Plans Rev C',
    project: 'Oakwood Custom Home',
    category: 'plan',
    uploadDate: '2026-02-14',
    uploadedBy: 'Mike Rodriguez',
    size: '18.5 MB',
    shared: true,
  },
  {
    id: 'doc8',
    name: 'MEP Drawings',
    project: 'Riverside Office Renovation',
    category: 'plan',
    uploadDate: '2026-01-22',
    uploadedBy: 'Sarah Johnson',
    size: '24.1 MB',
    shared: true,
  },
  {
    id: 'doc9',
    name: 'Kitchen Demo Progress',
    project: 'Hillcrest Kitchen & Bath',
    category: 'photo',
    uploadDate: '2026-03-05',
    uploadedBy: 'Mike Rodriguez',
    size: '3.7 MB',
    shared: false,
  },
  {
    id: 'doc10',
    name: 'Framing Inspection Photos',
    project: 'Oakwood Custom Home',
    category: 'photo',
    uploadDate: '2026-03-20',
    uploadedBy: 'Carlos Mendez',
    size: '5.2 MB',
    shared: true,
  },
  {
    id: 'doc11',
    name: 'Vendor Price List Q2 2026',
    project: 'Company Wide',
    category: 'other',
    uploadDate: '2026-03-25',
    uploadedBy: 'Admin',
    size: '1.1 MB',
    shared: false,
  },
  {
    id: 'doc12',
    name: 'Safety Certification - Summit Roofing',
    project: 'Company Wide',
    category: 'insurance',
    uploadDate: '2025-10-01',
    uploadedBy: 'Admin',
    size: '678 KB',
    shared: false,
    expiryDate: '2026-04-01',
  },
];

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return expiry.getTime() - now.getTime() < thirtyDays && expiry.getTime() > now.getTime();
}

function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00').getTime() < Date.now();
}

const DOC_COLUMNS: ColumnDef<Document>[] = [
  {
    header: 'Name',
    accessor: 'name',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{row.name}</p>
          {row.expiryDate && (
            <p
              className={cn(
                'text-[10px]',
                isExpired(row.expiryDate)
                  ? 'text-[#ef4444] font-medium'
                  : isExpiringSoon(row.expiryDate)
                    ? 'text-[#f59e0b] font-medium'
                    : 'text-muted-foreground'
              )}
            >
              {isExpired(row.expiryDate)
                ? 'EXPIRED'
                : isExpiringSoon(row.expiryDate)
                  ? 'Expiring soon'
                  : `Expires ${row.expiryDate}`}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: 'Project',
    accessor: 'project',
    sortable: true,
    cell: (row) => <span className="text-sm">{row.project}</span>,
  },
  {
    header: 'Category',
    accessor: 'category',
    cell: (row) => (
      <Badge className={cn('text-[10px]', categoryBadgeColors[row.category])}>
        {row.category.charAt(0).toUpperCase() + row.category.slice(1)}
      </Badge>
    ),
  },
  {
    header: 'Upload Date',
    accessor: 'uploadDate',
    sortable: true,
    cell: (row) => (
      <span className="text-sm tabular-nums">
        {new Date(row.uploadDate + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    header: 'Uploaded By',
    accessor: 'uploadedBy',
    cell: (row) => <span className="text-sm text-muted-foreground">{row.uploadedBy}</span>,
  },
  {
    header: 'Size',
    accessor: 'size',
    cell: (row) => <span className="text-sm tabular-nums text-muted-foreground">{row.size}</span>,
  },
  {
    header: 'Shared',
    accessor: 'shared',
    cell: (row) => (
      <Switch checked={row.shared} className="scale-75" />
    ),
  },
  {
    header: '',
    accessor: 'id',
    cell: () => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" className="size-7 p-0">
          <Eye className="size-3.5 text-muted-foreground" />
        </Button>
        <Button size="sm" variant="ghost" className="size-7 p-0">
          <Download className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    ),
  },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const filteredDocs =
    activeTab === 'all'
      ? MOCK_DOCUMENTS
      : MOCK_DOCUMENTS.filter((d) => d.category === activeTab);

  const expiringDocs = MOCK_DOCUMENTS.filter(
    (d) => d.expiryDate && (isExpiringSoon(d.expiryDate) || isExpired(d.expiryDate))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage project documents, contracts, and files"
        actions={
          <>
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 size-4" />
            Upload
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Drop Zone */}
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
                  <Upload className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop files here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse (PDF, DOC, JPG, PNG up to 50MB)
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Files
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label>Document Name</Label>
                  <Input placeholder="Enter document name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select defaultValue="other">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Link to Project</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riverside">Riverside Office Renovation</SelectItem>
                        <SelectItem value="oakwood">Oakwood Custom Home</SelectItem>
                        <SelectItem value="downtown">Downtown Retail Buildout</SelectItem>
                        <SelectItem value="hillcrest">Hillcrest Kitchen & Bath</SelectItem>
                        <SelectItem value="warehouse">Warehouse Conversion Lofts</SelectItem>
                        <SelectItem value="company">Company Wide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <Input placeholder="Add tags separated by commas" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Upload Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      {/* Expiry Alerts */}
      {expiringDocs.length > 0 && (
        <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4">
          <div className="flex items-center gap-2 text-[#f59e0b]">
            <AlertTriangle className="size-4" />
            <h3 className="text-sm font-semibold">
              Document Expiry Alerts ({expiringDocs.length})
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            {expiringDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="size-3" />
                    <span
                      className={
                        isExpired(doc.expiryDate)
                          ? 'font-medium text-[#ef4444]'
                          : 'font-medium text-[#f59e0b]'
                      }
                    >
                      {isExpired(doc.expiryDate) ? 'Expired' : 'Expires'}{' '}
                      {doc.expiryDate}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Renew
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count =
              cat.value === 'all'
                ? MOCK_DOCUMENTS.length
                : MOCK_DOCUMENTS.filter((d) => d.category === cat.value).length;
            return (
              <TabsTrigger key={cat.value} value={cat.value} className="gap-1.5">
                <Icon className="size-3.5" />
                {cat.label}
                <span className="ml-0.5 rounded bg-muted px-1 text-[10px] tabular-nums">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            columns={DOC_COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
            data={filteredDocs as unknown as Record<string, unknown>[]}
            searchable
            searchPlaceholder="Search documents..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
