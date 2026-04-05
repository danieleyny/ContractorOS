// Currency formatting
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function centsToDollars(cents: number): number {
  return cents / 100
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

// Lead pipeline default stages
export const DEFAULT_PIPELINE_STAGES = [
  { name: 'New Lead', color: '#3b82f6', display_order: 0 },
  { name: 'Contacted', color: '#8b5cf6', display_order: 1 },
  { name: 'Site Visit Scheduled', color: '#f59e0b', display_order: 2 },
  { name: 'Estimate Sent', color: '#f97316', display_order: 3 },
  { name: 'Negotiating', color: '#ef4444', display_order: 4 },
  { name: 'Won', color: '#22c55e', display_order: 5, is_won_stage: true },
  { name: 'Lost', color: '#6b7280', display_order: 6, is_lost_stage: true },
]

// Project status colors
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  pre_construction: '#3b82f6',
  in_progress: '#22c55e',
  on_hold: '#f59e0b',
  punch_list: '#f97316',
  completed: '#6b7280',
  closed: '#374151',
  cancelled: '#ef4444',
}

// Project status labels
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  pre_construction: 'Pre-Construction',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  punch_list: 'Punch List',
  completed: 'Completed',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
}

// Lead temperature colors
export const LEAD_TEMP_COLORS: Record<string, string> = {
  hot: '#ef4444',
  warm: '#f59e0b',
  cold: '#3b82f6',
  dead: '#6b7280',
}

// Navigation items
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Leads & CRM', href: '/leads', icon: 'Users' },
  { label: 'Estimates', href: '/estimates', icon: 'Calculator' },
  { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
  { label: 'Invoices', href: '/invoices', icon: 'Receipt' },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: 'ShoppingCart' },
  { label: 'Expenses', href: '/expenses', icon: 'CreditCard' },
  { label: 'Crew', href: '/crew', icon: 'HardHat' },
  { label: 'Documents', href: '/documents', icon: 'FileText' },
  { label: 'Reports', href: '/reports', icon: 'BarChart3' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const

// Payment terms labels
export const PAYMENT_TERMS_LABELS: Record<string, string> = {
  due_on_receipt: 'Due on Receipt',
  net_15: 'Net 15',
  net_30: 'Net 30',
  net_45: 'Net 45',
  net_60: 'Net 60',
  custom: 'Custom',
}
