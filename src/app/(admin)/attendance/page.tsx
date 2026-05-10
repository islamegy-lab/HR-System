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

const S = {
  page: { minHeight: '100vh', background: '#f1f5f9' },
  body: { padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 16 },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  th: { padding: '11px 16px', textAlign: 'right' as const, fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
  td: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc' },
}

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
  useEffect(() => { employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) }) }, [])

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
    <div style={S.page}>
      <Topbar title="الحضور والانصراف"
        subtitle={new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>تسجيل حضور</Button>} />

      <div style={S.body}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'حاضر',  value: present, icon: CheckCircle, bg: '#f0fdf4', ic: '#16a34a', border: '#bbf7d0' },
            { label: 'غائب',  value: absent,  icon: XCircle,     bg: '#fff1f2', ic: '#e11d48', border: '#fecdd3' },
            { label: 'متأخر', value: late,    icon: Clock,       bg: '#fffbeb', ic: '#d97706', border: '#fde68a' },
          ].map((s, i) => (
            <div key={s.label} className="card slide-up" style={{ padding: 20, animationDelay: `${i*60}ms`, border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={22} color={s.ic} />
                </div>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 3 }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Filter */}
        <div style={{ ...S.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>التاريخ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button onClick={() => setDate(today)} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer' }}>
            اليوم
          </button>
        </div>

        {/* Table */}
        <div style={S.card} className="slide-up">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 99, background: '#2563eb' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>سجلات الحضور</span>
            <span style={{ marginRight: 'auto', fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{records.length} سجل</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['الموظف', 'التاريخ', 'وقت الحضور', 'وقت الانصراف', 'ساعات العمل', 'الحالة', 'ملاحظات'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : records.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <Clock size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <p style={{ fontSize: 13 }}>لا توجد سجلات لهذا اليوم</p>
                    </div>
                  </td></tr>
                ) : records.map(r => (
                  <tr key={r.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {r.employee?.first_name?.[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.employee?.first_name} {r.employee?.last_name}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{r.employee?.employee_number}</p>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>{r.date}</td>
                    <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>{r.check_in ? new Date(r.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>{r.check_out ? new Date(r.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={S.td}>{r.work_hours ? <span style={{ fontWeight: 700, color: '#2563eb' }}>{r.work_hours.toFixed(1)}<span style={{ fontSize: 11, color: '#94a3b8', marginRight: 2 }}>س</span></span> : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={S.td}><span className={`badge ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span></td>
                    <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تسجيل حضور" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="وقت الحضور" type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
            <Input label="وقت الانصراف" type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={[{ value: 'present', label: 'حاضر' }, { value: 'absent', label: 'غائب' }, { value: 'late', label: 'متأخر' }, { value: 'half_day', label: 'نصف يوم' }]} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
