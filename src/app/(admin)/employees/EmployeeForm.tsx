'use client'
import { useEffect, useState, useMemo } from 'react'
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
  email: string; password: string
  first_name: string; last_name: string; employee_number: string
  phone: string; national_id: string; date_of_birth: string
  gender: string; nationality: string; address: string
  department_id: string; job_position_id: string
  hire_date: string; contract_type: ContractType; status: EmployeeStatus
  role: string
  basic_salary: string; housing_allowance: string
  transport_allowance: string; other_allowances: string
}

const ROLES = [
  {
    value: 'employee',
    label: 'موظف',
    sub: 'يدخل بوابة الموظف فقط',
    icon: '👤',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    value: 'manager',
    label: 'مدير قسم',
    sub: 'يدخل لوحة الإدارة',
    icon: '💼',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#ddd6fe',
  },
  {
    value: 'hr_manager',
    label: 'مدير موارد بشرية',
    sub: 'صلاحيات إدارية كاملة',
    icon: '👥',
    color: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
  },
  {
    value: 'admin',
    label: 'مدير النظام',
    sub: 'وصول كامل + الإعدادات',
    icon: '🛡️',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
]

const TABS = ['بيانات الدخول', 'البيانات الشخصية', 'البيانات الوظيفية', 'الراتب والبدلات']

export function EmployeeForm({ employee, onSave, onCancel }: Props) {
  const [tab, setTab]             = useState(employee ? 1 : 0)
  const [departments, setDepts]   = useState<Department[]>([])
  const [allPositions, setAllPos] = useState<JobPosition[]>([])
  const [saving, setSaving]       = useState(false)
  const [apiError, setApiError]   = useState('')
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({})

  const [form, setForm] = useState<FormState>({
    email: employee?.email || '', password: '',
    first_name: employee?.first_name || '', last_name: employee?.last_name || '',
    employee_number: employee?.employee_number || '',
    phone: employee?.phone || '', national_id: employee?.national_id || '',
    date_of_birth: employee?.date_of_birth || '', gender: employee?.gender || '',
    nationality: employee?.nationality || '', address: employee?.address || '',
    department_id: employee?.department_id || '',
    job_position_id: employee?.job_position_id || '',
    hire_date: employee?.hire_date || '',
    contract_type: employee?.contract_type || 'full_time',
    status: employee?.status || 'active',
    role: (employee as any)?.role || 'employee',
    basic_salary: employee?.basic_salary?.toString() || '',
    housing_allowance: '', transport_allowance: '', other_allowances: '',
  })

  useEffect(() => {
    Promise.all([
      supabase.from('departments').select('*').order('name_ar'),
      supabase.from('job_positions').select('*').order('title_ar'),
    ]).then(([d, p]) => {
      if (d.data) setDepts(d.data)
      if (p.data) setAllPos(p.data)
    })
    if (employee) {
      supabase.from('payroll').select('housing_allowance,transport_allowance,other_allowances')
        .eq('employee_id', employee.id).order('created_at', { ascending: false }).limit(1).single()
        .then(({ data }) => {
          if (data) setForm(f => ({
            ...f,
            housing_allowance:   data.housing_allowance?.toString()   || '',
            transport_allowance: data.transport_allowance?.toString() || '',
            other_allowances:    data.other_allowances?.toString()    || '',
          }))
        })
    }
  }, [employee])

  const filteredPositions = useMemo(() =>
    form.department_id ? allPositions.filter(p => p.department_id === form.department_id) : allPositions
  , [allPositions, form.department_id])

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const totalSalary = useMemo(() =>
    (Number(form.basic_salary) || 0) + (Number(form.housing_allowance) || 0) +
    (Number(form.transport_allowance) || 0) + (Number(form.other_allowances) || 0)
  , [form.basic_salary, form.housing_allowance, form.transport_allowance, form.other_allowances])

  const validate = () => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!employee && !form.email)    errs.email    = 'مطلوب'
    if (!employee && !form.password) errs.password = 'مطلوب'
    if (!employee && form.password && form.password.length < 6) errs.password = '6 أحرف على الأقل'
    if (!form.first_name)      errs.first_name      = 'مطلوب'
    if (!form.last_name)       errs.last_name       = 'مطلوب'
    if (!form.employee_number) errs.employee_number = 'مطلوب'
    if (!form.hire_date)       errs.hire_date       = 'مطلوب'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      if (errors.email || errors.password) { setTab(0); return }
      if (errors.first_name || errors.last_name || errors.employee_number) { setTab(1); return }
      if (errors.hire_date) { setTab(2); return }
      return
    }
    setSaving(true); setApiError('')
    const payload: any = {
      ...form,
      basic_salary:        form.basic_salary        ? Number(form.basic_salary)        : undefined,
      housing_allowance:   form.housing_allowance   ? Number(form.housing_allowance)   : undefined,
      transport_allowance: form.transport_allowance ? Number(form.transport_allowance) : undefined,
      other_allowances:    form.other_allowances    ? Number(form.other_allowances)    : undefined,
    }
    if (employee) {
      const { error } = await employeesApi.update(employee.id, payload)
      if (error) { setApiError(error.message); setSaving(false); return }
    } else {
      const res = await fetch('/api/auth/create-employee', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) { setApiError(json.error || 'حدث خطأ'); setSaving(false); return }
    }
    setSaving(false); onSave()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 20 }}>
        {TABS.map((t, i) => {
          if (i === 0 && employee) return null
          const hasError = (
            (i === 0 && (errors.email || errors.password)) ||
            (i === 1 && (errors.first_name || errors.last_name || errors.employee_number)) ||
            (i === 2 && errors.hire_date)
          )
          return (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === i ? '#2563eb' : 'transparent',
              color: tab === i ? '#fff' : hasError ? '#e11d48' : '#64748b',
              boxShadow: tab === i ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
            }}>
              {hasError ? '⚠ ' : ''}{t}
            </button>
          )
        })}
      </div>

      {apiError && (
        <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, fontSize: 13, color: '#e11d48', marginBottom: 16 }}>
          {apiError}
        </div>
      )}

      {/* Tab 0: بيانات الدخول */}
      {tab === 0 && !employee && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>
            🔐 سيستخدم الموظف هذه البيانات لتسجيل الدخول في بوابته الخاصة
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="6 أحرف على الأقل" />
          </div>
        </div>
      )}

      {/* Tab 1: البيانات الشخصية */}
      {tab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="الاسم الأول *"   value={form.first_name}      onChange={set('first_name')}      error={errors.first_name} />
          <Input label="اسم العائلة *"    value={form.last_name}       onChange={set('last_name')}       error={errors.last_name} />
          <Input label="الرقم الوظيفي *" value={form.employee_number} onChange={set('employee_number')} error={errors.employee_number} />
          <Input label="رقم الهاتف"       value={form.phone}           onChange={set('phone')} />
          <Input label="رقم الهوية"       value={form.national_id}     onChange={set('national_id')} />
          <Input label="تاريخ الميلاد"    type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
          <Select label="الجنس" value={form.gender} onChange={set('gender')}
            options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]} />
          <Input label="الجنسية" value={form.nationality} onChange={set('nationality')} />
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>العنوان</label>
            <textarea value={form.address} onChange={set('address')} rows={2}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>
      )}

      {/* Tab 2: البيانات الوظيفية */}
      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {employee && <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={set('email')} />}
            <Select label="القسم *" value={form.department_id}
              onChange={e => { set('department_id')(e); setForm(f => ({ ...f, job_position_id: '' })) }}
              options={departments.map(d => ({ value: d.id, label: d.name_ar || d.name }))} />
            <Select label="المسمى الوظيفي" value={form.job_position_id} onChange={set('job_position_id')}
              options={filteredPositions.map(p => ({ value: p.id, label: p.title_ar || p.title }))} />
            <Input label="تاريخ التعيين *" type="date" value={form.hire_date} onChange={set('hire_date')} error={errors.hire_date} />
            <Select label="نوع العقد" value={form.contract_type} onChange={set('contract_type')}
              options={[
                { value: 'full_time', label: 'دوام كامل' }, { value: 'part_time', label: 'دوام جزئي' },
                { value: 'contract',  label: 'عقد' },        { value: 'intern',    label: 'متدرب' },
              ]} />
            <Select label="الحالة" value={form.status} onChange={set('status')}
              options={[
                { value: 'active',   label: 'نشط' }, { value: 'inactive', label: 'غير نشط' },
                { value: 'on_leave', label: 'في إجازة' },
              ]} />
          </div>

          {/* Role Cards */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 10 }}>
              صلاحيات الدخول
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ROLES.map(r => {
                const active = form.role === r.value
                return (
                  <div key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))} style={{
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${active ? r.color : '#e2e8f0'}`,
                    background: active ? r.bg : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: active ? r.color : '#0f172a', margin: 0 }}>{r.label}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{r.sub}</p>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: active ? r.color : '#f1f5f9',
                      border: `2px solid ${active ? r.color : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: الراتب والبدلات */}
      {tab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="الراتب الأساسي (ر.س)"  type="number" value={form.basic_salary}        onChange={set('basic_salary')} />
            <Input label="بدل السكن (ر.س)"         type="number" value={form.housing_allowance}   onChange={set('housing_allowance')} />
            <Input label="بدل النقل (ر.س)"         type="number" value={form.transport_allowance} onChange={set('transport_allowance')} />
            <Input label="بدلات أخرى (ر.س)"        type="number" value={form.other_allowances}    onChange={set('other_allowances')} />
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' }}>إجمالي الراتب الشهري</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>
                {totalSalary.toLocaleString('ar-SA')} <span style={{ fontSize: 14, fontWeight: 500 }}>ر.س</span>
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'أساسي', val: Number(form.basic_salary) || 0 },
                { label: 'سكن',   val: Number(form.housing_allowance) || 0 },
                { label: 'نقل',   val: Number(form.transport_allowance) || 0 },
                { label: 'أخرى', val: Number(form.other_allowances) || 0 },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  <span>{r.label}:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{r.val.toLocaleString('ar-SA')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab > (employee ? 1 : 0) && (
            <Button type="button" variant="outline" onClick={() => setTab(t => t - 1)}>← السابق</Button>
          )}
          {tab < TABS.length - 1 ? (
            <Button type="button" onClick={() => setTab(t => t + 1)}>التالي →</Button>
          ) : (
            <Button type="button" loading={saving} onClick={handleSubmit}>
              {employee ? 'حفظ التعديلات' : 'إضافة الموظف وإنشاء حساب'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
