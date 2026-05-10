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
  { value: 'pending',  label: 'معلقة' },
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

  const days = (s: string, e: string) => !s || !e ? 0 : Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1

  const handleSave = async () => {
    setSaving(true)
    await leavesApi.create({ ...form, days_count: days(form.start_date, form.end_date), status: 'pending' })
    setSaving(false); setShowForm(false); load()
  }

  const pending  = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length
  const rejected = leaves.filter(l => l.status === 'rejected').length

  return (
    <div className="page-wrapper">
      <Topbar
        title="الإجازات"
        subtitle={`${leaves.length} طلب`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>طلب إجازة</Button>}
      />

      <div className="p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'قيد الانتظار', value: pending,  bg: 'bg-yellow-50', ic: 'text-yellow-600' },
            { label: 'موافق عليها',  value: approved, bg: 'bg-green-50',  ic: 'text-green-600' },
            { label: 'مرفوضة',       value: rejected, bg: 'bg-red-50',    ic: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.bg}`}><CalendarDays size={20} className={s.ic} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="filter-bar">
          <div className="tab-group">
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`tab-item ${tab === t.value ? 'tab-item-active' : ''}`}>
                {t.label}
                {t.value === 'pending' && pending > 0 && (
                  <span className="mr-1 badge badge-yellow">{pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {['الموظف', 'نوع الإجازة', 'من', 'إلى', 'الأيام', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td colSpan={8} className="px-4 py-3"><div className="h-6 bg-surface-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : leaves.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <CalendarDays size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">لا توجد طلبات</p>
                  </div>
                </td></tr>
              ) : leaves.map(l => (
                <tr key={l.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar w-8 h-8 text-sm">{l.employee?.first_name?.[0]}</div>
                      <span className="font-semibold text-gray-900">{l.employee?.first_name} {l.employee?.last_name}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="badge badge-brand">{l.leave_type?.name_ar}</span>
                  </td>
                  <td className="table-td text-gray-500">{formatDate(l.start_date)}</td>
                  <td className="table-td text-gray-500">{formatDate(l.end_date)}</td>
                  <td className="table-td">
                    <span className="font-bold text-brand-600">{l.days_count}</span>
                    <span className="text-xs text-gray-400 mr-1">يوم</span>
                  </td>
                  <td className="table-td text-gray-400 text-xs max-w-32 truncate">{l.reason || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
                  </td>
                  <td className="table-td">
                    {l.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => leavesApi.updateStatus(l.id, 'approved').then(load)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition border border-green-200">
                          <Check size={11} /> موافقة
                        </button>
                        <button onClick={() => leavesApi.updateStatus(l.id, 'rejected').then(load)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition border border-red-200">
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
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-center">
              <span className="text-brand-700 font-bold text-lg">{days(form.start_date, form.end_date)}</span>
              <span className="text-brand-600 text-sm mr-1">أيام</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="form-label">السبب</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              className="form-input resize-none" />
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
