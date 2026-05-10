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
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const cards = stats ? [
    { label: 'إجمالي الموظفين', value: stats.total_employees,  sub: `${stats.active_employees} نشط`,     icon: Users,       bg: 'bg-indigo-50', ic: 'text-indigo-600' },
    { label: 'حاضرون اليوم',    value: stats.present_today,    sub: `${stats.absent_today} غائب`,         icon: UserCheck,   bg: 'bg-green-50',  ic: 'text-green-600' },
    { label: 'طلبات معلقة',     value: stats.pending_leaves,   sub: 'إجازات قيد الانتظار',                icon: CalendarDays,bg: 'bg-yellow-50', ic: 'text-yellow-600' },
    { label: 'الرواتب الشهرية', value: formatCurrency(stats.monthly_payroll), sub: 'هذا الشهر',           icon: DollarSign,  bg: 'bg-blue-50',   ic: 'text-blue-600' },
    { label: 'وظائف مفتوحة',    value: stats.open_jobs,        sub: 'للتوظيف',                            icon: Briefcase,   bg: 'bg-pink-50',   ic: 'text-pink-600' },
    { label: 'في إجازة اليوم',  value: stats.on_leave_today,   sub: 'موظف',                               icon: TrendingUp,  bg: 'bg-orange-50', ic: 'text-orange-600' },
  ] : []

  const quickLinks = [
    { label: 'إضافة موظف',   href: '/employees',   icon: Users,       bg: 'bg-indigo-50', ic: 'text-indigo-600' },
    { label: 'تسجيل حضور',  href: '/attendance',  icon: Clock,       bg: 'bg-green-50',  ic: 'text-green-600' },
    { label: 'طلب إجازة',   href: '/leaves',      icon: CalendarDays,bg: 'bg-yellow-50', ic: 'text-yellow-600' },
    { label: 'كشف الرواتب', href: '/payroll',     icon: DollarSign,  bg: 'bg-blue-50',   ic: 'text-blue-600' },
    { label: 'وظيفة جديدة', href: '/recruitment', icon: Briefcase,   bg: 'bg-pink-50',   ic: 'text-pink-600' },
    { label: 'تقييم الأداء',href: '/performance', icon: TrendingUp,  bg: 'bg-orange-50', ic: 'text-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="لوحة التحكم" subtitle={new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
      <div className="p-6 space-y-5">

        {/* Banner */}
        <div className="bg-indigo-600 rounded-xl p-5 text-white">
          <p className="text-indigo-200 text-xs mb-1">مرحباً بك 👋</p>
          <h2 className="text-lg font-bold">نظام إدارة الموارد البشرية</h2>
          <p className="text-indigo-200 text-sm mt-1">
            {stats?.pending_leaves ? `لديك ${stats.pending_leaves} طلب إجازة يحتاج مراجعة` : 'لا توجد طلبات معلقة اليوم'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                <c.icon size={18} className={c.ic} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{c.label}</p>
                <p className="text-[11px] text-gray-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Pending Leaves */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                <h3 className="text-sm font-bold text-gray-900">طلبات الإجازة المعلقة</h3>
              </div>
              <a href="/leaves" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                عرض الكل <ArrowLeft size={12} />
              </a>
            </div>
            {leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarDays size={32} className="mb-2 opacity-20" />
                <p className="text-sm">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['الموظف', 'نوع الإجازة', 'الأيام', 'الحالة'].map(h => (
                      <th key={h} className="text-right text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">{l.employee?.first_name?.[0]}</div>
                          <span className="text-sm font-medium text-gray-900">{l.employee?.first_name} {l.employee?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{l.leave_type?.name_ar}</td>
                      <td className="px-5 py-3 text-sm font-bold text-indigo-600">{l.days_count} يوم</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(l.status)}`}>
                          {getStatusLabel(l.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <div className="w-1 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900">إجراءات سريعة</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {quickLinks.map(q => (
                <a key={q.href} href={q.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
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
