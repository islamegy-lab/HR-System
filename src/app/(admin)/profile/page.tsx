'use client'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Building2, Briefcase, Calendar, Shield, Key, CheckCircle, Loader2, Camera } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { pageStyle, bodyStyle, cardStyle, CardHeader } from '@/components/ui/PageComponents'
import { authApi, employeesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Employee } from '@/types'

export default function ProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [saved, setSaved]       = useState(false)
  const [savedPwd, setSavedPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const [form, setForm] = useState({ phone: '', nationality: '', address: '' })
  const [pwd, setPwd]   = useState({ current: '', newPwd: '', confirm: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: emp } = await authApi.getEmployeeByUserId(user.id)
      if (emp) {
        setEmployee(emp as Employee)
        setForm({
          phone:       (emp as Employee).phone       || '',
          nationality: (emp as Employee).nationality || '',
          address:     (emp as Employee).address     || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveInfo = async () => {
    if (!employee) return
    setSaving(true)
    await employeesApi.update(employee.id, form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPwdError('')
    if (!pwd.newPwd || pwd.newPwd.length < 6) { setPwdError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (pwd.newPwd !== pwd.confirm) { setPwdError('كلمة المرور وتأكيدها غير متطابقتين'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: pwd.newPwd })
    if (error) { setPwdError(error.message); setSavingPwd(false); return }
    setSavedPwd(true)
    setPwd({ current: '', newPwd: '', confirm: '' })
    setTimeout(() => setSavedPwd(false), 2500)
    setSavingPwd(false)
  }

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!employee) return (
    <div style={pageStyle}>
      <Topbar title="الملف الشخصي" />
      <div style={{ ...bodyStyle, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>لم يتم ربط هذا الحساب بموظف</p>
      </div>
    </div>
  )

  return (
    <div style={pageStyle}>
      <Topbar title="الملف الشخصي" subtitle={`${employee.first_name} ${employee.last_name}`} />

      <div style={{ ...bodyStyle, maxWidth: 860 }}>

        {/* Hero Card */}
        <div style={{
          borderRadius: 20, padding: '28px 32px', color: '#fff', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)'
        }} className="slide-up">
          <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 800, border: '3px solid rgba(255,255,255,0.3)'
              }}>
                {employee.photo_url
                  ? <img src={employee.photo_url} style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover' }} alt="" />
                  : employee.first_name[0]
                }
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{employee.first_name} {employee.last_name}</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                {employee.job_position?.title_ar || '—'} · {employee.department?.name_ar || '—'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 99, fontFamily: 'monospace' }}>
                  {employee.employee_number}
                </span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 99 }}>
                  {getStatusLabel(employee.status)}
                </span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 99 }}>
                  {getStatusLabel(employee.contract_type)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
              {[
                { label: 'تاريخ التعيين', value: formatDate(employee.hire_date) },
                { label: 'الراتب الأساسي', value: employee.basic_salary ? `${employee.basic_salary.toLocaleString()} ر.س` : '—' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* بيانات ثابتة */}
          <div style={cardStyle} className="slide-up">
            <CardHeader title="البيانات الوظيفية" color="#2563eb" />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Mail,      label: 'البريد الإلكتروني', value: employee.email },
                { icon: Building2, label: 'القسم',              value: employee.department?.name_ar || '—' },
                { icon: Briefcase, label: 'المسمى الوظيفي',     value: employee.job_position?.title_ar || '—' },
                { icon: Calendar,  label: 'تاريخ التعيين',      value: formatDate(employee.hire_date) },
                { icon: Shield,    label: 'نوع العقد',           value: getStatusLabel(employee.contract_type) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <row.icon size={16} color="#2563eb" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>{row.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* بيانات قابلة للتعديل */}
          <div style={cardStyle} className="slide-up">
            <CardHeader title="البيانات الشخصية" color="#16a34a" />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="رقم الهاتف" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+966500000000" />
              <Input label="الجنسية" value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>العنوان</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2}
                  style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <Button icon={saved ? <CheckCircle size={14} /> : undefined}
                onClick={handleSaveInfo} loading={saving}
                className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </div>

        {/* تغيير كلمة المرور */}
        <div style={{ ...cardStyle, maxWidth: 480 }} className="slide-up">
          <CardHeader title="تغيير كلمة المرور" color="#d97706" />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pwdError && (
              <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, fontSize: 13, color: '#e11d48' }}>
                {pwdError}
              </div>
            )}
            <Input label="كلمة المرور الجديدة" type="password" value={pwd.newPwd}
              onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))} placeholder="6 أحرف على الأقل" />
            <Input label="تأكيد كلمة المرور" type="password" value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            <Button icon={savedPwd ? <CheckCircle size={14} /> : <Key size={14} />}
              onClick={handleChangePassword} loading={savingPwd}
              className={savedPwd ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
              {savedPwd ? 'تم تغيير كلمة المرور ✓' : 'تغيير كلمة المرور'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
