'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Clock, CalendarDays, DollarSign, FileText, User, LogOut } from 'lucide-react'
import { EmployeeAuthProvider, useEmployeeAuth } from '@/lib/EmployeeAuthContext'

const NAV = [
  { href: '/employee',           label: 'الرئيسية',  icon: LayoutDashboard },
  { href: '/employee/attendance', label: 'الحضور',    icon: Clock },
  { href: '/employee/leaves',     label: 'الإجازات',  icon: CalendarDays },
  { href: '/employee/payslips',   label: 'الرواتب',   icon: DollarSign },
  { href: '/employee/documents',  label: 'وثائقي',    icon: FileText },
  { href: '/employee/profile',    label: 'ملفي',      icon: User },
]

function EmployeeHeader() {
  const { employee, signOut } = useEmployeeAuth()
  const path = usePathname()
  const current = NAV.find(n => n.href === path)

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      padding: '0 20px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={16} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1 }}>بوابة الموظف</p>
          <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>{current?.label || ''}</p>
        </div>
      </div>

      {employee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0 }}>{employee.first_name} {employee.last_name}</p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: '1px 0 0' }}>{employee.job_position?.title_ar || employee.department?.name_ar || ''}</p>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {employee.first_name[0]}
          </div>
          <button onClick={signOut} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8' }}>
            <LogOut size={14} />
          </button>
        </div>
      )}
    </header>
  )
}

function EmployeeBottomNav() {
  const path = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: '#fff', borderTop: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
    }}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px 12px', textDecoration: 'none', gap: 4,
            color: active ? '#2563eb' : '#94a3b8',
            borderTop: active ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'all 0.15s'
          }}>
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function EmployeeLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Cairo, sans-serif', paddingBottom: 70 }}>
      <EmployeeHeader />
      <main>{children}</main>
      <EmployeeBottomNav />
    </div>
  )
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeAuthProvider>
      <EmployeeLayoutInner>{children}</EmployeeLayoutInner>
    </EmployeeAuthProvider>
  )
}
