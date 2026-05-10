'use client'
import { useEffect, useState } from 'react'
import { Users, Clock, CalendarDays, DollarSign, Briefcase, UserCheck, TrendingUp, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { dashboardApi, leavesApi } from '@/lib/api'
import type { DashboardStats, LeaveRequest } from '@/types'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { useCurrency } from '@/lib/useCurrency'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const S = {
  page: { minHeight: '100vh', background: '#f1f5f9' } as React.CSSProperties,
  body: { padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 20 },
  grid6: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  grid3: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 } as React.CSSProperties,
  card: {
    background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
    overflow: 'hidden'
  } as React.CSSProperties,
  cardHead: {
    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  } as React.CSSProperties,
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
}

export default function DashboardPage() {
  const { format: formatCurrency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), leavesApi.getAll({ status: 'pending' })]).then(([s, l]) => {
      if (s.data) setStats(s.data)
      if (l.data) setLeaves(l.data.slice(0, 5) as LeaveRequest[])
      setLoading(false)
    })
  }, [])

  const CARDS = stats ? [
    { label: 'إجمالي الموظفين', value: stats.total_employees,  sub: `${stats.active_employees} نشط`,   icon: Users,       bg: '#eff6ff', ic: '#2563eb' },
    { label: 'حاضرون اليوم',    value: stats.present_today,    sub: `${stats.absent_today} غائب`,       icon: UserCheck,   bg: '#f0fdf4', ic: '#16a34a' },
    { label: 'طلبات معلقة',     value: stats.pending_leaves,   sub: 'إجازة قيد الانتظار',               icon: CalendarDays,bg: '#fffbeb', ic: '#d97706' },
    { label: 'الرواتب الشهرية', value: formatCurrency(stats.monthly_payroll), sub: 'هذا الشهر',         icon: DollarSign,  bg: '#faf5ff', ic: '#7c3aed' },
    { label: 'وظائف مفتوحة',    value: stats.open_jobs,        sub: 'للتوظيف',                          icon: Briefcase,   bg: '#fff1f2', ic: '#e11d48' },
    { label: 'في إجازة اليوم',  value: stats.on_leave_today,   sub: 'موظف',                             icon: TrendingUp,  bg: '#f0fdfa', ic: '#0d9488' },
  ] : []

  const attendanceData = stats?.attendance_chart || []
  const payrollData    = stats?.payroll_chart    || []

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Users size={22} color="#fff" />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: '#2563eb',
              animation: `pulse 1.2s ${i*0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <Topbar
        title="لوحة التحكم"
        subtitle={new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div style={S.body}>

        {/* Hero */}
        <div style={{
          borderRadius: 16, padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)'
        }}>
          <div style={{ position: 'absolute', top: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>مرحباً بك 👋</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>نظام إدارة الموارد البشرية</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            {stats?.pending_leaves ? `لديك ${stats.pending_leaves} طلب إجازة يحتاج مراجعة` : 'لا توجد طلبات معلقة اليوم ✓'}
          </p>
        </div>

        {/* Stats */}
        <div style={S.grid6}>
          {CARDS.map((c, i) => (
            <div key={i} className="card slide-up" style={{ padding: 16, animationDelay: `${i*60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <c.icon size={18} color={c.ic} />
                </div>
                <ArrowUpRight size={14} color="#94a3b8" />
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{c.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginTop: 4 }}>{c.label}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={S.grid2}>

          {/* Attendance Chart */}
          <div className="card slide-up" style={{ animationDelay: '200ms' }}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>
                <span style={{ width: 4, height: 18, borderRadius: 99, background: '#2563eb', display: 'inline-block' }} />
                الحضور الأسبوعي
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>آخر 6 أيام</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="حاضر" stroke="#2563eb" strokeWidth={2} fill="url(#gBlue)" dot={{ r: 3, fill: '#2563eb' }} />
                  <Area type="monotone" dataKey="غائب" stroke="#ef4444" strokeWidth={2} fill="url(#gGreen)" dot={{ r: 3, fill: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Chart */}
          <div className="card slide-up" style={{ animationDelay: '260ms' }}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>
                <span style={{ width: 4, height: 18, borderRadius: 99, background: '#7c3aed', display: 'inline-block' }} />
                الرواتب الشهرية
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>آخر 6 أشهر</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={payrollData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="الرواتب" fill="#7c3aed" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={S.grid3}>

          {/* Pending Leaves */}
          <div className="card slide-up" style={{ animationDelay: '320ms' }}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>
                <span style={{ width: 4, height: 18, borderRadius: 99, background: '#d97706', display: 'inline-block' }} />
                طلبات الإجازة المعلقة
              </span>
              <a href="/leaves" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                عرض الكل <ArrowLeft size={12} />
              </a>
            </div>
            {leaves.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <CalendarDays size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['الموظف', 'نوع الإجازة', 'الأيام', 'الحالة'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {l.employee?.first_name?.[0]}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.employee?.first_name} {l.employee?.last_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#475569' }}>{l.leave_type?.name_ar}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{l.days_count} يوم</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card slide-up" style={{ animationDelay: '360ms' }}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>
                <span style={{ width: 4, height: 18, borderRadius: 99, background: '#0d9488', display: 'inline-block' }} />
                إجراءات سريعة
              </span>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'إضافة موظف',   href: '/employees',   icon: Users,        bg: '#eff6ff', ic: '#2563eb' },
                { label: 'تسجيل حضور',  href: '/attendance',  icon: Clock,        bg: '#f0fdf4', ic: '#16a34a' },
                { label: 'طلب إجازة',   href: '/leaves',      icon: CalendarDays, bg: '#fffbeb', ic: '#d97706' },
                { label: 'كشف الرواتب', href: '/payroll',     icon: DollarSign,   bg: '#faf5ff', ic: '#7c3aed' },
                { label: 'وظيفة جديدة', href: '/recruitment', icon: Briefcase,    bg: '#fff1f2', ic: '#e11d48' },
                { label: 'تقييم الأداء',href: '/performance', icon: TrendingUp,   bg: '#f0fdfa', ic: '#0d9488' },
              ].map(q => (
                <a key={q.href} href={q.href} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 8px', borderRadius: 12, border: '1px solid #f1f5f9',
                  textDecoration: 'none', transition: 'all 0.2s', background: '#fff'
                }}
                  onMouseEnter={e => { (e.currentTarget.style.borderColor = '#bfdbfe'); (e.currentTarget.style.background = '#f8fafc') }}
                  onMouseLeave={e => { (e.currentTarget.style.borderColor = '#f1f5f9'); (e.currentTarget.style.background = '#fff') }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <q.icon size={16} color={q.ic} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#334155', textAlign: 'center' }}>{q.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
