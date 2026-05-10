'use client'
import { useEffect, useState } from 'react'
import { Users, Clock, CalendarDays, DollarSign, Briefcase, TrendingUp, UserCheck, UserX } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { dashboardApi, leavesApi } from '@/lib/api'
import type { DashboardStats, LeaveRequest } from '@/types'
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const statCards = (stats: DashboardStats) => [
  { label: 'إجمالي الموظفين', value: stats.total_employees, icon: Users, color: 'bg-purple-500', change: '+2 هذا الشهر' },
  { label: 'حاضرون اليوم', value: stats.present_today, icon: UserCheck, color: 'bg-green-500', change: `${stats.absent_today} غائب` },
  { label: 'طلبات الإجازة', value: stats.pending_leaves, icon: CalendarDays, color: 'bg-yellow-500', change: 'قيد الانتظار' },
  { label: 'الرواتب الشهرية', value: formatCurrency(stats.monthly_payroll), icon: DollarSign, color: 'bg-blue-500', change: 'هذا الشهر' },
  { label: 'وظائف مفتوحة', value: stats.open_jobs, icon: Briefcase, color: 'bg-pink-500', change: 'للتوظيف' },
  { label: 'في إجازة', value: stats.on_leave_today, icon: TrendingUp, color: 'bg-orange-500', change: 'اليوم' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      leavesApi.getAll({ status: 'pending' }),
    ]).then(([statsRes, leavesRes]) => {
      if (statsRes.data) setStats(statsRes.data)
      if (leavesRes.data) setRecentLeaves(leavesRes.data.slice(0, 5) as LeaveRequest[])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <Topbar title="لوحة التحكم" subtitle={`مرحباً، ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
      <div className="p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats && statCards(stats).map((card, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Leaves */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">طلبات الإجازة المعلقة</h3>
                <a href="/leaves" className="text-xs text-purple-600 hover:underline">عرض الكل</a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentLeaves.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">لا توجد طلبات معلقة</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentLeaves.map(leave => (
                    <div key={leave.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                        {leave.employee?.first_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {leave.employee?.first_name} {leave.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{leave.leave_type?.name_ar} · {leave.days_count} أيام</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">الإجراءات السريعة</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'إضافة موظف', href: '/employees', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', icon: Users },
                  { label: 'تسجيل حضور', href: '/attendance', color: 'bg-green-50 text-green-700 hover:bg-green-100', icon: Clock },
                  { label: 'طلب إجازة', href: '/leaves', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', icon: CalendarDays },
                  { label: 'كشف الرواتب', href: '/payroll', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', icon: DollarSign },
                  { label: 'وظيفة جديدة', href: '/recruitment', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100', icon: Briefcase },
                  { label: 'برنامج تدريبي', href: '/training', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', icon: TrendingUp },
                ].map(action => (
                  <a key={action.href} href={action.href}
                    className={`flex items-center gap-2 p-3 rounded-xl transition text-sm font-medium ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
