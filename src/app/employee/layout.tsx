'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Clock, CalendarDays, DollarSign, FileText, User, LogOut, Bell } from 'lucide-react'
import { EmployeeAuthProvider, useEmployeeAuth } from '@/lib/EmployeeAuthContext'

const NAV = [
  { href: '/employee',            label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/employee/attendance', label: 'الحضور',       icon: Clock },
  { href: '/employee/leaves',     label: 'الإجازات',     icon: CalendarDays },
  { href: '/employee/payslips',   label: 'الرواتب',      icon: DollarSign },
  { href: '/employee/documents',  label: 'وثائقي',       icon: FileText },
  { href: '/employee/profile',    label: 'ملفي الشخصي',  icon: User },
]

function EmployeeSidebar() {
  const { employee, signOut } = useEmployeeAuth()
  const path = usePathname()

  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: '#0f172a', display: 'flex', flexDirection: 'column',
      fontFamily: 'Cairo, sans-serif'
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(37,99,235,0.4)' }}>
            <Clock size={18} color="#fff" />
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1 }}>بوابة الموظف</p>
            <p style={{ color: '#60a5fa', fontSize: 10, margin: '3px 0 0' }}>Self Service Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: active ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'transparent',
              color: active ? '#fff' : '#94a3b8',
              boxShadow: active ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
            }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#fff' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' } }}
            >
              <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)' }}>
                <Icon size={15} />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User Card */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {employee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {employee.first_name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {employee.first_name} {employee.last_name}
              </p>
              <p style={{ color: '#64748b', fontSize: 10, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {employee.employee_number}
              </p>
            </div>
            <button onClick={signOut} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function EmployeeTopbar() {
  const { employee } = useEmployeeAuth()
  const path = usePathname()
  const current = NAV.find(n => n.href === path)

  return (
    <header style={{
      height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1 }}>
          {current?.label || 'بوابة الموظف'}
        </h1>
        {employee && (
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>
            {employee.department?.name_ar || ''} · {employee.job_position?.title_ar || ''}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Bell size={16} color="#475569" />
        </button>
        {employee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
              {employee.first_name[0]}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1 }}>{employee.first_name} {employee.last_name}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>{employee.employee_number}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function EmployeeLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Cairo, sans-serif' }}>
      <EmployeeSidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
        <EmployeeTopbar />
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
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
