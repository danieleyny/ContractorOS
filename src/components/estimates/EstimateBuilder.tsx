'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  FileText,
  Eye,
  EyeOff,
  GripVertical,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type {
  EstimateStatus,
  ContractType,
  UnitOfMeasure,
} from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  quantityFormula: string;
  unit: UnitOfMeasure;
  unitCostCents: number;
  markupPercent: number;
  notes: string;
  isVisibleToClient: boolean;
}

interface Section {
  id: string;
  name: string;
  description: string;
  isOptional: boolean;
  isCollapsed: boolean;
  lineItems: LineItem[];
}

interface EstimateBuilderProps {
  estimateId?: string;
  initialData?: {
    name: string;
    status: EstimateStatus;
    contractType: ContractType;
    clientName: string;
    contactId: string;
    sections: Section[];
    notes: string;
    taxRate: number;
  };
}

// ============================================================================
// Helpers
// ============================================================================

function evaluateFormula(formula: string): number {
  const cleaned = formula.replace(/[^0-9+\-*/.() ]/g, '');
  if (!cleaned.trim()) return 0;
  try {
    const result = new Function(`return (${cleaned})`)();
    const num = Number(result);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  const num = parseFloat(dollars);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'cost_plus', label: 'Cost Plus' },
  { value: 'time_and_material', label: 'Time & Material' },
  { value: 'unit_price', label: 'Unit Price' },
];

const MOCK_CLIENTS = [
  { id: 'contact-001', name: 'Robert Johnson' },
  { id: 'contact-002', name: 'Maria Martinez' },
  { id: 'contact-003', name: 'James Thompson' },
  { id: 'contact-004', name: 'David Williams' },
  { id: 'contact-005', name: 'Linda Chen' },
  { id: 'contact-006', name: 'Ravi Patel' },
];

// Mock cost catalog for quick-add
const MOCK_CATALOG_ITEMS = [
  { id: 'cc-001', name: 'Shaker Base Cabinet', unit: 'lnft' as UnitOfMeasure, unitCostCents: 85000, markupPercent: 20, category: 'Cabinetry' },
  { id: 'cc-002', name: '2x4 Stud Framing', unit: 'lnft' as UnitOfMeasure, unitCostCents: 450, markupPercent: 20, category: 'Framing' },
  { id: 'cc-003', name: 'Romex 12/2 Wire', unit: 'lnft' as UnitOfMeasure, unitCostCents: 85, markupPercent: 25, category: 'Electrical' },
  { id: 'cc-004', name: 'PEX Tubing 1/2"', unit: 'lnft' as UnitOfMeasure, unitCostCents: 120, markupPercent: 20, category: 'Plumbing' },
  { id: 'cc-005', name: 'Quartz Countertop', unit: 'sqft' as UnitOfMeasure, unitCostCents: 7500, markupPercent: 25, category: 'Finishes' },
  { id: 'cc-006', name: 'Drywall 4x8 Sheet', unit: 'each' as UnitOfMeasure, unitCostCents: 1400, markupPercent: 20, category: 'Finishes' },
  { id: 'cc-007', name: 'Skilled Labor', unit: 'hour' as UnitOfMeasure, unitCostCents: 6500, markupPercent: 30, category: 'General' },
  { id: 'cc-008', name: 'General Labor', unit: 'hour' as UnitOfMeasure, unitCostCents: 3500, markupPercent: 30, category: 'General' },
];

// ============================================================================
// Default mock data for a new builder
// ============================================================================

function getDefaultSections(): Section[] {
  return [
    {
      id: generateId(),
      name: 'Demolition',
      description: 'Tear-out and site preparation',
      isOptional: false,
      isCollapsed: false,
      lineItems: [
        {
          id: generateId(),
          description: 'Cabinet removal and disposal',
          quantity: 1,
          quantityFormula: '1',
          unit: 'lump_sum',
          unitCostCents: 250000,
          markupPercent: 20,
          notes: '',
          isVisibleToClient: true,
        },
        {
          id: generateId(),
          description: 'Flooring removal',
          quantity: 200,
          quantityFormula: '200',
          unit: 'sqft',
          unitCostCents: 75,
          markupPercent: 20,
          notes: '',
          isVisibleToClient: true,
        },
      ],
    },
    {
      id: generateId(),
      name: 'Framing & Structural',
      description: 'Wall framing and structural modifications',
      isOptional: false,
      isCollapsed: false,
      lineItems: [
        {
          id: generateId(),
          description: '2x4 wall framing',
          quantity: 96,
          quantityFormula: '12 * 8',
          unit: 'lnft',
          unitCostCents: 450,
          markupPercent: 20,
          notes: '',
          isVisibleToClient: true,
        },
        {
          id: generateId(),
          description: 'Header beam installation',
          quantity: 1,
          quantityFormula: '1',
          unit: 'each',
          unitCostCents: 85000,
          markupPercent: 20,
          notes: 'LVL beam for load-bearing wall removal',
          isVisibleToClient: true,
        },
      ],
    },
    {
      id: generateId(),
      name: 'Electrical',
      description: 'Electrical rough-in and finish',
      isOptional: false,
      isCollapsed: true,
      lineItems: [
        {
          id: generateId(),
          description: 'New 20A circuit run',
          quantity: 4,
          quantityFormula: '4',
          unit: 'each',
          unitCostCents: 35000,
          markupPercent: 25,
          notes: 'Dedicated circuits for appliances',
          isVisibleToClient: true,
        },
        {
          id: generateId(),
          description: 'Recessed lighting installation',
          quantity: 8,
          quantityFormula: '8',
          unit: 'each',
          unitCostCents: 12500,
          markupPercent: 25,
          notes: '',
          isVisibleToClient: true,
        },
      ],
    },
    {
      id: generateId(),
      name: 'Appliance Allowance',
      description: 'Client-selected appliance package',
      isOptional: true,
      isCollapsed: true,
      lineItems: [
        {
          id: generateId(),
          description: 'Appliance package allowance',
          quantity: 1,
          quantityFormula: '1',
          unit: 'lump_sum',
          unitCostCents: 500000,
          markupPercent: 10,
          notes: 'Range, dishwasher, microwave, refrigerator',
          isVisibleToClient: true,
        },
      ],
    },
  ];
}

// ============================================================================
// Sub-Components
// ============================================================================

function InlineEdit({
  value,
  onChange,
  className = '',
  type = 'text',
  placeholder = '',
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-8 border-transparent bg-transparent px-1.5 hover:border-input focus:border-input ${className}`}
    />
  );
}

function CostCatalogSearch({
  onSelect,
}: {
  onSelect: (item: (typeof MOCK_CATALOG_ITEMS)[0]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = MOCK_CATALOG_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cost catalog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              ${centsToDollars(item.unitCostCents)}/{item.unit}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="p-3 text-center text-sm text-muted-foreground">
            No catalog items found.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EstimateBuilder({ initialData }: EstimateBuilderProps) {
  const [estimateName, setEstimateName] = useState(
    initialData?.name ?? 'Johnson Kitchen Remodel'
  );
  const [status] = useState<EstimateStatus>(
    initialData?.status ?? 'draft'
  );
  const [contractType, setContractType] = useState<ContractType>(
    initialData?.contractType ?? 'fixed_price'
  );
  const [selectedClient, setSelectedClient] = useState(
    initialData?.contactId ?? 'contact-001'
  );
  const [sections, setSections] = useState<Section[]>(
    initialData?.sections ?? getDefaultSections()
  );
  const [internalNotes, setInternalNotes] = useState(
    initialData?.notes ?? 'Client prefers quartz countertops. Budget is flexible for appliances.'
  );
  const [taxRate, setTaxRate] = useState(initialData?.taxRate ?? 8);
  const [isClientView, setIsClientView] = useState(false);
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [catalogTargetSection, setCatalogTargetSection] = useState<string | null>(null);

  // -- Section handlers -------------------------------------------------------

  const toggleSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
      )
    );
  }, []);

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<Section>) => {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const addSection = useCallback(() => {
    setSections((prev) => [
      ...prev,
      {
        id: generateId(),
        name: 'New Section',
        description: '',
        isOptional: false,
        isCollapsed: false,
        lineItems: [],
      },
    ]);
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }, []);

  // -- Line item handlers -----------------------------------------------------

  const updateLineItem = useCallback(
    (sectionId: string, itemId: string, updates: Partial<LineItem>) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            lineItems: s.lineItems.map((li) => {
              if (li.id !== itemId) return li;
              const updated = { ...li, ...updates };
              // Re-evaluate formula if quantityFormula changed
              if (updates.quantityFormula !== undefined) {
                updated.quantity = evaluateFormula(updates.quantityFormula);
              }
              return updated;
            }),
          };
        })
      );
    },
    []
  );

  const addLineItem = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lineItems: [
            ...s.lineItems,
            {
              id: generateId(),
              description: '',
              quantity: 1,
              quantityFormula: '1',
              unit: 'each' as UnitOfMeasure,
              unitCostCents: 0,
              markupPercent: 20,
              notes: '',
              isVisibleToClient: true,
            },
          ],
        };
      })
    );
  }, []);

  const addFromCatalog = useCallback(
    (sectionId: string, catalogItem: (typeof MOCK_CATALOG_ITEMS)[0]) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            lineItems: [
              ...s.lineItems,
              {
                id: generateId(),
                description: catalogItem.name,
                quantity: 1,
                quantityFormula: '1',
                unit: catalogItem.unit,
                unitCostCents: catalogItem.unitCostCents,
                markupPercent: catalogItem.markupPercent,
                notes: '',
                isVisibleToClient: true,
              },
            ],
          };
        })
      );
      setCatalogDialogOpen(false);
    },
    []
  );

  const removeLineItem = useCallback(
    (sectionId: string, itemId: string) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            lineItems: s.lineItems.filter((li) => li.id !== itemId),
          };
        })
      );
    },
    []
  );

  // -- Calculations -----------------------------------------------------------

  const totals = useMemo(() => {
    let subtotalCents = 0;
    let markupCents = 0;

    for (const section of sections) {
      for (const item of section.lineItems) {
        const baseCost = item.quantity * item.unitCostCents;
        const itemMarkup = Math.round(baseCost * (item.markupPercent / 100));
        subtotalCents += baseCost;
        markupCents += itemMarkup;
      }
    }

    const taxCents = Math.round((subtotalCents + markupCents) * (taxRate / 100));
    const totalCents = subtotalCents + markupCents + taxCents;

    return { subtotalCents, markupCents, taxCents, totalCents };
  }, [sections, taxRate]);

  const lineItemTotal = (item: LineItem): number => {
    const base = item.quantity * item.unitCostCents;
    return base + Math.round(base * (item.markupPercent / 100));
  };

  const sectionSubtotal = (section: Section): number => {
    return section.lineItems.reduce((sum, li) => sum + lineItemTotal(li), 0);
  };

  // -- Render -----------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            value={estimateName}
            onChange={(e) => setEstimateName(e.target.value)}
            className="h-9 max-w-xs border-transparent bg-transparent text-lg font-bold hover:border-input focus:border-input"
          />
          <StatusBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedClient} onValueChange={(v) => v && setSelectedClient(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CLIENTS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contractType} onValueChange={(v) => v && setContractType(v as ContractType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Save className="mr-1.5 size-4" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
          >
            <Send className="mr-1.5 size-4" />
            Send to Client
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 size-4" />
            Preview PDF
          </Button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 ring-foreground/10">
          {isClientView ? (
            <Eye className="size-4 text-[#e8913a]" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
          <Label htmlFor="client-view" className="cursor-pointer text-sm">
            Client View
          </Label>
          <Switch
            id="client-view"
            checked={isClientView}
            onCheckedChange={setIsClientView}
          />
        </div>
        {isClientView && (
          <p className="text-xs text-muted-foreground">
            Markup details and internal notes are hidden in client view.
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl bg-white shadow-sm ring-1 ring-foreground/10"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <button
                onClick={() => toggleSection(section.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {section.isCollapsed ? (
                  <ChevronRight className="size-5" />
                ) : (
                  <ChevronDown className="size-5" />
                )}
              </button>
              <GripVertical className="size-4 text-muted-foreground/50" />
              <InlineEdit
                value={section.name}
                onChange={(val) => updateSection(section.id, { name: val })}
                className="max-w-xs font-semibold"
                placeholder="Section name"
              />
              <InlineEdit
                value={section.description}
                onChange={(val) =>
                  updateSection(section.id, { description: val })
                }
                className="max-w-sm text-sm text-muted-foreground"
                placeholder="Description"
              />
              <div className="flex items-center gap-2 ml-auto">
                {section.isOptional && (
                  <Badge variant="outline" className="text-[#e8913a] border-[#e8913a]/30">
                    Optional
                  </Badge>
                )}
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor={`opt-${section.id}`}
                    className="text-xs text-muted-foreground"
                  >
                    Optional
                  </Label>
                  <Switch
                    id={`opt-${section.id}`}
                    checked={section.isOptional}
                    onCheckedChange={(checked) =>
                      updateSection(section.id, { isOptional: checked })
                    }
                  />
                </div>
                <span className="ml-2 text-sm font-semibold text-[#1e3a5f]">
                  ${centsToDollars(sectionSubtotal(section))}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-red-500"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Line items table */}
            {!section.isCollapsed && (
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[280px]">Description</TableHead>
                      <TableHead className="w-[120px]">Quantity</TableHead>
                      <TableHead className="w-[100px]">Unit</TableHead>
                      <TableHead className="w-[120px]">Unit Cost ($)</TableHead>
                      {!isClientView && (
                        <TableHead className="w-[100px]">Markup (%)</TableHead>
                      )}
                      <TableHead className="w-[120px] text-right">
                        Total ($)
                      </TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.lineItems.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell>
                          <InlineEdit
                            value={item.description}
                            onChange={(val) =>
                              updateLineItem(section.id, item.id, {
                                description: val,
                              })
                            }
                            placeholder="Line item description"
                          />
                          {item.notes && !isClientView && (
                            <p className="mt-0.5 px-1.5 text-xs text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <InlineEdit
                            value={item.quantityFormula}
                            onChange={(val) =>
                              updateLineItem(section.id, item.id, {
                                quantityFormula: val,
                              })
                            }
                            placeholder="Qty"
                          />
                          {item.quantityFormula !== String(item.quantity) && (
                            <p className="px-1.5 text-xs text-muted-foreground">
                              = {item.quantity}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.unit}
                            onValueChange={(v) =>
                              updateLineItem(section.id, item.id, {
                                unit: v as UnitOfMeasure,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 border-transparent bg-transparent hover:border-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OPTIONS.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <InlineEdit
                            value={centsToDollars(item.unitCostCents)}
                            onChange={(val) =>
                              updateLineItem(section.id, item.id, {
                                unitCostCents: dollarsToCents(val),
                              })
                            }
                            type="text"
                          />
                        </TableCell>
                        {!isClientView && (
                          <TableCell>
                            <InlineEdit
                              value={String(item.markupPercent)}
                              onChange={(val) =>
                                updateLineItem(section.id, item.id, {
                                  markupPercent: parseFloat(val) || 0,
                                })
                              }
                              type="text"
                            />
                          </TableCell>
                        )}
                        <TableCell className="text-right font-medium">
                          ${centsToDollars(lineItemTotal(item))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500"
                            onClick={() =>
                              removeLineItem(section.id, item.id)
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#1e3a5f]"
                    onClick={() => addLineItem(section.id)}
                  >
                    <Plus className="mr-1 size-3.5" />
                    Add Line Item
                  </Button>
                  <Dialog
                    open={catalogDialogOpen && catalogTargetSection === section.id}
                    onOpenChange={(open) => {
                      setCatalogDialogOpen(open);
                      if (open) setCatalogTargetSection(section.id);
                    }}
                  >
                    <DialogTrigger
                      render={
                        <Button variant="ghost" size="sm" className="text-[#e8913a]">
                          <Search className="mr-1 size-3.5" />
                          From Catalog
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add from Cost Catalog</DialogTitle>
                      </DialogHeader>
                      <CostCatalogSearch
                        onSelect={(item) => addFromCatalog(section.id, item)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section button */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addSection}
      >
        <Plus className="mr-1.5 size-4" />
        Add Section
      </Button>

      {/* Internal notes (hidden in client view) */}
      {!isClientView && (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
          <h3 className="mb-2 text-sm font-semibold">Internal Notes</h3>
          <Textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Notes visible only to your team..."
            rows={3}
          />
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-foreground/10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Estimate Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${centsToDollars(totals.subtotalCents)}</span>
          </div>
          {!isClientView && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Markup</span>
              <span className="text-[#e8913a]">
                +${centsToDollars(totals.markupCents)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tax</span>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="h-7 w-16 text-center text-xs"
                step="0.1"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <span>${centsToDollars(totals.taxCents)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-[#1e3a5f]">
                ${centsToDollars(totals.totalCents)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
