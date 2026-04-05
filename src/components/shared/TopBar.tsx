'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Plus,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Users,
  Calculator,
  FolderKanban,
  Receipt,
} from 'lucide-react'

export function TopBar() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen)

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
        sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-64',
        'left-0'
      )}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setSidebarMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Breadcrumb area */}
      <div className="hidden lg:block text-sm text-muted-foreground">
        {/* Breadcrumbs will be populated by individual pages */}
      </div>

      {/* Global search */}
      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects, leads, invoices..."
            className="w-full pl-9 pr-20 h-9 bg-muted/50 border-muted"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Quick add */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="inline-flex shrink-0 items-center justify-center rounded-lg size-7 bg-[#e8913a] hover:bg-[#d07e2f] text-white transition-colors cursor-pointer">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Quick add</span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              New Lead
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calculator className="mr-2 h-4 w-4" />
              New Estimate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderKanban className="mr-2 h-4 w-4" />
              New Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Receipt className="mr-2 h-4 w-4" />
              New Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white border-0">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="inline-flex items-center justify-center rounded-full size-8 cursor-pointer hover:ring-2 hover:ring-ring/20 transition-shadow">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-[#1e3a5f] text-white text-xs font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
