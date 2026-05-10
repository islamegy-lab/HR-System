'use client'
import { useEffect, useState } from 'react'
import { Plus, CalendarDays, Check, X } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'
import { leavesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { LeaveRequest, LeaveType } from '@/types'

const n = (v: number) => v.toLocaleString('ar-SA')

export default function EmployeeLeavesPage() {
  const { employee } = useEmployeeAuth()
  const [leaves, setLeaves]   = useState<LeaveRequest[]>([])
  const [types, setTypes]     = useState<LeaveType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' })

  const load = async () => {
    if (!employee) return
    const [lv, tp] = await Promise.all([
      supabase.from('leave_requests').select('*, leave_type:leave_types(name_ar)').eq('employee_id', employee.id).order('created_at', { ascending: false }),
      leavesApi.getTypes(),
    ])
    if (lv.data) setLeaves(lv.data as LeaveRequest[])
    if (tp.data) setTypes(tp.data)
  }

  useEffect(() => { load() }, [employee])

  const calcDays = (s: string, e: string) => !s || !e ? 0 : Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1

  const handleSubmit = async () => {
    if (!employee || !form.leave_type_id || !form.start_date || !form.end_date) return
    setSaving(true)
    await leavesApi.create({ ...form, employee_id: employee.id, days_count: calcDays(form.start_date, form.end_date), status: 'pending' })
    setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' })
    setShowForm(false); setSaving(false); load()
  }

  const pending  = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length
  const days     = leaves.filter(l => l.status === 'approved').reduce((s, l) => s + l.days_count, 0)

  const inp = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Cairo, sans-serif' }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'معلقة',       val: n(pending),  bg: '#fffbeb', ic: '#d97706' },
          { label: 'موافق عليها', val: n(approved), bg: '#f0fdf4', ic: '#16a34a' },
          { label: 'أيام مأخوذة', val: n(days),     bg: '#eff6ff', ic: '#2563eb' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 12px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.ic, margin: 0 }}>{s.val}</p>
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* New Request Button */}
      <button onClick={() => setShowForm(s => !s)} style={{
        padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 700,
        background: showForm ? '#f1f5f9' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
        color: showForm ? '#475569' : '#fff', border: showForm ? '1px solid #e2e8f0' : 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'Cairo, sans-serif', boxShadow: showForm ? 'none' : '0 4px 14px rgba(37,99,235,0.3)'
      }}>
        {showForm ? <X size={16} /> : <Plus size={16} />}
        {showForm ? 'إلغاء' : 'طلب إجازة جديد'}
      </button>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>طلب إجازة جديد</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>نوع الإجازة *</label>
            <select value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))} style={inp}>
              <option value="">— اختر —</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name_ar}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>من تاريخ *</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>إلى تاريخ *</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inp} />
            </div>
          </div>

          {form.start_date && form.end_date && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>{n(calcDays(form.start_date, form.end_date))}</span>
              <span style={{ fontSize: 13, color: '#3b82f6', marginRight: 6 }}>أيام</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>السبب</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              style={{ ...inp, resize: 'none' }} placeholder="اختياري..." />
          </div>

          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: saving ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
            color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Cairo, sans-serif'
          }}>
            {saving ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>طلباتي ({n(leaves.length)})</span>
        </div>
        {leaves.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <CalendarDays size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: 13, margin: 0 }}>لا توجد طلبات بعد</p>
          </div>
        ) : leaves.map((l, i) => (
          <div key={l.id} style={{ padding: '14px 16px', borderBottom: i < leaves.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{(l as any).leave_type?.name_ar}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>
                  {formatDate(l.start_date)} — {formatDate(l.end_date)} · {n(l.days_count)} يوم
                </p>
              </div>
              <span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
            </div>
            {l.reason && <p style={{ fontSize: 12, color: '#64748b', margin: 0, background: '#f8fafc', padding: '6px 10px', borderRadius: 8 }}>{l.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
