'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
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
    let workHours
    if (checkIn && checkOut) {
      workHours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000
    }
    await attendanceApi.upsert({ ...form, check_in: checkIn, check_out: checkOut, work_hours: workHours, status: form.status as import('@/types').AttendanceStatus })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  }

  return (
    <div>
      <Topbar title="الحضور والانصراف" subtitle={`تاريخ: ${new Date(dateFilter).toLocaleDateString('ar-SA')}`} />
      <div className="p-6 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'حاضر', value: summary.present, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: 'غائب', value: summary.absent, icon: XCircle, color: 'text-red-600 bg-red-50' },
            { label: 'متأخر', value: summary.late, icon: Clock, color: 'text-orange-600 bg-orange-50' },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters + Actions */}
        <div className="flex gap-3 items-center justify-between">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
            تسجيل حضور
          </Button>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['الموظف', 'التاريخ', 'وقت الحضور', 'وقت الانصراف', 'ساعات العمل', 'الحالة', 'ملاحظات'].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">لا توجد سجلات لهذا اليوم</td></tr>
                ) : records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">
                          {r.employee?.first_name?.[0]}
                        </div>
                        <span className="text-sm font-medium">{r.employee?.first_name} {r.employee?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{r.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {r.work_hours ? `${r.work_hours.toFixed(1)} ساعة` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تسجيل حضور" size="md">
        <div className="space-y-4">
          <Select
            label="الموظف *"
            value={form.employee_id}
            onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))}
          />
          <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="وقت الحضور" type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
            <Input label="وقت الانصراف" type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <Select
            label="الحالة"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'present', label: 'حاضر' },
              { value: 'absent', label: 'غائب' },
              { value: 'late', label: 'متأخر' },
              { value: 'half_day', label: 'نصف يوم' },
              { value: 'holiday', label: 'إجازة' },
            ]}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
