'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Check, X, CalendarDays } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { leavesApi, employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { LeaveRequest, LeaveType, Employee } from '@/types'

const tabs = [
  { value: '', label: 'الكل', color: '' },
  { value: 'pending', label: 'قيد الانتظار', color: 'text-yellow-600' },
  { value: 'approved', label: 'موافق عليها', color: 'text-green-600' },
  { value: 'rejected', label: 'مرفوضة', color: 'text-red-600' },
]

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await leavesApi.getAll({ status: statusFilter || undefined })
    if (data) setLeaves(data as LeaveRequest[])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    leavesApi.getTypes().then(({ data }) => { if (data) setLeaveTypes(data) })
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const calcDays = (s: string, e: string) => !s || !e ? 0 : Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1

  const handleSave = async () => {
    setSaving(true)
    await leavesApi.create({ ...form, days_count: calcDays(form.start_date, form.end_date), status: 'pending' })
    setSaving(false); setShowForm(false); load()
  }

  const counts = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Topbar
        title="الإجازات"
        subtitle={`${leaves.length} طلب`}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)} size="sm">طلب إجازة</Button>}
      />

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'قيد الانتظار', value: counts.pending, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'موافق عليها', value: counts.approved, color: '#22c55e', bg: '#f0fdf4' },
            { label: 'مرفوضة', value: counts.rejected, color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <CalendarDays className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === tab.value ? 'bg-white shadow text-[#875bf7]' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
                {tab.value === 'pending' && counts.pending > 0 && (
                  <span className="mr-1.5 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['الموظف', 'نوع الإجازة', 'من', 'إلى', 'الأيام', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-5 py-3"><div className="h-7 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : leaves.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-14">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">لا توجد طلبات</p>
                  </td></tr>
                ) : leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-[#f8f9fb] transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#f3eeff] rounded-full flex items-center justify-center text-[#875bf7] text-xs font-bold">
                          {leave.employee?.first_name?.[0]}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{leave.employee?.first_name} {leave.employee?.last_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: leave.leave_type?.color + '20', color: leave.leave_type?.color }}>
                        {leave.leave_type?.name_ar}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{formatDate(leave.start_date)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{formatDate(leave.end_date)}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-[#875bf7]">{leave.days_count}</span>
                      <span className="text-xs text-gray-400 mr-1">يوم</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 max-w-32 truncate">{leave.reason || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {leave.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => leavesApi.updateStatus(leave.id, 'approved').then(load)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                            <Check className="w-3 h-3" /> موافقة
                          </button>
                          <button onClick={() => leavesApi.updateStatus(leave.id, 'rejected').then(load)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                            <X className="w-3 h-3" /> رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="طلب إجازة جديد" size="md">
        <div className="space-y-4">
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Select label="نوع الإجازة *" value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
            options={leaveTypes.map(t => ({ value: t.id, label: t.name_ar || t.name }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="من تاريخ *" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="إلى تاريخ *" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          {form.start_date && form.end_date && (
            <div className="bg-[#f3eeff] rounded-xl p-3 text-center border border-purple-100">
              <span className="text-[#875bf7] font-bold text-lg">{calcDays(form.start_date, form.end_date)}</span>
              <span className="text-[#875bf7] text-sm mr-1">أيام</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">السبب</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#875bf7] resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إرسال الطلب</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
