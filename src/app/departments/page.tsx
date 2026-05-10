'use client'
import { useEffect, useState } from 'react'
import { Plus, Building2, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import type { Department } from '@/types'

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
    <div className="min-h-screen bg-gray-50">
      <Topbar title="الأقسام" subtitle={`${departments.length} قسم`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>إضافة قسم</Button>} />

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={22} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{dept.name_ar || dept.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{dept.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">
                    <Users size={13} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{dept.employees_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إضافة قسم جديد" size="sm">
        <div className="space-y-4">
          <Input label="اسم القسم (عربي)" value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
          <Input label="اسم القسم (إنجليزي)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
