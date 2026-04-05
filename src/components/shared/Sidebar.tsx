'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/stores/ui-store'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  Calculator,
  FolderKanban,
  Receipt,
  ShoppingCart,
  CreditCard,
  HardHat,
  FileText,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Hammer,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Leads & CRM', href: '/leads', icon: Users },
  { label: 'Estimates', href: '/estimates', icon: Calculator },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Invoices', href: '/invoices', icon: Receipt },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { label: 'Expenses', href: '/expenses', icon: CreditCard },
  { label: 'Crew', href: '/crew', icon: HardHat },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

const bottomNavItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

function NavLink({
  item,
  collapsed,
}: {
  item: (typeof navItems)[number]
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href)

  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        'hover:bg-white/10',
        isActive
          ? 'bg-[#e8913a]/15 text-[#e8913a]'
          : 'text-slate-300 hover:text-white',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[#e8913a]')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-full flex-col bg-[#1e3a5f]">
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/10 px-4',
        collapsed && 'justify-center px-2'
      )}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8913a]">
            <Hammer className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8913a]">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-heading">
              ContractorOS
            </span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          style={collapsed ? { justifyContent: 'center', paddingLeft: '0.5rem', paddingRight: '0.5rem' } : {}}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen)
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64'
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setSidebarMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#1e3a5f] border-none" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  )
}
