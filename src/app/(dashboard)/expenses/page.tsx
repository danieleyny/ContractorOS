'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Receipt,
  Clock,
  Plus,
  Upload,
  CalendarDays,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';

// -------------------------------------------------------------------
// Types & Schema
// -------------------------------------------------------------------

type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';

interface MockExpense {
  [key: string]: unknown;
  id: string;
  date: string;
  description: string;
  category: string;
  project_name: string;
  amount: number;
  has_receipt: boolean;
  status: ExpenseStatus;
  submitted_by: string;
}

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be > 0'),
  category: z.string().min(1, 'Category is required'),
  project: z.string().min(1, 'Project is required'),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const CATEGORIES = [
  'Materials',
  'Equipment Rental',
  'Fuel',
  'Tools',
  'Permits & Fees',
  'Meals',
  'Travel',
  'Office Supplies',
  'Insurance',
  'Miscellaneous',
];

const PROJECTS = [
  { value: 'p1', label: 'Kitchen Remodel - Anderson' },
  { value: 'p2', label: 'Office Build-Out Phase 2' },
  { value: 'p3', label: 'Greenfield Townhomes' },
  { value: 'p4', label: 'Summit Retail Renovation' },
  { value: 'p5', label: 'Overhead / General' },
];

const MOCK_EXPENSES: MockExpense[] = [
  {
    id: 'e1',
    date: '2026-04-03',
    description: 'Concrete mix - 40 bags',
    category: 'Materials',
    project_name: 'Greenfield Townhomes',
    amount: 320,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'John Mitchell',
  },
  {
    id: 'e2',
    date: '2026-04-02',
    description: 'Bobcat rental - 1 day',
    category: 'Equipment Rental',
    project_name: 'Office Build-Out Phase 2',
    amount: 450,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'Mike Torres',
  },
  {
    id: 'e3',
    date: '2026-04-02',
    description: 'Diesel fuel - job site generator',
    category: 'Fuel',
    project_name: 'Greenfield Townhomes',
    amount: 185.5,
    has_receipt: true,
    status: 'pending',
    submitted_by: 'John Mitchell',
  },
  {
    id: 'e4',
    date: '2026-04-01',
    description: 'Replacement drill bits set',
    category: 'Tools',
    project_name: 'Kitchen Remodel - Anderson',
    amount: 89.99,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'Sarah Kim',
  },
  {
    id: 'e5',
    date: '2026-04-01',
    description: 'Building permit filing fee',
    category: 'Permits & Fees',
    project_name: 'Summit Retail Renovation',
    amount: 750,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'Admin',
  },
  {
    id: 'e6',
    date: '2026-03-31',
    description: 'Team lunch - project kickoff',
    category: 'Meals',
    project_name: 'Summit Retail Renovation',
    amount: 142.3,
    has_receipt: false,
    status: 'pending',
    submitted_by: 'Mike Torres',
  },
  {
    id: 'e7',
    date: '2026-03-30',
    description: 'Mileage reimbursement - site visits',
    category: 'Travel',
    project_name: 'Overhead / General',
    amount: 67.5,
    has_receipt: false,
    status: 'reimbursed',
    submitted_by: 'Sarah Kim',
  },
  {
    id: 'e8',
    date: '2026-03-29',
    description: 'Printer ink and paper',
    category: 'Office Supplies',
    project_name: 'Overhead / General',
    amount: 54.99,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'Admin',
  },
  {
    id: 'e9',
    date: '2026-03-28',
    description: 'Scaffolding rental - 2 weeks',
    category: 'Equipment Rental',
    project_name: 'Kitchen Remodel - Anderson',
    amount: 1200,
    has_receipt: true,
    status: 'rejected',
    submitted_by: 'John Mitchell',
  },
  {
    id: 'e10',
    date: '2026-03-27',
    description: 'Safety helmets (10 units)',
    category: 'Tools',
    project_name: 'Overhead / General',
    amount: 299.9,
    has_receipt: true,
    status: 'approved',
    submitted_by: 'Admin',
  },
];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ExpenseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: '',
      project: '',
      notes: '',
    },
  });

  const filteredExpenses = MOCK_EXPENSES.filter((exp) => {
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && exp.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        exp.description.toLowerCase().includes(q) ||
        exp.project_name.toLowerCase().includes(q) ||
        exp.submitted_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalMTD = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const reimbursable = MOCK_EXPENSES.filter(
    (e) => e.status === 'approved'
  ).reduce((s, e) => s + e.amount, 0);
  const pendingApproval = MOCK_EXPENSES.filter(
    (e) => e.status === 'pending'
  ).length;

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddExpense = form.handleSubmit((data) => {
    console.log('Add expense:', data);
    setDialogOpen(false);
    form.reset();
  });

  const columns: ColumnDef<MockExpense>[] = [
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      cell: (row) => formatDate(row.date),
    },
    {
      header: 'Description',
      accessor: 'description',
      sortable: true,
      cell: (row) => (
        <span className="font-medium">{row.description}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
    },
    {
      header: 'Project',
      accessor: 'project_name',
      sortable: true,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      className: 'text-right',
      cell: (row) => (
        <span className="font-medium tabular-nums">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Receipt',
      accessor: 'has_receipt',
      cell: (row) =>
        row.has_receipt ? (
          <span className="inline-flex items-center gap-1 text-xs text-[#22c55e]">
            <Receipt className="size-3" /> Yes
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track job expenses, receipts, and reimbursements"
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
          >
            <Plus className="mr-2 size-4" />
            Add Expense
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Expenses MTD"
          value={formatCurrency(totalMTD)}
          icon={DollarSign}
          change="+6%"
          changeType="neutral"
          description="vs last month"
        />
        <StatCard
          title="Reimbursable"
          value={formatCurrency(reimbursable)}
          icon={Receipt}
          changeType="positive"
        />
        <StatCard
          title="Pending Approval"
          value={String(pendingApproval)}
          icon={Clock}
          change="2 items"
          changeType="negative"
          description="need review"
        />
      </div>

      <SearchFilter
        searchPlaceholder="Search expenses..."
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
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Reimbursed', value: 'reimbursed' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('');
          setCategoryFilter('all');
          setStatusFilter('all');
        }}
      />

      <DataTable
        columns={columns}
        data={filteredExpenses}
        emptyMessage="No expenses found."
      />

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <div className="relative mt-1">
                  <CalendarDays className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...form.register('date')} type="date" className="pl-9" />
                </div>
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  {...form.register('amount')}
                  type="number"
                  step="0.01"
                  className="mt-1"
                  placeholder="0.00"
                />
                {form.formState.errors.amount && (
                  <p className="mt-1 text-xs text-[#ef4444]">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                {...form.register('description')}
                className="mt-1"
                placeholder="What was purchased?"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-xs text-[#ef4444]">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(v) => form.setValue('category', v ?? '')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project</Label>
                <Select
                  value={form.watch('project')}
                  onValueChange={(v) => form.setValue('project', v ?? '')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Receipt</Label>
              <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-[#1e3a5f]/30">
                <div className="text-center">
                  <Upload className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                {...form.register('notes')}
                className="mt-1"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
