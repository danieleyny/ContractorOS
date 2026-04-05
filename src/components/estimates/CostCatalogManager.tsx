'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Upload,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { SearchFilter } from '@/components/shared/SearchFilter';
import type { UnitOfMeasure } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  sku: string;
  unit: UnitOfMeasure;
  unitCostCents: number;
  markupPercent: number;
  preferredVendor: string;
  tags: string[];
  cascadeUpdates: boolean;
  isActive: boolean;
  lastPriceUpdate: string;
  priceHistory: { date: string; costCents: number }[];
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CATALOG: CatalogItem[] = [
  {
    id: 'cc-001',
    name: 'Shaker Base Cabinet (per linear ft)',
    description: 'White painted shaker-style base cabinet',
    category: 'Finishes',
    subcategory: 'Cabinetry',
    sku: 'CAB-SHK-BASE',
    unit: 'lnft',
    unitCostCents: 85000,
    markupPercent: 20,
    preferredVendor: 'Cabinet Depot',
    tags: ['kitchen', 'cabinet', 'shaker'],
    cascadeUpdates: true,
    isActive: true,
    lastPriceUpdate: '2026-03-15',
    priceHistory: [
      { date: '2026-01-01', costCents: 80000 },
      { date: '2026-02-01', costCents: 82000 },
      { date: '2026-03-15', costCents: 85000 },
    ],
  },
  {
    id: 'cc-002',
    name: '2x4 SPF Stud 8ft',
    description: 'Kiln-dried spruce-pine-fir framing stud',
    category: 'Framing',
    subcategory: 'Lumber',
    sku: 'FRM-2X4-8',
    unit: 'each',
    unitCostCents: 450,
    markupPercent: 20,
    preferredVendor: 'Lumber Yard Supply',
    tags: ['framing', 'lumber', 'stud'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-04-01',
    priceHistory: [
      { date: '2026-01-01', costCents: 525 },
      { date: '2026-02-01', costCents: 480 },
      { date: '2026-04-01', costCents: 450 },
    ],
  },
  {
    id: 'cc-003',
    name: 'Romex 12/2 NM-B Wire',
    description: '250ft roll of 12-gauge non-metallic sheathed wire',
    category: 'Electrical',
    subcategory: 'Wire & Cable',
    sku: 'ELC-ROM-122',
    unit: 'lnft',
    unitCostCents: 85,
    markupPercent: 25,
    preferredVendor: 'Electrical Wholesale',
    tags: ['electrical', 'wire', 'romex'],
    cascadeUpdates: true,
    isActive: true,
    lastPriceUpdate: '2026-03-20',
    priceHistory: [
      { date: '2026-01-01', costCents: 90 },
      { date: '2026-02-15', costCents: 88 },
      { date: '2026-03-20', costCents: 85 },
    ],
  },
  {
    id: 'cc-004',
    name: 'PEX Tubing 1/2" (per ft)',
    description: 'Red or blue PEX-A tubing for potable water',
    category: 'Plumbing',
    subcategory: 'Piping',
    sku: 'PLB-PEX-12',
    unit: 'lnft',
    unitCostCents: 120,
    markupPercent: 20,
    preferredVendor: 'Plumbing Pro Supply',
    tags: ['plumbing', 'pex', 'water'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-02-28',
    priceHistory: [
      { date: '2026-01-01', costCents: 115 },
      { date: '2026-02-28', costCents: 120 },
    ],
  },
  {
    id: 'cc-005',
    name: 'Quartz Countertop (installed)',
    description: 'Mid-range quartz slab with fabrication and install',
    category: 'Finishes',
    subcategory: 'Countertops',
    sku: 'FIN-QTZ-MID',
    unit: 'sqft',
    unitCostCents: 7500,
    markupPercent: 25,
    preferredVendor: 'Stone Fabricators Inc',
    tags: ['countertop', 'quartz', 'kitchen'],
    cascadeUpdates: true,
    isActive: true,
    lastPriceUpdate: '2026-03-01',
    priceHistory: [
      { date: '2026-01-01', costCents: 7200 },
      { date: '2026-03-01', costCents: 7500 },
    ],
  },
  {
    id: 'cc-006',
    name: 'Drywall 4x8 1/2" Sheet',
    description: 'Standard gypsum drywall sheet',
    category: 'Finishes',
    subcategory: 'Drywall',
    sku: 'FIN-DRY-48',
    unit: 'each',
    unitCostCents: 1400,
    markupPercent: 20,
    preferredVendor: 'Lumber Yard Supply',
    tags: ['drywall', 'gypsum', 'wall'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-03-10',
    priceHistory: [
      { date: '2026-01-01', costCents: 1350 },
      { date: '2026-03-10', costCents: 1400 },
    ],
  },
  {
    id: 'cc-007',
    name: 'Skilled Labor (Journeyman)',
    description: 'Journeyman-level carpenter, electrician, or plumber',
    category: 'General',
    subcategory: 'Labor',
    sku: 'LBR-SKILL',
    unit: 'hour',
    unitCostCents: 6500,
    markupPercent: 30,
    preferredVendor: '',
    tags: ['labor', 'skilled', 'journeyman'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-01-01',
    priceHistory: [
      { date: '2025-07-01', costCents: 6000 },
      { date: '2026-01-01', costCents: 6500 },
    ],
  },
  {
    id: 'cc-008',
    name: 'General Labor (Helper)',
    description: 'General helper / apprentice labor',
    category: 'General',
    subcategory: 'Labor',
    sku: 'LBR-GEN',
    unit: 'hour',
    unitCostCents: 3500,
    markupPercent: 30,
    preferredVendor: '',
    tags: ['labor', 'general', 'helper'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-01-01',
    priceHistory: [
      { date: '2025-07-01', costCents: 3200 },
      { date: '2026-01-01', costCents: 3500 },
    ],
  },
  {
    id: 'cc-009',
    name: 'GFCI Outlet (installed)',
    description: 'Ground-fault circuit interrupter outlet with cover plate',
    category: 'Electrical',
    subcategory: 'Devices',
    sku: 'ELC-GFCI-01',
    unit: 'each',
    unitCostCents: 4500,
    markupPercent: 25,
    preferredVendor: 'Electrical Wholesale',
    tags: ['electrical', 'outlet', 'gfci'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-02-15',
    priceHistory: [
      { date: '2026-01-01', costCents: 4200 },
      { date: '2026-02-15', costCents: 4500 },
    ],
  },
  {
    id: 'cc-010',
    name: 'Concrete (3000 PSI)',
    description: 'Ready-mix concrete delivered',
    category: 'Demo',
    subcategory: 'Concrete',
    sku: 'DEM-CON-3K',
    unit: 'cuyd',
    unitCostCents: 16500,
    markupPercent: 15,
    preferredVendor: 'Metro Concrete',
    tags: ['concrete', 'foundation', 'pour'],
    cascadeUpdates: true,
    isActive: true,
    lastPriceUpdate: '2026-03-25',
    priceHistory: [
      { date: '2026-01-01', costCents: 15500 },
      { date: '2026-02-01', costCents: 16000 },
      { date: '2026-03-25', costCents: 16500 },
    ],
  },
  {
    id: 'cc-011',
    name: 'Waste Disposal Dumpster (10yd)',
    description: '10-yard roll-off dumpster rental (7-day)',
    category: 'Demo',
    subcategory: 'Disposal',
    sku: 'DEM-DMP-10',
    unit: 'each',
    unitCostCents: 45000,
    markupPercent: 15,
    preferredVendor: 'City Waste Services',
    tags: ['dumpster', 'disposal', 'demo'],
    cascadeUpdates: false,
    isActive: true,
    lastPriceUpdate: '2026-03-01',
    priceHistory: [
      { date: '2026-01-01', costCents: 42000 },
      { date: '2026-03-01', costCents: 45000 },
    ],
  },
  {
    id: 'cc-012',
    name: 'Hardwood Flooring (Oak)',
    description: '3/4" solid red oak hardwood flooring, unfinished',
    category: 'Finishes',
    subcategory: 'Flooring',
    sku: 'FIN-HWD-OAK',
    unit: 'sqft',
    unitCostCents: 650,
    markupPercent: 20,
    preferredVendor: 'Flooring Distributors',
    tags: ['flooring', 'hardwood', 'oak'],
    cascadeUpdates: true,
    isActive: true,
    lastPriceUpdate: '2026-03-18',
    priceHistory: [
      { date: '2026-01-01', costCents: 600 },
      { date: '2026-02-01', costCents: 625 },
      { date: '2026-03-18', costCents: 650 },
    ],
  },
];

const CATEGORIES = [...new Set(MOCK_CATALOG.map((i) => i.category))].sort();
const SUBCATEGORIES = [...new Set(MOCK_CATALOG.map((i) => i.subcategory))].sort();

const UNIT_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'each', label: 'Each' },
  { value: 'sqft', label: 'Sq Ft' },
  { value: 'lnft', label: 'Ln Ft' },
  { value: 'cuyd', label: 'Cu Yd' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'lump_sum', label: 'Lump Sum' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'board_ft', label: 'Board Ft' },
];

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  const num = parseFloat(dollars);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

// ============================================================================
// Price History Mini Chart (placeholder)
// ============================================================================

function PriceHistoryChart({ history }: { history: { date: string; costCents: number }[] }) {
  if (!history.length) return null;
  const maxCost = Math.max(...history.map((h) => h.costCents));
  const minCost = Math.min(...history.map((h) => h.costCents));
  const range = maxCost - minCost || 1;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Price History
      </h4>
      <div className="flex items-end gap-1 h-16">
        {history.map((point, i) => {
          const height = ((point.costCents - minCost) / range) * 100;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-t bg-[#1e3a5f]/70 min-h-[4px] transition-all"
                style={{ height: `${Math.max(height, 8)}%` }}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                ${centsToDollars(point.costCents)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {point.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Add Item Dialog Form
// ============================================================================

function AddItemForm({ onAdd }: { onAdd: (item: CatalogItem) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('each');
  const [unitCost, setUnitCost] = useState('');
  const [markup, setMarkup] = useState('20');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState('');
  const [cascade, setCascade] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      id: `cc-${Date.now()}`,
      name,
      description,
      category: category || 'General',
      subcategory: subcategory || 'Uncategorized',
      sku,
      unit,
      unitCostCents: dollarsToCents(unitCost),
      markupPercent: parseFloat(markup) || 0,
      preferredVendor: vendor,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      cascadeUpdates: cascade,
      isActive: true,
      lastPriceUpdate: new Date().toISOString().slice(0, 10),
      priceHistory: [
        { date: new Date().toISOString().slice(0, 10), costCents: dollarsToCents(unitCost) },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Electrical" />
        </div>
        <div>
          <Label>Subcategory</Label>
          <Input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g., Wire & Cable" />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>
        <div>
          <Label>Unit</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as UnitOfMeasure)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((u) => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Unit Cost ($)</Label>
          <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        </div>
        <div>
          <Label>Markup (%)</Label>
          <Input type="number" step="0.1" value={markup} onChange={(e) => setMarkup(e.target.value)} />
        </div>
        <div>
          <Label>Preferred Vendor</Label>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>
        <div>
          <Label>Tags (comma-separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., kitchen, cabinet" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Switch checked={cascade} onCheckedChange={setCascade} id="cascade" />
          <Label htmlFor="cascade">Cascade price updates to existing estimates</Label>
        </div>
      </div>
      <DialogFooter>
        <DialogClose
          render={<Button variant="outline">Cancel</Button>}
        />
        <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
          Add Item
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CostCatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>(MOCK_CATALOG);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    let result = items.filter((i) => i.isActive);

    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (subcategoryFilter !== 'all') {
      result = result.filter((i) => i.subcategory === subcategoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.preferredVendor.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, search, categoryFilter, subcategoryFilter]);

  const updateItem = (id: string, updates: Partial<CatalogItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addItem = (newItem: CatalogItem) => {
    setItems((prev) => [...prev, newItem]);
    setAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SearchFilter
        searchPlaceholder="Search catalog by name, SKU, vendor, or tag..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: CATEGORIES.map((c) => ({ label: c, value: c })),
          },
          {
            label: 'Subcategory',
            value: subcategoryFilter,
            onChange: setSubcategoryFilter,
            options: SUBCATEGORIES.map((s) => ({ label: s, value: s })),
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setCategoryFilter('all');
          setSubcategoryFilter('all');
        }}
      />

      {/* Category sidebar as badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          className={`cursor-pointer ${categoryFilter === 'all' ? 'bg-[#1e3a5f]' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All ({items.filter((i) => i.isActive).length})
        </Badge>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.isActive && i.category === cat).length;
          return (
            <Badge
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              className={`cursor-pointer ${categoryFilter === cat ? 'bg-[#1e3a5f]' : ''}`}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
            >
              {cat} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white light-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" />
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Markup %</TableHead>
              <TableHead>Preferred Vendor</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() =>
                    setExpandedRow(expandedRow === item.id ? null : item.id)
                  }
                >
                  <TableCell>
                    {expandedRow === item.id ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.cascadeUpdates && (
                        <span title="Cascade updates enabled"><RefreshCw className="size-3 text-[#e8913a]" /></span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.subcategory}</TableCell>
                  <TableCell>
                    {UNIT_OPTIONS.find((u) => u.value === item.unit)?.label ?? item.unit}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={centsToDollars(item.unitCostCents)}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, {
                          unitCostCents: dollarsToCents(e.target.value),
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-24 border-transparent bg-transparent text-right hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={String(item.markupPercent)}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, {
                          markupPercent: parseFloat(e.target.value) || 0,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-16 border-transparent bg-transparent text-right hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.preferredVendor || '--'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded row with price history */}
                {expandedRow === item.id && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={9}>
                      <div className="grid grid-cols-3 gap-6 p-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            SKU: {item.sku}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {item.lastPriceUpdate}
                          </p>
                        </div>
                        <div>
                          <PriceHistoryChart history={item.priceHistory} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw className={`size-4 ${item.cascadeUpdates ? 'text-[#e8913a]' : 'text-muted-foreground'}`} />
                            <span className="text-sm">
                              Cascade: {item.cascadeUpdates ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No catalog items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredItems.length} of {items.filter((i) => i.isActive).length} items
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            <span>Avg. markup: {(filteredItems.reduce((s, i) => s + i.markupPercent, 0) / (filteredItems.length || 1)).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="size-3.5" />
            <span>{new Set(filteredItems.flatMap((i) => i.tags)).size} unique tags</span>
          </div>
        </div>
      </div>

      {/* Add Item Dialog (exposed for parent to trigger) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger
          render={
            <Button className="hidden" id="add-catalog-item-trigger">
              Add
            </Button>
          }
        />
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Catalog Item</DialogTitle>
          </DialogHeader>
          <AddItemForm onAdd={addItem} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
