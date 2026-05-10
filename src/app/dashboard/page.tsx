'use client'
import { useEffect, useState } from 'react'
import { Users, Clock, CalendarDays, DollarSign, Briefcase, UserCheck, UserX, TrendingUp, ArrowUpRight } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { dashboardApi, leavesApi } from '@/lib/api'
import type { DashboardStats, LeaveRequest } from '@/types'
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), leavesApi.getAll({ status: 'pending' })]).then(([s, l]) => {
      if (s.data) setStats(s.data)
      if (l.data) setRecentLeaves(l.data.slice(0, 6) as LeaveRequest[])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#875bf7] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  )

  const statCards = stats ? [
    { label: 'إجمالي الموظفين', value: stats.total_employees, sub: `${stats.active_employees} نشط`, icon: Users, color: '#875bf7', bg: '#f3eeff' },
    { label: 'حاضرون اليوم', value: stats.present_today, sub: `${stats.absent_today} غائب`, icon: UserCheck, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'في إجازة', value: stats.on_leave_today, sub: `${stats.pending_leaves} طلب معلق`, icon: CalendarDays, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'الرواتب الشهرية', value: formatCurrency(stats.monthly_payroll), sub: 'هذا الشهر', icon: DollarSign, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'وظائف مفتوحة', value: stats.open_jobs, sub: 'للتوظيف', icon: Briefcase, color: '#ec4899', bg: '#fdf2f8' },
    { label: 'معدل الحضور', value: stats.total_employees ? `${Math.round((stats.present_today / stats.active_employees) * 100)}%` : '0%', sub: 'اليوم', icon: TrendingUp, color: '#14b8a6', bg: '#f0fdfa' },
  ] : []

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Topbar title="لوحة التحكم" subtitle={new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      <div className="p-6 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-l from-[#875bf7] to-[#6d28d9] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative">
            <p className="text-purple-200 text-sm mb-1">مرحباً بك 👋</p>
            <h2 className="text-2xl font-bold mb-1">نظام إدارة الموارد البشرية</h2>
            <p className="text-purple-200 text-sm">لديك {stats?.pending_leaves || 0} طلب إجازة يحتاج مراجعة اليوم</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <card.icon className="w-4.5 h-4.5" size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pending Leaves */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#875bf7] rounded-full" />
                <h3 className="font-semibold text-gray-900 text-sm">طلبات الإجازة المعلقة</h3>
                {recentLeaves.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">{recentLeaves.length}</span>
                )}
              </div>
              <a href="/leaves" className="text-xs text-[#875bf7] hover:underline flex items-center gap-1">
                عرض الكل <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            {recentLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarDays className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="w-8 h-8 bg-[#f3eeff] rounded-full flex items-center justify-center text-[#875bf7] text-xs font-bold shrink-0">
                      {leave.employee?.first_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{leave.employee?.first_name} {leave.employee?.last_name}</p>
                      <p className="text-xs text-gray-400">{leave.leave_type?.name_ar} · {leave.days_count} أيام · {formatDate(leave.start_date)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${getStatusColor(leave.status)}`}>
                      {getStatusLabel(leave.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-[#875bf7] rounded-full" />
              <h3 className="font-semibold text-gray-900 text-sm">إجراءات سريعة</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: 'موظف جديد', href: '/employees', icon: Users, color: '#875bf7', bg: '#f3eeff' },
                { label: 'تسجيل حضور', href: '/attendance', icon: Clock, color: '#22c55e', bg: '#f0fdf4' },
                { label: 'طلب إجازة', href: '/leaves', icon: CalendarDays, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'كشف الرواتب', href: '/payroll', icon: DollarSign, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'وظيفة جديدة', href: '/recruitment', icon: Briefcase, color: '#ec4899', bg: '#fdf2f8' },
                { label: 'تقييم أداء', href: '/performance', icon: TrendingUp, color: '#14b8a6', bg: '#f0fdfa' },
              ].map(a => (
                <a key={a.href} href={a.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:shadow-sm transition-all border border-gray-100 hover:border-gray-200 group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: a.bg }}>
                    <a.icon size={16} style={{ color: a.color }} />
                  </div>
                  <span className="text-xs text-gray-600 font-medium text-center leading-tight">{a.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <div className="w-1 h-5 bg-[#875bf7] rounded-full" />
            <h3 className="font-semibold text-gray-900 text-sm">آخر النشاطات</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {[
                { text: 'تم إضافة موظف جديد: محمد أحمد', time: 'منذ 10 دقائق', color: 'bg-purple-400', icon: Users },
                { text: 'تمت الموافقة على إجازة سنوية لـ سارة علي', time: 'منذ 30 دقيقة', color: 'bg-green-400', icon: CalendarDays },
                { text: 'تم توليد رواتب شهر مايو 2025', time: 'منذ ساعتين', color: 'bg-blue-400', icon: DollarSign },
                { text: 'تم نشر وظيفة مهندس برمجيات', time: 'منذ 3 ساعات', color: 'bg-pink-400', icon: Briefcase },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 ${item.color} rounded-full mt-1.5 shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
