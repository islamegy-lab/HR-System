'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Check, X, CalendarDays } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { CardHeader, StatCard, Avatar, EmptyState, TabBar, pageStyle, bodyStyle, cardStyle, thStyle, tdStyle } from '@/components/ui/PageComponents'
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
    <div style={pageStyle}>
      <Topbar title="الإجازات" subtitle={`${leaves.length} طلب`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>طلب إجازة</Button>} />

      <div style={bodyStyle}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <StatCard label="قيد الانتظار" value={pending}  icon={CalendarDays} bg="#fffbeb" ic="#d97706" border="#fde68a" delay={0} />
          <StatCard label="موافق عليها"  value={approved} icon={CalendarDays} bg="#f0fdf4" ic="#16a34a" border="#bbf7d0" delay={60} />
          <StatCard label="مرفوضة"       value={rejected} icon={CalendarDays} bg="#fff1f2" ic="#e11d48" border="#fecdd3" delay={120} />
        </div>

        <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <TabBar
            tabs={TABS.map(t => ({ ...t, count: t.value === 'pending' ? pending : undefined }))}
            value={tab} onChange={setTab}
          />
        </div>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="قائمة طلبات الإجازة" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['الموظف', 'نوع الإجازة', 'من', 'إلى', 'الأيام', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : leaves.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={CalendarDays} text="لا توجد طلبات" /></td></tr>
                ) : leaves.map(l => (
                  <tr key={l.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={l.employee?.first_name || '؟'} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.employee?.first_name} {l.employee?.last_name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{l.leave_type?.name_ar}</span>
                    </td>
                    <td style={tdStyle}>{formatDate(l.start_date)}</td>
                    <td style={tdStyle}>{formatDate(l.end_date)}</td>
                    <td style={tdStyle}><span style={{ fontWeight: 700, color: '#2563eb' }}>{l.days_count}</span><span style={{ fontSize: 11, color: '#94a3b8', marginRight: 3 }}>يوم</span></td>
                    <td style={{ ...tdStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>{l.reason || '—'}</td>
                    <td style={tdStyle}><span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span></td>
                    <td style={tdStyle}>
                      {l.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => leavesApi.updateStatus(l.id, 'approved').then(load)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Check size={11} /> موافقة
                          </button>
                          <button onClick={() => leavesApi.updateStatus(l.id, 'rejected').then(load)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
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
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="طلب إجازة جديد" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Select label="نوع الإجازة *" value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
            options={types.map(t => ({ value: t.id, label: t.name_ar || t.name }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="من تاريخ *" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="إلى تاريخ *" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          {form.start_date && form.end_date && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#2563eb' }}>{calcDays(form.start_date, form.end_date)}</span>
              <span style={{ fontSize: 14, color: '#3b82f6', marginRight: 6 }}>أيام</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>السبب</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إرسال الطلب</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
