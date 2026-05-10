'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Calendar, MapPin, User, Users, GraduationCap } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { pageStyle, bodyStyle, cardStyle, EmptyState } from '@/components/ui/PageComponents'
import { trainingApi, employeesApi } from '@/lib/api'
import { getStatusLabel, formatDate } from '@/lib/utils'
import type { TrainingProgram, Employee } from '@/types'

export default function TrainingPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showEnroll, setShowEnroll] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [enrollEmpId, setEnrollEmpId] = useState('')
  const [form, setForm] = useState({ title: '', description: '', trainer: '', start_date: '', end_date: '', location: '', max_participants: 20, status: 'planned' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await trainingApi.getAll()
    if (data) setPrograms(data as TrainingProgram[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) }) }, [])

  const handleSave = async () => { setSaving(true); await trainingApi.create(form); setSaving(false); setShowForm(false); load() }
  const handleEnroll = async () => { if (!enrollEmpId || !showEnroll) return; await trainingApi.enroll(showEnroll, enrollEmpId); setShowEnroll(null); setEnrollEmpId('') }

  const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
    planned:   { label: 'مخطط',   bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    ongoing:   { label: 'جاري',   bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    completed: { label: 'مكتمل',  bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  }

  return (
    <div style={pageStyle}>
      <Topbar title="التدريب والتطوير" subtitle={`${programs.length} برنامج`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>برنامج جديد</Button>} />

      <div style={bodyStyle}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 220, borderRadius: 16 }} />)}
          </div>
        ) : programs.length === 0 ? (
          <div style={cardStyle}><EmptyState icon={GraduationCap} text="لا توجد برامج تدريبية" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {programs.map((prog, i) => {
              const s = statusMap[prog.status] || statusMap.planned
              return (
                <div key={prog.id} className="card slide-up" style={{ overflow: 'hidden', animationDelay: `${i * 50}ms` }}>
                  <div style={{ height: 4, background: s.color }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GraduationCap size={18} color={s.color} />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', flex: 1 }}>{prog.title}</h3>
                      </div>
                      <span style={{ fontSize: 11, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
                    </div>
                    {prog.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prog.description}</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {prog.trainer && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}><User size={12} color="#94a3b8" /> {prog.trainer}</div>}
                      {prog.start_date && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}><Calendar size={12} color="#94a3b8" /> {formatDate(prog.start_date)}{prog.end_date ? ` — ${formatDate(prog.end_date)}` : ''}</div>}
                      {prog.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}><MapPin size={12} color="#94a3b8" /> {prog.location}</div>}
                      {prog.max_participants && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}><Users size={12} color="#94a3b8" /> الحد الأقصى: {prog.max_participants} مشارك</div>}
                    </div>
                    <button onClick={() => setShowEnroll(prog.id)}
                      style={{ width: '100%', padding: '9px 0', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      تسجيل موظف
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="برنامج تدريبي جديد" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="عنوان البرنامج *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input label="المدرب" value={form.trainer} onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))} />
            <Input label="تاريخ البداية" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="تاريخ النهاية" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            <Input label="الموقع" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Input label="الحد الأقصى للمشاركين" type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: Number(e.target.value) }))} />
            <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'planned', label: 'مخطط' }, { value: 'ongoing', label: 'جاري' }, { value: 'completed', label: 'مكتمل' }]} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>الوصف</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إنشاء البرنامج</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showEnroll} onClose={() => setShowEnroll(null)} title="تسجيل موظف في البرنامج" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="اختر الموظف" value={enrollEmpId} onChange={e => setEnrollEmpId(e.target.value)}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowEnroll(null)}>إلغاء</Button>
            <Button onClick={handleEnroll}>تسجيل</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
