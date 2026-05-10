'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { employeesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Employee, Department, JobPosition, ContractType, EmployeeStatus } from '@/types'

interface Props {
  employee?: Employee | null
  onSave: () => void
  onCancel: () => void
}

interface FormState {
  first_name: string
  last_name: string
  email: string
  employee_number: string
  hire_date: string
  phone: string
  national_id: string
  date_of_birth: string
  gender: string
  nationality: string
  department_id: string
  job_position_id: string
  contract_type: ContractType
  status: EmployeeStatus
  basic_salary: string
  address: string
}

export function EmployeeForm({ employee, onSave, onCancel }: Props) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<JobPosition[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const [form, setForm] = useState<FormState>({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    employee_number: employee?.employee_number || '',
    hire_date: employee?.hire_date || '',
    phone: employee?.phone || '',
    national_id: employee?.national_id || '',
    date_of_birth: employee?.date_of_birth || '',
    gender: employee?.gender || '',
    nationality: employee?.nationality || '',
    department_id: employee?.department_id || '',
    job_position_id: employee?.job_position_id || '',
    contract_type: employee?.contract_type || 'full_time',
    status: employee?.status || 'active',
    basic_salary: employee?.basic_salary?.toString() || '',
    address: employee?.address || '',
  })

  useEffect(() => {
    Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('job_positions').select('*'),
    ]).then(([depts, pos]) => {
      if (depts.data) setDepartments(depts.data)
      if (pos.data) setPositions(pos.data)
    })
  }, [])

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.first_name) errs.first_name = 'مطلوب'
    if (!form.last_name) errs.last_name = 'مطلوب'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'بريد غير صحيح'
    if (!form.employee_number) errs.employee_number = 'مطلوب'
    if (!form.hire_date) errs.hire_date = 'مطلوب'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      basic_salary: form.basic_salary ? Number(form.basic_salary) : undefined,
    }
    if (employee) {
      await employeesApi.update(employee.id, payload)
    } else {
      await employeesApi.create(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="الاسم الأول *" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
        <Input label="اسم العائلة *" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
        <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="الرقم الوظيفي *" value={form.employee_number} onChange={set('employee_number')} error={errors.employee_number} />
        <Input label="رقم الهاتف" value={form.phone} onChange={set('phone')} />
        <Input label="رقم الهوية" value={form.national_id} onChange={set('national_id')} />
        <Input label="تاريخ الميلاد" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
        <Input label="تاريخ التعيين *" type="date" value={form.hire_date} onChange={set('hire_date')} error={errors.hire_date} />
        <Select label="الجنس" value={form.gender} onChange={set('gender')}
          options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]} />
        <Input label="الجنسية" value={form.nationality} onChange={set('nationality')} />
        <Select label="القسم" value={form.department_id} onChange={set('department_id')}
          options={departments.map(d => ({ value: d.id, label: d.name_ar || d.name }))} />
        <Select label="المسمى الوظيفي" value={form.job_position_id} onChange={set('job_position_id')}
          options={positions.map(p => ({ value: p.id, label: p.title_ar || p.title }))} />
        <Select label="نوع العقد" value={form.contract_type} onChange={set('contract_type')}
          options={[
            { value: 'full_time', label: 'دوام كامل' },
            { value: 'part_time', label: 'دوام جزئي' },
            { value: 'contract', label: 'عقد' },
            { value: 'intern', label: 'متدرب' },
          ]} />
        <Select label="الحالة" value={form.status} onChange={set('status')}
          options={[
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
            { value: 'on_leave', label: 'في إجازة' },
          ]} />
        <Input label="الراتب الأساسي (ر.س)" type="number" value={form.basic_salary} onChange={set('basic_salary')} />
      </div>
      <Input label="العنوان" value={form.address} onChange={set('address')} />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" loading={saving}>{employee ? 'حفظ التعديلات' : 'إضافة الموظف'}</Button>
      </div>
    </form>
  )
}
