'use client'
import { useState } from 'react'
import { CheckCircle, Key, User, Mail, Phone, Building2, Briefcase, Calendar, Shield } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'
import { employeesApi } from '@/lib/api'
import { getStatusLabel, formatDate } from '@/lib/utils'

export default function EmployeeProfilePage() {
  const { employee } = useEmployeeAuth()
  const [phone, setPhone]       = useState(employee?.phone || '')
  const [address, setAddress]   = useState(employee?.address || '')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [pwd, setPwd]           = useState({ new: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdSaved, setPwdSaved] = useState(false)
  const [pwdError, setPwdError] = useState('')

  if (!employee) return null

  const handleSave = async () => {
    setSaving(true)
    await employeesApi.update(employee.id, { phone, address })
    setSaved(true); setTimeout(() => setSaved(false), 2500); setSaving(false)
  }

  const handleChangePwd = async () => {
    setPwdError('')
    if (pwd.new.length < 6) { setPwdError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل'); return }
    if (pwd.new !== pwd.confirm) { setPwdError('كلمتا المرور غير متطابقتين'); return }
    setPwdSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwd.new })
    if (error) { setPwdError(error.message); setPwdSaving(false); return }
    setPwdSaved(true); setPwd({ new: '', confirm: '' })
    setTimeout(() => setPwdSaved(false), 2500); setPwdSaving(false)
  }

  const inp = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Cairo, sans-serif' }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 18, padding: '20px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
          {employee.first_name[0]}
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>{employee.first_name} {employee.last_name}</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>
            {employee.job_position?.title_ar || '—'} · {employee.department?.name_ar || '—'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 99, fontFamily: 'monospace' }}>{employee.employee_number}</span>
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 99 }}>{getStatusLabel(employee.status)}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>البيانات الوظيفية</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: Mail,      label: 'البريد الإلكتروني', val: employee.email },
            { icon: Building2, label: 'القسم',              val: employee.department?.name_ar || '—' },
            { icon: Briefcase, label: 'المسمى الوظيفي',     val: employee.job_position?.title_ar || '—' },
            { icon: Calendar,  label: 'تاريخ التعيين',      val: formatDate(employee.hire_date) },
            { icon: Shield,    label: 'نوع العقد',           val: getStatusLabel(employee.contract_type) },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <row.icon size={15} color="#2563eb" />
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{row.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '2px 0 0' }}>{row.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Info */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>البيانات الشخصية</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>رقم الهاتف</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} style={inp} placeholder="+966500000000" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>العنوان</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
              style={{ ...inp, resize: 'none' }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '11px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
            background: saved ? 'linear-gradient(135deg,#059669,#10b981)' : saving ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
            color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Cairo, sans-serif'
          }}>
            {saved ? <><CheckCircle size={14} /> تم الحفظ ✓</> : saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>تغيير كلمة المرور</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pwdError && (
            <div style={{ padding: '10px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, fontSize: 12, color: '#e11d48' }}>{pwdError}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>كلمة المرور الجديدة</label>
            <input type="password" value={pwd.new} onChange={e => setPwd(p => ({ ...p, new: e.target.value }))} style={inp} placeholder="٦ أحرف على الأقل" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>تأكيد كلمة المرور</label>
            <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} style={inp} placeholder="••••••••" />
          </div>
          <button onClick={handleChangePwd} disabled={pwdSaving} style={{
            padding: '11px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
            background: pwdSaved ? 'linear-gradient(135deg,#059669,#10b981)' : pwdSaving ? '#94a3b8' : 'linear-gradient(135deg,#d97706,#f59e0b)',
            color: '#fff', border: 'none', cursor: pwdSaving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Cairo, sans-serif'
          }}>
            {pwdSaved ? <><CheckCircle size={14} /> تم التغيير ✓</> : pwdSaving ? 'جاري التغيير...' : <><Key size={14} /> تغيير كلمة المرور</>}
          </button>
        </div>
      </div>

    </div>
  )
}
