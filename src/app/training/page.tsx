'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Calendar, MapPin, User, Users, GraduationCap } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
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

  const statusStyle: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="التدريب والتطوير" subtitle={`${programs.length} برنامج`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>برنامج جديد</Button>} />

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <GraduationCap size={40} className="mb-3 opacity-20" />
            <p className="text-sm">لا توجد برامج تدريبية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programs.map(prog => (
              <div key={prog.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex-1 ml-2">{prog.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusStyle[prog.status] || 'bg-gray-100 text-gray-600'}`}>
                    {getStatusLabel(prog.status)}
                  </span>
                </div>
                {prog.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{prog.description}</p>}
                <div className="space-y-1.5 mb-4">
                  {prog.trainer && <div className="flex items-center gap-2 text-xs text-gray-500"><User size={12} /> {prog.trainer}</div>}
                  {prog.start_date && <div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={12} /> {formatDate(prog.start_date)}{prog.end_date ? ` — ${formatDate(prog.end_date)}` : ''}</div>}
                  {prog.location && <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={12} /> {prog.location}</div>}
                  {prog.max_participants && <div className="flex items-center gap-2 text-xs text-gray-500"><Users size={12} /> الحد الأقصى: {prog.max_participants} مشارك</div>}
                </div>
                <button onClick={() => setShowEnroll(prog.id)}
                  className="w-full py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition border border-indigo-200">
                  تسجيل موظف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="برنامج تدريبي جديد" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="عنوان البرنامج *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input label="المدرب" value={form.trainer} onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))} />
            <Input label="تاريخ البداية" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="تاريخ النهاية" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            <Input label="الموقع" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Input label="الحد الأقصى للمشاركين" type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: Number(e.target.value) }))} />
            <Select label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'planned', label: 'مخطط' }, { value: 'ongoing', label: 'جاري' }, { value: 'completed', label: 'مكتمل' }]} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">الوصف</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إنشاء البرنامج</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showEnroll} onClose={() => setShowEnroll(null)} title="تسجيل موظف في البرنامج" size="sm">
        <div className="space-y-4">
          <Select label="اختر الموظف" value={enrollEmpId} onChange={e => setEnrollEmpId(e.target.value)}
            options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowEnroll(null)}>إلغاء</Button>
            <Button onClick={handleEnroll}>تسجيل</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
