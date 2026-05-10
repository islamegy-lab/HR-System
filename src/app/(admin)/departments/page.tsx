'use client'
import { useEffect, useState } from 'react'
import { Plus, Building2, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { pageStyle, bodyStyle, cardStyle } from '@/components/ui/PageComponents'
import { supabase } from '@/lib/supabase'
import type { Department } from '@/types'

const COLORS = ['#2563eb','#7c3aed','#16a34a','#e11d48','#d97706','#0d9488','#ea580c','#0284c7']

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<(Department & { employees_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', name_ar: '' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('departments').select('*, employees:employees(count)')
    if (data) setDepartments(data.map((d: any) => ({ ...d, employees_count: d.employees?.[0]?.count || 0 })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('departments').insert(form)
    setSaving(false); setShowForm(false); setForm({ name: '', name_ar: '' }); load()
  }

  return (
    <div style={pageStyle}>
      <Topbar title="الأقسام" subtitle={`${departments.length} قسم`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>إضافة قسم</Button>} />

      <div style={bodyStyle}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {departments.map((dept, i) => {
                const color = COLORS[i % COLORS.length]
                const pct = Math.min((dept.employees_count / 20) * 100, 100)
                return (
                  <div key={dept.id} className="card slide-up" style={{ padding: 20, animationDelay: `${i * 50}ms`, borderTop: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={22} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.name_ar || dept.name}</h3>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{dept.name}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc', padding: '5px 10px', borderRadius: 8, border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <Users size={12} color="#64748b" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{dept.employees_count}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>نسبة الإشغال</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}>{dept.employees_count}/20</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إضافة قسم جديد" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="اسم القسم (عربي)" value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
          <Input label="اسم القسم (إنجليزي)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
