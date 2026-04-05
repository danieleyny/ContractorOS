'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Save,
  Download,
  Plus,
  Trash2,
  BarChart3,
  LineChartIcon,
  PieChartIcon,
  Table2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PageHeader } from '@/components/shared/PageHeader';

// -------------------------------------------------------------------
// Data source config
// -------------------------------------------------------------------

type DataSourceKey = 'leads' | 'projects' | 'invoices' | 'time_entries' | 'expenses';

interface FieldConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
}

const DATA_SOURCES: Record<DataSourceKey, { label: string; fields: FieldConfig[] }> = {
  leads: {
    label: 'Leads',
    fields: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'source', label: 'Source', type: 'string' },
      { key: 'temperature', label: 'Temperature', type: 'string' },
      { key: 'score', label: 'Lead Score', type: 'number' },
      { key: 'created_at', label: 'Created Date', type: 'date' },
      { key: 'value', label: 'Estimated Value', type: 'number' },
    ],
  },
  projects: {
    label: 'Projects',
    fields: [
      { key: 'name', label: 'Project Name', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'contract_amount', label: 'Contract Amount', type: 'number' },
      { key: 'budget_spent', label: 'Budget Spent', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'profit_pct', label: 'Profit %', type: 'number' },
    ],
  },
  invoices: {
    label: 'Invoices',
    fields: [
      { key: 'number', label: 'Invoice #', type: 'string' },
      { key: 'client', label: 'Client', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'paid', label: 'Amount Paid', type: 'number' },
    ],
  },
  time_entries: {
    label: 'Time Entries',
    fields: [
      { key: 'employee', label: 'Employee', type: 'string' },
      { key: 'project', label: 'Project', type: 'string' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'hours', label: 'Hours', type: 'number' },
      { key: 'cost', label: 'Cost', type: 'number' },
      { key: 'is_overtime', label: 'Overtime', type: 'string' },
    ],
  },
  expenses: {
    label: 'Expenses',
    fields: [
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'category', label: 'Category', type: 'string' },
      { key: 'project', label: 'Project', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'string' },
    ],
  },
};

// -------------------------------------------------------------------
// Mock preview data
// -------------------------------------------------------------------

const MOCK_PREVIEW: Record<DataSourceKey, Record<string, unknown>[]> = {
  leads: [
    { name: 'Tom Baker', source: 'Referral', temperature: 'Hot', score: 85, value: 45000 },
    { name: 'Sarah Chen', source: 'Website', temperature: 'Warm', score: 62, value: 28000 },
    { name: 'Mike Rodriguez', source: 'Social Media', temperature: 'Cold', score: 35, value: 15000 },
    { name: 'Lisa Park', source: 'Referral', temperature: 'Hot', score: 92, value: 68000 },
    { name: 'James Wilson', source: 'Advertising', temperature: 'Warm', score: 55, value: 32000 },
  ],
  projects: [
    { name: 'Anderson Kitchen', status: 'In Progress', contract_amount: 95000, budget_spent: 72000, profit_pct: 18 },
    { name: 'Metro Office', status: 'In Progress', contract_amount: 250000, budget_spent: 185000, profit_pct: 22 },
    { name: 'Greenfield Townhomes', status: 'Pre-Construction', contract_amount: 180000, budget_spent: 12000, profit_pct: 0 },
    { name: 'Summit Retail', status: 'On Hold', contract_amount: 120000, budget_spent: 45000, profit_pct: 15 },
  ],
  invoices: [
    { number: 'INV-1001', client: 'Anderson', status: 'Paid', amount: 22500, paid: 22500 },
    { number: 'INV-1002', client: 'Metro', status: 'Sent', amount: 45000, paid: 0 },
    { number: 'INV-1003', client: 'Greenfield', status: 'Overdue', amount: 28750, paid: 0 },
    { number: 'INV-1004', client: 'Summit', status: 'Partial', amount: 18200, paid: 9100 },
  ],
  time_entries: [
    { employee: 'John M.', project: 'Anderson', hours: 8, cost: 480, is_overtime: 'No' },
    { employee: 'Mike T.', project: 'Metro', hours: 10, cost: 750, is_overtime: 'Yes' },
    { employee: 'Sarah K.', project: 'Anderson', hours: 6, cost: 360, is_overtime: 'No' },
    { employee: 'John M.', project: 'Greenfield', hours: 8, cost: 480, is_overtime: 'No' },
    { employee: 'Mike T.', project: 'Summit', hours: 8, cost: 600, is_overtime: 'No' },
  ],
  expenses: [
    { description: 'Concrete mix', category: 'Materials', project: 'Greenfield', amount: 320, status: 'Approved' },
    { description: 'Bobcat rental', category: 'Equipment', project: 'Metro', amount: 450, status: 'Approved' },
    { description: 'Diesel fuel', category: 'Fuel', project: 'Greenfield', amount: 185, status: 'Pending' },
    { description: 'Drill bits', category: 'Tools', project: 'Anderson', amount: 90, status: 'Approved' },
    { description: 'Permit fee', category: 'Permits', project: 'Summit', amount: 750, status: 'Approved' },
  ],
};

// -------------------------------------------------------------------
// Filter types
// -------------------------------------------------------------------

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'table';

const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'lt', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
];

const CHART_COLORS = ['#1e3a5f', '#e8913a', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ReportBuilderPage() {
  const [dataSource, setDataSource] = useState<DataSourceKey>('invoices');
  const [selectedFields, setSelectedFields] = useState<string[]>(['client', 'amount', 'status']);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [groupBy, setGroupBy] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const sourceConfig = DATA_SOURCES[dataSource];
  const previewData = MOCK_PREVIEW[dataSource];

  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        field: sourceConfig.fields[0].key,
        operator: 'eq',
        value: '',
      },
    ]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // Build chart data from preview data using groupBy
  const chartData = useMemo(() => {
    if (!groupBy) {
      // Use raw data with first numeric field as value
      const numericField = selectedFields.find(
        (f) => sourceConfig.fields.find((sf) => sf.key === f)?.type === 'number'
      );
      const labelField = selectedFields.find(
        (f) => sourceConfig.fields.find((sf) => sf.key === f)?.type === 'string'
      );
      if (!numericField || !labelField) return [];
      return previewData.map((row) => ({
        name: String(row[labelField] ?? ''),
        value: Number(row[numericField] ?? 0),
      }));
    }

    // Group by field
    const groups: Record<string, number> = {};
    const numericField = selectedFields.find(
      (f) => sourceConfig.fields.find((sf) => sf.key === f)?.type === 'number'
    );
    if (!numericField) return [];
    for (const row of previewData) {
      const key = String(row[groupBy] ?? 'Unknown');
      groups[key] = (groups[key] || 0) + Number(row[numericField] ?? 0);
    }
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [previewData, selectedFields, groupBy, sourceConfig]);

  const handleSourceChange = (source: DataSourceKey) => {
    setDataSource(source);
    const fields = DATA_SOURCES[source].fields;
    setSelectedFields(fields.slice(0, 3).map((f) => f.key));
    setFilters([]);
    setGroupBy('');
    setSortBy('');
  };

  const chartTypeButtons: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'bar', icon: <BarChart3 className="size-4" />, label: 'Bar' },
    { type: 'line', icon: <LineChartIcon className="size-4" />, label: 'Line' },
    { type: 'pie', icon: <PieChartIcon className="size-4" />, label: 'Pie' },
    { type: 'table', icon: <Table2 className="size-4" />, label: 'Table' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Builder"
        description="Create custom reports from your data"
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: 'Report Builder' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
              <Save className="mr-2 size-4" />
              Save Report
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Panel - Configuration */}
        <div className="space-y-4">
          {/* Data Source */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Data Source
            </Label>
            <Select
              value={dataSource}
              onValueChange={(v) => handleSourceChange(v as DataSourceKey)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATA_SOURCES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Picker */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fields
            </Label>
            <div className="mt-3 space-y-2">
              {sourceConfig.fields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <label
                    htmlFor={field.key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    {field.label}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {field.type}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Filters
              </Label>
              <Button variant="ghost" size="sm" onClick={addFilter}>
                <Plus className="mr-1 size-3" />
                Add
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {filters.length === 0 && (
                <p className="text-xs text-muted-foreground">No filters applied</p>
              )}
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-1.5">
                  <Select
                    value={filter.field}
                    onValueChange={(v) => updateFilter(filter.id, { field: v ?? '' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceConfig.fields.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filter.operator}
                    onValueChange={(v) => updateFilter(filter.id, { operator: v ?? '' })}
                  >
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                    className="h-8 text-xs"
                    placeholder="Value"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Group By & Sort By */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Group By
                </Label>
                <Select value={groupBy} onValueChange={(v) => setGroupBy(v ?? '')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sourceConfig.fields
                      .filter((f) => f.type === 'string')
                      .map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? '')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {sourceConfig.fields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chart Type */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Chart Type
            </Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {chartTypeButtons.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors ${
                    chartType === type
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Preview</h3>
            <span className="text-xs text-muted-foreground">
              {previewData.length} records &middot; {selectedFields.length} fields
            </span>
          </div>

          {chartType === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {selectedFields.map((fieldKey) => {
                      const field = sourceConfig.fields.find(
                        (f) => f.key === fieldKey
                      );
                      return (
                        <TableHead
                          key={fieldKey}
                          className={
                            field?.type === 'number' ? 'text-right' : ''
                          }
                        >
                          {field?.label ?? fieldKey}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {selectedFields.map((fieldKey) => {
                        const field = sourceConfig.fields.find(
                          (f) => f.key === fieldKey
                        );
                        const val = row[fieldKey];
                        return (
                          <TableCell
                            key={fieldKey}
                            className={
                              field?.type === 'number'
                                ? 'text-right tabular-nums'
                                : ''
                            }
                          >
                            {field?.type === 'number'
                              ? Number(val).toLocaleString()
                              : String(val ?? '')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : chartData.length > 0 ? (
            /* Chart Views */
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Value"
                      fill="#1e3a5f"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Value"
                      stroke="#1e3a5f"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#1e3a5f' }}
                    />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
              Select at least one string field and one numeric field to see the chart preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
