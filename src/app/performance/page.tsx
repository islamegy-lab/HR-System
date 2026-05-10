'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Star } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
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
  const [form, setForm] = useState({
    employee_id: '', review_date: '', review_period: '',
    goals_score: 0, skills_score: 0, behavior_score: 0, comments: '', status: 'draft'
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('performance_reviews')
      .select('*, employee:employees(id,first_name,last_name,photo_url,job_position:job_positions(title_ar))')
      .order('created_at', { ascending: false })
    if (data) setReviews(data as PerformanceReview[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const score = ((form.goals_score + form.skills_score + form.behavior_score) / 3)
    await supabase.from('performance_reviews').insert({ ...form, score })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const ScoreBar = ({ value, max = 10 }: { value: number; max?: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-6">{value}</span>
    </div>
  )

  return (
    <div>
      <Topbar title="تقييم الأداء" subtitle={`${reviews.length} تقييم`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>تقييم جديد</Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد تقييمات</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviews.map(review => (
              <Card key={review.id} className="hover:shadow-md transition-shadow p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                    {review.employee?.first_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{review.employee?.first_name} {review.employee?.last_name}</p>
                    <p className="text-xs text-gray-500">{(review.employee as any)?.job_position?.title_ar}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-900">{review.score?.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>الأهداف</span></div>
                    <ScoreBar value={review.goals_score || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>المهارات</span></div>
                    <ScoreBar value={review.skills_score || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>السلوك</span></div>
                    <ScoreBar value={review.behavior_score || 0} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{review.review_period} · {formatDate(review.review_date)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(review.status)}`}>
                    {getStatusLabel(review.status)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="تقييم أداء جديد" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الموظف *"
              value={form.employee_id}
              onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))}
            />
            <Input label="تاريخ التقييم *" type="date" value={form.review_date} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))} />
            <Input label="الفترة (مثال: Q1 2025)" value={form.review_period} onChange={e => setForm(f => ({ ...f, review_period: e.target.value }))} />
            <Select
              label="الحالة"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'draft', label: 'مسودة' }, { value: 'confirmed', label: 'مؤكد' }]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'goals_score', label: 'تقييم الأهداف (0-10)' },
              { key: 'skills_score', label: 'تقييم المهارات (0-10)' },
              { key: 'behavior_score', label: 'تقييم السلوك (0-10)' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                <input
                  type="range" min={0} max={10} step={0.5}
                  value={(form as any)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: Number(e.target.value) }))}
                  className="w-full accent-purple-600"
                />
                <p className="text-center text-sm font-bold text-purple-600">{(form as any)[field.key]}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">التعليقات</label>
            <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>حفظ التقييم</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
