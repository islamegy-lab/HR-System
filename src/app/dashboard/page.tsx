'use client'
import { useEffect, useState } from 'react'
import { Users, Clock, CalendarDays, DollarSign, Briefcase, UserCheck, TrendingUp, ArrowLeft } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { dashboardApi, leavesApi } from '@/lib/api'
import type { DashboardStats, LeaveRequest } from '@/types'
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
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

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const cards = stats ? [
    { label: 'إجمالي الموظفين',  value: stats.total_employees,  sub: `${stats.active_employees} نشط`,        icon: Users,     bg: 'bg-brand-50',  ic: 'text-brand-600' },
    { label: 'حاضرون اليوم',     value: stats.present_today,    sub: `${stats.absent_today} غائب`,            icon: UserCheck, bg: 'bg-green-50',  ic: 'text-green-600' },
    { label: 'طلبات معلقة',      value: stats.pending_leaves,   sub: 'إجازات قيد الانتظار',                   icon: CalendarDays, bg: 'bg-yellow-50', ic: 'text-yellow-600' },
    { label: 'الرواتب الشهرية',  value: formatCurrency(stats.monthly_payroll), sub: 'هذا الشهر',              icon: DollarSign, bg: 'bg-blue-50',   ic: 'text-blue-600' },
    { label: 'وظائف مفتوحة',     value: stats.open_jobs,        sub: 'للتوظيف',                               icon: Briefcase,  bg: 'bg-pink-50',   ic: 'text-pink-600' },
    { label: 'في إجازة اليوم',   value: stats.on_leave_today,   sub: 'موظف',                                  icon: TrendingUp, bg: 'bg-orange-50', ic: 'text-orange-600' },
  ] : []

  const quickLinks = [
    { label: 'إضافة موظف',    href: '/employees',   icon: Users,       bg: 'bg-brand-50',  ic: 'text-brand-600' },
    { label: 'تسجيل حضور',   href: '/attendance',  icon: Clock,       bg: 'bg-green-50',  ic: 'text-green-600' },
    { label: 'طلب إجازة',    href: '/leaves',      icon: CalendarDays,bg: 'bg-yellow-50', ic: 'text-yellow-600' },
    { label: 'كشف الرواتب',  href: '/payroll',     icon: DollarSign,  bg: 'bg-blue-50',   ic: 'text-blue-600' },
    { label: 'وظيفة جديدة',  href: '/recruitment', icon: Briefcase,   bg: 'bg-pink-50',   ic: 'text-pink-600' },
    { label: 'تقييم الأداء', href: '/performance', icon: TrendingUp,  bg: 'bg-orange-50', ic: 'text-orange-600' },
  ]

  return (
    <div className="page-wrapper">
      <Topbar
        title="لوحة التحكم"
        subtitle={new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="p-6 space-y-5">

        {/* Banner */}
        <div className="bg-brand-600 rounded-xl p-5 text-white">
          <p className="text-brand-200 text-xs mb-1">مرحباً بك 👋</p>
          <h2 className="text-lg font-bold">نظام إدارة الموارد البشرية</h2>
          <p className="text-brand-200 text-sm mt-1">
            {stats?.pending_leaves ? `لديك ${stats.pending_leaves} طلب إجازة يحتاج مراجعة` : 'لا توجد طلبات معلقة اليوم'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${c.bg}`}>
                <c.icon size={18} className={c.ic} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs font-semibold text-gray-700">{c.label}</p>
                <p className="text-[11px] text-gray-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Pending Leaves Table */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="card-header">
              <span className="card-title">طلبات الإجازة المعلقة</span>
              <a href="/leaves" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                عرض الكل <ArrowLeft size={12} />
              </a>
            </div>
            {leaves.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={32} className="mb-2 opacity-20" />
                <p className="text-sm">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    {['الموظف', 'نوع الإجازة', 'الأيام', 'الحالة'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id} className="table-row">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="avatar w-7 h-7 text-xs">{l.employee?.first_name?.[0]}</div>
                          <span className="font-medium text-gray-900">{l.employee?.first_name} {l.employee?.last_name}</span>
                        </div>
                      </td>
                      <td className="table-td text-gray-500">{l.leave_type?.name_ar}</td>
                      <td className="table-td font-semibold text-brand-600">{l.days_count} يوم</td>
                      <td className="table-td">
                        <span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Links */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <span className="card-title">إجراءات سريعة</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {quickLinks.map(q => (
                <a key={q.href} href={q.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-surface-200 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${q.bg} group-hover:scale-110 transition-transform`}>
                    <q.icon size={16} className={q.ic} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 text-center">{q.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
