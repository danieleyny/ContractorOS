'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  FolderKanban,
  Users,
  Receipt,
  Plus,
  Calculator,
  FileText,
  TrendingUp,
} from 'lucide-react'

const stats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2 this month',
    icon: FolderKanban,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Open Leads',
    value: '34',
    change: '+8 this week',
    icon: Users,
    color: 'text-[#e8913a]',
    bg: 'bg-[#e8913a]/10',
  },
  {
    title: 'Pending Invoices',
    value: '$48,250',
    change: '6 invoices',
    icon: Receipt,
    color: 'text-[#ef4444]',
    bg: 'bg-[#ef4444]/10',
  },
  {
    title: 'Revenue (MTD)',
    value: '$127,400',
    change: '+12% vs last month',
    icon: DollarSign,
    color: 'text-[#22c55e]',
    bg: 'bg-[#22c55e]/10',
  },
]

const quickActions = [
  { label: 'New Lead', icon: Users, variant: 'outline' as const, href: '/leads?new=1' },
  { label: 'New Estimate', icon: Calculator, variant: 'outline' as const, href: '/estimates/new' },
  { label: 'New Project', icon: FolderKanban, variant: 'outline' as const, href: '/projects?new=1' },
  { label: 'New Invoice', icon: Receipt, variant: 'outline' as const, href: '/invoices/new' },
]

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">
          Welcome to ContractorOS
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening across your business today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight font-heading">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-2 flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-[#22c55e]" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="gap-2"
                onClick={() => router.push(action.href)}
              >
                <Plus className="h-4 w-4" />
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Placeholder widget grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
              <p className="text-sm text-muted-foreground">
                Revenue chart will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
