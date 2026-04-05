'use client'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/stores/ui-store'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <main
      className={cn(
        'min-h-screen pt-16 transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
      )}
    >
      <div className="p-4 md:p-6 lg:p-8">{children}</div>
    </main>
  )
}
