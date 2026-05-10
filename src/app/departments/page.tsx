'use client'
import { useEffect, useState } from 'react'
import { Plus, Building2, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
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
    const { data } = await supabase
      .from('departments')
      .select('*, employees:employees(count)')
    if (data) {
      setDepartments(data.map((d: any) => ({ ...d, employees_count: d.employees?.[0]?.count || 0 })))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('departments').insert(form)
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', name_ar: '' })
    load()
  }

  return (
    <div>
      <Topbar title="الأقسام" subtitle={`${departments.length} قسم`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>إضافة قسم</Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map(dept => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{dept.name_ar || dept.name}</h3>
                    <p className="text-xs text-gray-500">{dept.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{dept.employees_count}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إضافة قسم جديد" size="sm">
        <div className="space-y-4">
          <Input label="اسم القسم (عربي)" value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
          <Input label="اسم القسم (إنجليزي)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
