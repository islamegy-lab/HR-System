'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Star, BarChart3 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
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

  const ScoreBar = ({ value }: { value: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-5 text-left">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="تقييم الأداء" subtitle={`${reviews.length} تقييم`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>تقييم جديد</Button>} />

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BarChart3 size={40} className="mb-3 opacity-20" />
            <p className="text-sm">لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0">{r.employee?.first_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{r.employee?.first_name} {r.employee?.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{(r.employee as any)?.job_position?.title_ar}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-900 text-sm">{r.score?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {[['الأهداف', r.goals_score], ['المهارات', r.skills_score], ['السلوك', r.behavior_score]].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                      <ScoreBar value={(val as number) || 0} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{r.review_period} · {formatDate(r.review_date)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تقييم أداء جديد" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
            <Input label="تاريخ التقييم *" type="date" value={form.review_date} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))} />
            <Input label="الفترة (مثال: Q1 2025)" value={form.review_period} onChange={e => setForm(f => ({ ...f, review_period: e.target.value }))} />
            <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'draft', label: 'مسودة' }, { value: 'confirmed', label: 'مؤكد' }]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'goals_score', label: 'الأهداف' }, { key: 'skills_score', label: 'المهارات' }, { key: 'behavior_score', label: 'السلوك' }].map(f => (
              <div key={f.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 block mb-2">{f.label} (0-10)</label>
                <input type="range" min={0} max={10} step={0.5} value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  className="w-full accent-indigo-600" />
                <p className="text-center text-lg font-bold text-indigo-600 mt-1">{(form as any)[f.key]}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">التعليقات</label>
            <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ التقييم</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
