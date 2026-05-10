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

const TABS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'معلقة' },
  { value: 'approved', label: 'موافق عليها' },
  { value: 'rejected', label: 'مرفوضة' },
]

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [types, setTypes] = useState<LeaveType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await leavesApi.getAll({ status: tab || undefined })
    if (data) setLeaves(data as LeaveRequest[])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    leavesApi.getTypes().then(({ data }) => { if (data) setTypes(data) })
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const calcDays = (s: string, e: string) => !s || !e ? 0 : Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1

  const handleSave = async () => {
    setSaving(true)
    await leavesApi.create({ ...form, days_count: calcDays(form.start_date, form.end_date), status: 'pending' })
    setSaving(false); setShowForm(false); load()
  }

  const pending  = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length
  const rejected = leaves.filter(l => l.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="الإجازات" subtitle={`${leaves.length} طلب`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>طلب إجازة</Button>} />

      <div className="p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'قيد الانتظار', value: pending,  bg: 'bg-yellow-50', ic: 'text-yellow-600' },
            { label: 'موافق عليها',  value: approved, bg: 'bg-green-50',  ic: 'text-green-600' },
            { label: 'مرفوضة',       value: rejected, bg: 'bg-red-50',    ic: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <CalendarDays size={20} className={s.ic} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="flex gap-0.5 bg-gray-100 p-1 rounded-lg">
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.value ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
                {t.value === 'pending' && pending > 0 && (
                  <span className="mr-1.5 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['الموظف', 'نوع الإجازة', 'من', 'إلى', 'الأيام', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="text-right text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : leaves.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                    <CalendarDays size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">لا توجد طلبات</p>
                  </div>
                </td></tr>
              ) : leaves.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">{l.employee?.first_name?.[0]}</div>
                      <span className="text-sm font-semibold text-gray-900">{l.employee?.first_name} {l.employee?.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{l.leave_type?.name_ar}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(l.start_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(l.end_date)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-indigo-600">{l.days_count}</span>
                    <span className="text-xs text-gray-400 mr-1">يوم</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{l.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {l.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => leavesApi.updateStatus(l.id, 'approved').then(load)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition border border-green-200">
                          <Check size={11} /> موافقة
                        </button>
                        <button onClick={() => leavesApi.updateStatus(l.id, 'rejected').then(load)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition border border-red-200">
                          <X size={11} /> رفض
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="طلب إجازة جديد" size="md">
        <div className="space-y-4">
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Select label="نوع الإجازة *" value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
            options={types.map(t => ({ value: t.id, label: t.name_ar || t.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="من تاريخ *" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="إلى تاريخ *" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          {form.start_date && form.end_date && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
              <span className="text-indigo-700 font-bold text-lg">{calcDays(form.start_date, form.end_date)}</span>
              <span className="text-indigo-600 text-sm mr-1">أيام</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">السبب</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إرسال الطلب</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
