'use client'
import { Bell, Search } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center gap-4 px-6 sticky top-0 z-30">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="search-input w-44"
        />
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Bell */}
      <button className="relative p-2 hover:bg-surface-100 rounded-lg transition">
        <Bell size={17} className="text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
        م
      </div>
    </header>
  )
}
