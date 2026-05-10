'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Star, BarChart3 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { pageStyle, bodyStyle, cardStyle, EmptyState, Avatar } from '@/components/ui/PageComponents'
import { supabase } from '@/lib/supabase'
import { employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { PerformanceReview, Employee } from '@/types'

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ employee_id: '', review_date: '', review_period: '', goals_score: 0, skills_score: 0, behavior_score: 0, comments: '', status: 'draft' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('performance_reviews')
      .select('*, employee:employees(id,first_name,last_name,photo_url,job_position:job_positions(title_ar))')
      .order('created_at', { ascending: false })
    if (data) setReviews(data as PerformanceReview[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) }) }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('performance_reviews').insert({ ...form, score: (form.goals_score + form.skills_score + form.behavior_score) / 3 })
    setSaving(false); setShowForm(false); load()
  }

  const scoreColor = (v: number) => v >= 8 ? '#16a34a' : v >= 5 ? '#2563eb' : '#e11d48'

  return (
    <div style={pageStyle}>
      <Topbar title="تقييم الأداء" subtitle={`${reviews.length} تقييم`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>تقييم جديد</Button>} />

      <div style={bodyStyle}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={cardStyle}><EmptyState icon={BarChart3} text="لا توجد تقييمات" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {reviews.map((r, i) => (
              <div key={r.id} className="card slide-up" style={{ padding: 20, animationDelay: `${i * 50}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Avatar name={r.employee?.first_name || '؟'} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.employee?.first_name} {r.employee?.last_name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(r.employee as any)?.job_position?.title_ar}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fffbeb', padding: '4px 10px', borderRadius: 8, border: '1px solid #fde68a', flexShrink: 0 }}>
                    <Star size={13} color="#d97706" fill="#d97706" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{r.score?.toFixed(1)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {[['الأهداف', r.goals_score], ['المهارات', r.skills_score], ['السلوك', r.behavior_score]].map(([label, val]) => (
                    <div key={label as string}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(val as number) }}>{val}/10</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((val as number) / 10) * 100}%`, background: scoreColor(val as number), borderRadius: 99, transition: 'width 0.7s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.review_period} · {formatDate(r.review_date)}</span>
                  <span className={`badge ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تقييم أداء جديد" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
            <Input label="تاريخ التقييم *" type="date" value={form.review_date} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))} />
            <Input label="الفترة (مثال: Q1 2025)" value={form.review_period} onChange={e => setForm(f => ({ ...f, review_period: e.target.value }))} />
            <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'draft', label: 'مسودة' }, { value: 'confirmed', label: 'مؤكد' }]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[{ key: 'goals_score', label: 'الأهداف' }, { key: 'skills_score', label: 'المهارات' }, { key: 'behavior_score', label: 'السلوك' }].map(f => (
              <div key={f.key} style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 10 }}>{f.label} (0-10)</label>
                <input type="range" min={0} max={10} step={0.5} value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#2563eb' }} />
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 6 }}>{(form as any)[f.key]}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>التعليقات</label>
            <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ التقييم</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
