'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { leavesApi, employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { LeaveRequest, LeaveType, Employee } from '@/types'

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

  const calcDays = (start: string, end: string) => {
    if (!start || !end) return 0
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
  }

  const handleSave = async () => {
    setSaving(true)
    await leavesApi.create({ ...form, days_count: calcDays(form.start_date, form.end_date), status: 'pending' })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const handleApprove = async (id: string) => {
    await leavesApi.updateStatus(id, 'approved')
    load()
  }

  const handleReject = async (id: string) => {
    await leavesApi.updateStatus(id, 'rejected')
    load()
  }

  const tabs = [
    { value: '', label: 'الكل' },
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'approved', label: 'موافق عليها' },
    { value: 'rejected', label: 'مرفوضة' },
  ]

  return (
    <div>
      <Topbar title="الإجازات" subtitle={`${leaves.length} طلب`} />
      <div className="p-6 space-y-4">

        {/* Tabs + Action */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === tab.value ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>طلب إجازة</Button>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد طلبات</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {leaves.map(leave => (
              <Card key={leave.id} className="hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                        {leave.employee?.first_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{leave.employee?.first_name} {leave.employee?.last_name}</p>
                        <p className="text-xs text-gray-500">{leave.leave_type?.name_ar}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(leave.status)}`}>
                      {getStatusLabel(leave.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">من</p>
                      <p className="text-xs font-medium">{formatDate(leave.start_date)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-purple-500">الأيام</p>
                      <p className="text-sm font-bold text-purple-700">{leave.days_count}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">إلى</p>
                      <p className="text-xs font-medium">{formatDate(leave.end_date)}</p>
                    </div>
                  </div>

                  {leave.reason && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{leave.reason}</p>}

                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                        <Check className="w-3.5 h-3.5" /> موافقة
                      </button>
                      <button onClick={() => handleReject(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                        <X className="w-3.5 h-3.5" /> رفض
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="طلب إجازة جديد" size="md">
        <div className="space-y-4">
          <Select
            label="الموظف *"
            value={form.employee_id}
            onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))}
          />
          <Select
            label="نوع الإجازة *"
            value={form.leave_type_id}
            onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
            options={leaveTypes.map(t => ({ value: t.id, label: t.name_ar || t.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="من تاريخ *" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="إلى تاريخ *" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          {form.start_date && form.end_date && (
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <span className="text-purple-700 font-semibold">{calcDays(form.start_date, form.end_date)} أيام</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">السبب</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
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
