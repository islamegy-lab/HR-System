'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  Briefcase, GraduationCap, BarChart3, Settings, Building2, ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/employees', label: 'الموظفون', icon: Users },
  { href: '/attendance', label: 'الحضور والانصراف', icon: Clock },
  { href: '/leaves', label: 'الإجازات', icon: CalendarDays },
  { href: '/payroll', label: 'الرواتب', icon: DollarSign },
  { href: '/recruitment', label: 'التوظيف', icon: Briefcase },
  { href: '/training', label: 'التدريب', icon: GraduationCap },
  { href: '/performance', label: 'الأداء', icon: BarChart3 },
  { href: '/departments', label: 'الأقسام', icon: Building2 },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#1e1b4b] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">نظام الموارد البشرية</p>
            <p className="text-purple-300 text-xs">HR System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                active
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronLeft className="w-4 h-4 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">م</div>
          <div>
            <p className="text-white text-xs font-medium">مدير النظام</p>
            <p className="text-purple-300 text-xs">admin@hr.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
