'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
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
  const [dateFilter, setDateFilter] = useState(today)
  const [form, setForm] = useState({ employee_id: '', date: today, check_in: '', check_out: '', status: 'present', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await attendanceApi.getAll({ date_from: dateFilter, date_to: dateFilter })
    if (data) setRecords(data as Attendance[])
    setLoading(false)
  }, [dateFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const checkIn = form.check_in ? new Date(`${form.date}T${form.check_in}`).toISOString() : undefined
    const checkOut = form.check_out ? new Date(`${form.date}T${form.check_out}`).toISOString() : undefined
    const workHours = checkIn && checkOut ? (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000 : undefined
    await attendanceApi.upsert({ ...form, check_in: checkIn, check_out: checkOut, work_hours: workHours, status: form.status as import('@/types').AttendanceStatus })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    total: records.length,
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Topbar
        title="الحضور والانصراف"
        subtitle={new Date(dateFilter).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)} size="sm">تسجيل حضور</Button>
        }
      />

      <div className="p-6 space-y-5">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'حاضر', value: summary.present, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4', bar: 'bg-green-400' },
            { label: 'غائب', value: summary.absent, icon: XCircle, color: '#ef4444', bg: '#fef2f2', bar: 'bg-red-400' },
            { label: 'متأخر', value: summary.late, icon: Clock, color: '#f59e0b', bg: '#fffbeb', bar: 'bg-yellow-400' },
            { label: 'إجمالي السجلات', value: summary.total, icon: CheckCircle, color: '#875bf7', bg: '#f3eeff', bar: 'bg-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-600">التاريخ:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#875bf7] focus:bg-white transition"
          />
          <button onClick={() => setDateFilter(today)} className="text-xs text-[#875bf7] hover:underline">اليوم</button>
          <div className="mr-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <Download className="w-3.5 h-3.5" /> تصدير
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['الموظف', 'التاريخ', 'وقت الحضور', 'وقت الانصراف', 'ساعات العمل', 'الحالة', 'ملاحظات'].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-7 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-14 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">لا توجد سجلات لهذا اليوم</p>
                  </td></tr>
                ) : records.map(r => (
                  <tr key={r.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#f3eeff] rounded-full flex items-center justify-center text-[#875bf7] text-xs font-bold">
                          {r.employee?.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.employee?.first_name} {r.employee?.last_name}</p>
                          <p className="text-xs text-gray-400">{r.employee?.employee_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{r.date}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-700">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-700">
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {r.work_hours ? (
                        <span className="text-sm font-semibold text-gray-900">{r.work_hours.toFixed(1)} <span className="text-xs font-normal text-gray-400">ساعة</span></span>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تسجيل حضور" size="md">
        <div className="space-y-4">
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="وقت الحضور" type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
            <Input label="وقت الانصراف" type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'present', label: 'حاضر' }, { value: 'absent', label: 'غائب' },
              { value: 'late', label: 'متأخر' }, { value: 'half_day', label: 'نصف يوم' },
            ]} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
