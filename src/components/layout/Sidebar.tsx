'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Clock, CalendarDays, DollarSign, Briefcase, GraduationCap, BarChart3, Settings, Building2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const groups = [
  { label: 'عام', items: [{ href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard }] },
  { label: 'الموظفون', items: [
    { href: '/employees',   label: 'الموظفون',        icon: Users },
    { href: '/departments', label: 'الأقسام',          icon: Building2 },
    { href: '/attendance',  label: 'الحضور والانصراف', icon: Clock },
    { href: '/leaves',      label: 'الإجازات',         icon: CalendarDays },
  ]},
  { label: 'المالية والتطوير', items: [
    { href: '/payroll',     label: 'الرواتب',          icon: DollarSign },
    { href: '/performance', label: 'تقييم الأداء',     icon: BarChart3 },
    { href: '/recruitment', label: 'التوظيف',          icon: Briefcase },
    { href: '/training',    label: 'التدريب',          icon: GraduationCap },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-none">نظام HR</p>
            <p className="text-gray-500 text-[10px] mt-0.5">الموارد البشرية</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-0.5">
        <Link href="/settings"
          className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/settings' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}>
          <Settings size={15} /> الإعدادات
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-lg bg-white/5">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">م</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">مدير النظام</p>
            <p className="text-gray-500 text-[10px] truncate">admin@hr.com</p>
          </div>
          <button className="text-gray-500 hover:text-gray-300 transition shrink-0"><LogOut size={13} /></button>
        </div>
      </div>
    </aside>
  )
}
