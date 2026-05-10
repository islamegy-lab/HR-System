'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  Briefcase, GraduationCap, BarChart3, Settings, Building2,
  ChevronDown, LogOut, HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    ]
  },
  {
    label: 'إدارة الموظفين',
    items: [
      { href: '/employees', label: 'الموظفون', icon: Users },
      { href: '/departments', label: 'الأقسام', icon: Building2 },
      { href: '/attendance', label: 'الحضور والانصراف', icon: Clock },
      { href: '/leaves', label: 'الإجازات', icon: CalendarDays },
    ]
  },
  {
    label: 'المالية والتطوير',
    items: [
      { href: '/payroll', label: 'الرواتب', icon: DollarSign },
      { href: '/performance', label: 'تقييم الأداء', icon: BarChart3 },
      { href: '/recruitment', label: 'التوظيف', icon: Briefcase },
      { href: '/training', label: 'التدريب', icon: GraduationCap },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (label: string) =>
    setCollapsed(c => ({ ...c, [label]: !c[label] }))

  return (
    <aside className="w-60 bg-[#212b36] min-h-screen flex flex-col shrink-0 border-l border-white/5">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#875bf7] rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">نظام HR</p>
            <p className="text-gray-400 text-[10px]">إدارة الموارد البشرية</p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="w-full flex items-center justify-between px-2 py-1 mb-1"
            >
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{group.label}</span>
              <ChevronDown className={cn('w-3 h-3 text-gray-500 transition-transform', collapsed[group.label] && '-rotate-90')} />
            </button>
            {!collapsed[group.label] && (
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                        active
                          ? 'bg-[#875bf7] text-white font-medium shadow-lg shadow-purple-900/20'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      )}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{label}</span>
                      {active && <span className="mr-auto w-1.5 h-1.5 bg-white rounded-full opacity-70" />}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/settings" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all', pathname === '/settings' ? 'bg-[#875bf7] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200')}>
          <Settings size={16} />
          <span>الإعدادات</span>
        </Link>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
          <HelpCircle size={16} />
          <span>المساعدة</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-2 bg-white/5 rounded-lg">
          <div className="w-7 h-7 bg-[#875bf7] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">م</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">مدير النظام</p>
            <p className="text-gray-500 text-[10px] truncate">admin@hr.com</p>
          </div>
          <button className="text-gray-500 hover:text-gray-300 transition">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
