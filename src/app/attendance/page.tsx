'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { attendanceApi, employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Attendance, Employee } from '@/types'

const today = new Date().toISOString().split('T')[0]

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ employee_id: '', date: today, check_in: '', check_out: '', status: 'present', notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await attendanceApi.getAll({ date_from: date, date_to: date })
    if (data) setRecords(data as Attendance[])
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const ci = form.check_in ? new Date(`${form.date}T${form.check_in}`).toISOString() : undefined
    const co = form.check_out ? new Date(`${form.date}T${form.check_out}`).toISOString() : undefined
    const wh = ci && co ? (new Date(co).getTime() - new Date(ci).getTime()) / 3600000 : undefined
    await attendanceApi.upsert({ ...form, check_in: ci, check_out: co, work_hours: wh, status: form.status as import('@/types').AttendanceStatus })
    setSaving(false); setShowForm(false); load()
  }

  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length

  return (
    <div className="page-wrapper">
      <Topbar
        title="الحضور والانصراف"
        subtitle={new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>تسجيل حضور</Button>}
      />

      <div className="p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'حاضر',  value: present, icon: CheckCircle, bg: 'bg-green-50',  ic: 'text-green-600' },
            { label: 'غائب',  value: absent,  icon: XCircle,     bg: 'bg-red-50',    ic: 'text-red-600' },
            { label: 'متأخر', value: late,    icon: Clock,       bg: 'bg-yellow-50', ic: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.bg}`}><s.icon size={20} className={s.ic} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Date Filter */}
        <div className="filter-bar">
          <label className="text-xs font-semibold text-gray-500">التاريخ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="form-input w-auto" />
          <button onClick={() => setDate(today)} className="text-xs text-brand-600 hover:underline">اليوم</button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {['الموظف', 'التاريخ', 'وقت الحضور', 'وقت الانصراف', 'ساعات العمل', 'الحالة', 'ملاحظات'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td colSpan={7} className="px-4 py-3"><div className="h-6 bg-surface-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <Clock size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">لا توجد سجلات لهذا اليوم</p>
                  </div>
                </td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar w-8 h-8 text-sm">{r.employee?.first_name?.[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{r.employee?.first_name} {r.employee?.last_name}</p>
                        <p className="text-xs text-gray-400">{r.employee?.employee_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-gray-500">{r.date}</td>
                  <td className="table-td font-semibold text-gray-800">
                    {r.check_in ? new Date(r.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-td font-semibold text-gray-800">
                    {r.check_out ? new Date(r.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-td">
                    {r.work_hours ? <span className="font-bold text-brand-600">{r.work_hours.toFixed(1)}<span className="text-xs font-normal text-gray-400 mr-1">س</span></span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-td">
                    <span className={`badge ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span>
                  </td>
                  <td className="table-td text-gray-400 text-xs">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تسجيل حضور" size="md">
        <div className="space-y-4">
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="وقت الحضور" type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
            <Input label="وقت الانصراف" type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            options={[{ value: 'present', label: 'حاضر' }, { value: 'absent', label: 'غائب' }, { value: 'late', label: 'متأخر' }, { value: 'half_day', label: 'نصف يوم' }]} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
