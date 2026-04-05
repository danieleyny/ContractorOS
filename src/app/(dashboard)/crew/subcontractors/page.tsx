'use client';

import React, { useState } from 'react';
import {
  Plus,
  Users,
  AlertTriangle,
  Activity,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import {
  SubcontractorProfile,
  type SubcontractorData,
} from '@/components/crew/SubcontractorProfile';
import { cn } from '@/lib/utils';

type ViewMode = 'cards' | 'compliance';

const MOCK_SUBCONTRACTORS: SubcontractorData[] = [
  {
    id: 'sub1',
    companyName: 'Volt Electric Co.',
    contactName: 'Rick Sanchez',
    phone: '(555) 101-2001',
    email: 'rick@voltelectric.com',
    tradeSpecialties: ['Electrical', 'Low Voltage'],
    ratings: { quality: 4.8, timeliness: 4.5, communication: 4.7, price: 4.0, overall: 4.5 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'current', expiryDate: '2027-01-15' },
      { type: 'license', label: 'Electrical License', status: 'current', expiryDate: '2026-12-31' },
      { type: 'w9', label: 'W-9', status: 'on_file' },
    ],
    bidHistory: { totalBids: 12, winRate: 67, averageBidAmount: 28500 },
    wouldHireAgain: true,
    recentProjects: ['Riverside Office', 'Oakwood Home'],
  },
  {
    id: 'sub2',
    companyName: 'AquaFlow Plumbing',
    contactName: 'Maria Santos',
    phone: '(555) 202-3002',
    email: 'maria@aquaflow.com',
    tradeSpecialties: ['Plumbing', 'Gas Lines'],
    ratings: { quality: 4.6, timeliness: 4.2, communication: 4.4, price: 4.3, overall: 4.4 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'expiring_soon', expiryDate: '2026-04-28' },
      { type: 'license', label: 'Plumbing License', status: 'current', expiryDate: '2026-11-30' },
      { type: 'w9', label: 'W-9', status: 'on_file' },
    ],
    bidHistory: { totalBids: 8, winRate: 50, averageBidAmount: 19200 },
    wouldHireAgain: true,
    recentProjects: ['Warehouse Lofts', 'Park Ave Duplex'],
  },
  {
    id: 'sub3',
    companyName: 'Arctic Air HVAC',
    contactName: 'Tom Nguyen',
    phone: '(555) 303-4003',
    email: 'tom@arcticairhvac.com',
    tradeSpecialties: ['HVAC', 'Refrigeration'],
    ratings: { quality: 4.2, timeliness: 3.8, communication: 4.0, price: 4.5, overall: 4.1 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'current', expiryDate: '2026-09-15' },
      { type: 'license', label: 'HVAC License', status: 'expired', expiryDate: '2026-03-01' },
      { type: 'w9', label: 'W-9', status: 'on_file' },
    ],
    bidHistory: { totalBids: 5, winRate: 40, averageBidAmount: 34000 },
    wouldHireAgain: true,
    recentProjects: ['Riverside Office'],
  },
  {
    id: 'sub4',
    companyName: 'Solid Frame Construction',
    contactName: 'Dave Kowalski',
    phone: '(555) 404-5004',
    email: 'dave@solidframe.com',
    tradeSpecialties: ['Framing', 'Structural'],
    ratings: { quality: 4.9, timeliness: 4.7, communication: 4.3, price: 3.8, overall: 4.4 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'current', expiryDate: '2026-08-20' },
      { type: 'license', label: 'Contractor License', status: 'current', expiryDate: '2027-02-28' },
      { type: 'w9', label: 'W-9', status: 'on_file' },
    ],
    bidHistory: { totalBids: 15, winRate: 73, averageBidAmount: 42000 },
    wouldHireAgain: true,
    recentProjects: ['Oakwood Home', 'Downtown Retail', 'Warehouse Lofts'],
  },
  {
    id: 'sub5',
    companyName: 'ProCoat Painting',
    contactName: 'Lisa Chang',
    phone: '(555) 505-6005',
    email: 'lisa@procoat.com',
    tradeSpecialties: ['Painting', 'Wallcovering'],
    ratings: { quality: 4.4, timeliness: 4.6, communication: 4.8, price: 4.2, overall: 4.5 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'current', expiryDate: '2026-11-10' },
      { type: 'license', label: 'Business License', status: 'current', expiryDate: '2026-12-31' },
      { type: 'w9', label: 'W-9', status: 'missing' },
    ],
    bidHistory: { totalBids: 10, winRate: 60, averageBidAmount: 15800 },
    wouldHireAgain: true,
    recentProjects: ['Hillcrest Remodel'],
  },
  {
    id: 'sub6',
    companyName: 'Summit Roofing',
    contactName: 'James O\'Brien',
    phone: '(555) 606-7006',
    email: 'james@summitroofing.com',
    tradeSpecialties: ['Roofing', 'Gutters'],
    ratings: { quality: 3.9, timeliness: 3.5, communication: 3.6, price: 4.1, overall: 3.8 },
    compliance: [
      { type: 'insurance', label: 'General Liability', status: 'expired', expiryDate: '2026-02-15' },
      { type: 'license', label: 'Roofing License', status: 'expiring_soon', expiryDate: '2026-04-20' },
      { type: 'w9', label: 'W-9', status: 'on_file' },
    ],
    bidHistory: { totalBids: 7, winRate: 29, averageBidAmount: 22500 },
    wouldHireAgain: false,
    recentProjects: ['Oakwood Home'],
  },
];

const ALL_TRADES = [
  'Electrical',
  'Low Voltage',
  'Plumbing',
  'Gas Lines',
  'HVAC',
  'Refrigeration',
  'Framing',
  'Structural',
  'Painting',
  'Wallcovering',
  'Roofing',
  'Gutters',
];

function ComplianceDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    current: 'bg-[#22c55e]',
    on_file: 'bg-[#22c55e]',
    expiring_soon: 'bg-[#f59e0b]',
    expired: 'bg-[#ef4444]',
    missing: 'bg-[#ef4444]',
  };
  return (
    <span
      className={cn('inline-block size-2.5 rounded-full', colors[status] ?? 'bg-muted')}
      title={status.replace('_', ' ')}
    />
  );
}

function getOverallCompliance(sub: SubcontractorData): 'good' | 'warning' | 'critical' {
  const hasExpired = sub.compliance.some((c) => c.status === 'expired' || c.status === 'missing');
  const hasExpiring = sub.compliance.some((c) => c.status === 'expiring_soon');
  if (hasExpired) return 'critical';
  if (hasExpiring) return 'warning';
  return 'good';
}

export default function SubcontractorsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredSubs = MOCK_SUBCONTRACTORS.filter((sub) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !sub.companyName.toLowerCase().includes(q) &&
        !sub.contactName.toLowerCase().includes(q)
      )
        return false;
    }
    if (tradeFilter !== 'all' && !sub.tradeSpecialties.some((t) => t === tradeFilter))
      return false;
    if (complianceFilter !== 'all') {
      const overall = getOverallCompliance(sub);
      if (complianceFilter === 'good' && overall !== 'good') return false;
      if (complianceFilter === 'issues' && overall === 'good') return false;
    }
    return true;
  });

  const activeSubs = MOCK_SUBCONTRACTORS.filter((s) => s.recentProjects.length > 0).length;
  const complianceAlerts = MOCK_SUBCONTRACTORS.filter(
    (s) => getOverallCompliance(s) !== 'good'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcontractors"
        description="Manage your subcontractor relationships"
        breadcrumbs={[
          { label: 'Crew', href: '/crew' },
          { label: 'Subcontractors' },
        ]}
        actions={
          <>
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Subcontractor
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Subcontractor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Company Name</Label>
                    <Input placeholder="Company name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contact Name</Label>
                    <Input placeholder="Primary contact" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Trade Specialties</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trades" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TRADES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    Select primary trade specialty
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Service Area</Label>
                  <Input placeholder="e.g., Tri-state area" />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional notes..." rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Add Subcontractor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Subcontractors"
          value={String(MOCK_SUBCONTRACTORS.length)}
          icon={Users}
          description="registered"
        />
        <StatCard
          title="Active (w/ Projects)"
          value={String(activeSubs)}
          icon={Activity}
          change={`${Math.round((activeSubs / MOCK_SUBCONTRACTORS.length) * 100)}%`}
          changeType="positive"
          description="currently working"
        />
        <StatCard
          title="Compliance Alerts"
          value={String(complianceAlerts)}
          icon={AlertTriangle}
          change={complianceAlerts > 0 ? 'Action needed' : 'All clear'}
          changeType={complianceAlerts > 0 ? 'negative' : 'positive'}
          description="expired or expiring docs"
        />
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-start justify-between gap-4">
        <SearchFilter
          searchPlaceholder="Search subcontractors..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              label: 'Trade',
              value: tradeFilter,
              onChange: setTradeFilter,
              options: [
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Plumbing', value: 'Plumbing' },
                { label: 'HVAC', value: 'HVAC' },
                { label: 'Framing', value: 'Framing' },
                { label: 'Painting', value: 'Painting' },
                { label: 'Roofing', value: 'Roofing' },
              ],
            },
            {
              label: 'Compliance',
              value: complianceFilter,
              onChange: setComplianceFilter,
              options: [
                { label: 'Good Standing', value: 'good' },
                { label: 'Has Issues', value: 'issues' },
              ],
            },
          ]}
          onClearFilters={() => {
            setSearch('');
            setTradeFilter('all');
            setComplianceFilter('all');
          }}
        />
        <div className="flex shrink-0 items-center gap-1 rounded-lg border p-1">
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            className={viewMode === 'cards' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'compliance' ? 'default' : 'ghost'}
            className={viewMode === 'compliance' ? 'bg-[#1e3a5f] text-white' : ''}
            onClick={() => setViewMode('compliance')}
          >
            <TableIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSubs.map((sub) => (
            <SubcontractorProfile key={sub.id} data={sub} />
          ))}
        </div>
      )}

      {/* Compliance Table View */}
      {viewMode === 'compliance' && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead className="text-center">Insurance</TableHead>
                <TableHead className="text-center">Insurance Expiry</TableHead>
                <TableHead className="text-center">License</TableHead>
                <TableHead className="text-center">License Expiry</TableHead>
                <TableHead className="text-center">W-9</TableHead>
                <TableHead className="text-center">Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => {
                const insurance = sub.compliance.find((c) => c.type === 'insurance');
                const license = sub.compliance.find((c) => c.type === 'license');
                const w9 = sub.compliance.find((c) => c.type === 'w9');
                const overall = getOverallCompliance(sub);

                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{sub.companyName}</p>
                        <p className="text-xs text-muted-foreground">{sub.contactName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sub.tradeSpecialties.map((t) => (
                          <Badge
                            key={t}
                            className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20 text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {insurance && <ComplianceDot status={insurance.status} />}
                    </TableCell>
                    <TableCell className="text-center text-xs tabular-nums">
                      {insurance?.expiryDate ?? '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {license && <ComplianceDot status={license.status} />}
                    </TableCell>
                    <TableCell className="text-center text-xs tabular-nums">
                      {license?.expiryDate ?? '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {w9 && <ComplianceDot status={w9.status} />}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          'text-[10px]',
                          overall === 'good'
                            ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
                            : overall === 'warning'
                              ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                              : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                        )}
                      >
                        {overall === 'good'
                          ? 'Good'
                          : overall === 'warning'
                            ? 'Warning'
                            : 'Critical'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
