'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  Briefcase, GraduationCap, BarChart3, Settings, Building2, LogOut, FileText, MapPin
} from 'lucide-react'

const NAV = [
  {
    label: 'الرئيسية',
    items: [
      { href: '/dashboard',   label: 'لوحة التحكم',       icon: LayoutDashboard },
    ]
  },
  {
    label: 'الموظفون',
    items: [
      { href: '/employees',   label: 'الموظفون',           icon: Users },
      { href: '/departments', label: 'الأقسام',             icon: Building2 },
      { href: '/attendance',  label: 'الحضور والانصراف',   icon: Clock },
      { href: '/leaves',      label: 'الإجازات',            icon: CalendarDays },
    ]
  },
  {
    label: 'المالية والتطوير',
    items: [
      { href: '/payroll',     label: 'الرواتب',             icon: DollarSign },
      { href: '/performance', label: 'تقييم الأداء',        icon: BarChart3 },
      { href: '/recruitment', label: 'التوظيف',             icon: Briefcase },
      { href: '/training',    label: 'التدريب',             icon: GraduationCap },
    ]
  },
  {
    label: 'الإدارة',
    items: [
      { href: '/documents',         label: 'الأوراق الرسمية',   icon: FileText },
      { href: '/employee/attendance',label: 'بوابة الموظف',      icon: MapPin },
    ]
  },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{ width: 240, background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
          }}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>نظام HR</p>
            <p style={{ color: '#60a5fa', fontSize: 11, marginTop: 3 }}>الموارد البشرية</p>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              بواسطة <span style={{ color: '#60a5fa', fontWeight: 700 }}>دُكَّانِي</span>
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <p style={{
              color: 'rgba(148,163,184,0.6)', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              padding: '0 10px', marginBottom: 6
            }}>
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = path === href || path.startsWith(href + '/')
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  background: active ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  boxShadow: active ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#fff' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' } }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
                  }}>
                    <Icon size={15} />
                  </span>
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 10, marginBottom: 8,
          fontSize: 13, fontWeight: 500, textDecoration: 'none',
          color: path === '/settings' ? '#fff' : '#94a3b8',
          background: path === '/settings' ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'transparent',
        }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
            <Settings size={15} />
          </span>
          الإعدادات
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700
          }}>م</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>مدير النظام</p>
            <p style={{ color: '#64748b', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@hr.com</p>
          </div>
          <button style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
