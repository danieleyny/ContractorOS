'use client'

import { Hammer } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f1f33] flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8913a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#e8913a]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e8913a] rounded-lg flex items-center justify-center">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ContractorOS</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            The all-in-one platform
            <br />
            for modern contractors
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Manage projects, track expenses, handle invoicing, and grow your
            contracting business — all from one powerful dashboard.
          </p>
          <div className="flex flex-col gap-3 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e8913a]" />
              <span>Project & task management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e8913a]" />
              <span>Invoicing & expense tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e8913a]" />
              <span>Client portal & communication</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-white/40">
          &copy; {new Date().getFullYear()} ContractorOS. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-white light-card">
        {/* Mobile Logo (shown only on mobile) */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#e8913a] rounded-lg flex items-center justify-center">
            <Hammer className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1e3a5f] tracking-tight">ContractorOS</span>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
