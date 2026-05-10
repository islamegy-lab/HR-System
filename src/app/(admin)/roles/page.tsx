'use client'
import { useEffect, useState, useCallback } from 'react'
import { Shield, Plus, Save, Trash2, UserCheck, Eye, Edit, CheckCircle } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CardHeader, pageStyle, bodyStyle, cardStyle, thStyle, tdStyle, Avatar, EmptyState } from '@/components/ui/PageComponents'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types'

const ROLES: { value: UserRole; label: string; color: string; bg: string; desc: string }[] = [
  { value: 'super_admin', label: 'مدير النظام',      color: '#7c3aed', bg: '#faf5ff', desc: 'صلاحيات كاملة على كل شيء' },
  { value: 'hr_manager',  label: 'مدير الموارد البشرية', color: '#2563eb', bg: '#eff6ff', desc: 'إدارة الموظفين والرواتب والإجازات' },
  { value: 'hr_staff',    label: 'موظف HR',          color: '#0d9488', bg: '#f0fdfa', desc: 'عرض وتعديل محدود' },
  { value: 'employee',    label: 'موظف',             color: '#64748b', bg: '#f8fafc', desc: 'بوابة الموظف فقط' },
]

const ALL_PERMISSIONS = [
  { key: 'employees.view',      label: 'عرض الموظفين' },
  { key: 'employees.create',    label: 'إضافة موظف' },
  { key: 'employees.edit',      label: 'تعديل موظف' },
  { key: 'employees.delete',    label: 'حذف موظف' },
  { key: 'payroll.view',        label: 'عرض الرواتب' },
  { key: 'payroll.manage',      label: 'إدارة الرواتب' },
  { key: 'leaves.view',         label: 'عرض الإجازات' },
  { key: 'leaves.approve',      label: 'الموافقة على الإجازات' },
  { key: 'attendance.view',     label: 'عرض الحضور' },
  { key: 'attendance.manage',   label: 'إدارة الحضور' },
  { key: 'documents.view',      label: 'عرض الوثائق' },
  { key: 'documents.manage',    label: 'إدارة الوثائق' },
  { key: 'recruitment.view',    label: 'عرض التوظيف' },
  { key: 'recruitment.manage',  label: 'إدارة التوظيف' },
  { key: 'reports.view',        label: 'عرض التقارير' },
  { key: 'settings.manage',     label: 'إدارة الإعدادات' },
  { key: 'roles.manage',        label: 'إدارة الصلاحيات' },
]

const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ALL_PERMISSIONS.map(p => p.key),
  hr_manager:  ALL_PERMISSIONS.filter(p => !p.key.includes('roles') && !p.key.includes('settings')).map(p => p.key),
  hr_staff:    ['employees.view','leaves.view','leaves.approve','attendance.view','attendance.manage','documents.view'],
  employee:    [],
}

interface UserRow {
  id: string
  email: string
  role: UserRole
  employee_name?: string
  employee_number?: string
  created_at: string
}

export default function RolesPage() {
  const [users, setUsers]         = useState<UserRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [showPerms, setShowPerms] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('hr_staff')
  const [perms, setPerms]         = useState<Record<UserRole, string[]>>(DEFAULT_PERMISSIONS)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', role: 'hr_staff' as UserRole,
    first_name: '', last_name: '', employee_number: ''
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('*, employee:employees(first_name,last_name,employee_number)')
      .order('created_at', { ascending: false })
    if (data) {
      setUsers(data.map((u: any) => ({
        id: u.id,
        email: u.email || '',
        role: u.role,
        employee_name: u.employee ? `${u.employee.first_name} ${u.employee.last_name}` : undefined,
        employee_number: u.employee?.employee_number,
        created_at: u.created_at,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAddUser = async () => {
    if (!form.email || !form.password || !form.first_name) return
    setSaving(true)
    const res = await fetch('/api/auth/create-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        employee_number: form.employee_number || `EMP-${Date.now()}`,
        hire_date: new Date().toISOString().split('T')[0],
        contract_type: 'full_time',
        status: 'active',
        role: form.role,
      }),
    })
    setSaving(false)
    if (res.ok) { setShowAdd(false); load() }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return
    await supabase.from('user_profiles').delete().eq('id', id)
    load()
  }

  const handleSavePerms = async () => {
    setSaving(true)
    await supabase.from('role_permissions').upsert(
      Object.entries(perms).map(([role, permissions]) => ({ role, permissions })),
      { onConflict: 'role' }
    )
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const togglePerm = (perm: string) => {
    setPerms(p => ({
      ...p,
      [selectedRole]: p[selectedRole].includes(perm)
        ? p[selectedRole].filter(x => x !== perm)
        : [...p[selectedRole], perm]
    }))
  }

  const roleInfo = (role: UserRole) => ROLES.find(r => r.value === role)!

  return (
    <div style={pageStyle}>
      <Topbar title="الصلاحيات والأدوار" subtitle={`${users.length} مستخدم`}
        actions={<>
          <Button variant="outline" size="sm" icon={<Shield size={13} />} onClick={() => setShowPerms(true)}>إدارة الصلاحيات</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>إضافة مستخدم</Button>
        </>} />

      <div style={bodyStyle}>

        {/* Role Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {ROLES.map(r => {
            const count = users.filter(u => u.role === r.value).length
            return (
              <div key={r.value} className="card slide-up" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} color={r.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{count} مستخدم</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#64748b' }}>{r.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Users Table */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="المستخدمون"
            right={<span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{users.length} مستخدم</span>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['المستخدم', 'البريد الإلكتروني', 'الدور', 'رقم الموظف', 'تاريخ الإنشاء', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : users.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon={UserCheck} text="لا يوجد مستخدمون" /></td></tr>
                ) : users.map(u => {
                  const r = roleInfo(u.role)
                  return (
                    <tr key={u.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.employee_name || u.email} size={32} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.employee_name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: r.bg, color: r.color }}>
                          {r.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{u.employee_number || '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleDeleteUser(u.id)}
                          style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#94a3b8' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94a3b8' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة مستخدم جديد" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="الاسم الأول *" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            <Input label="الاسم الأخير" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <Input label="رقم الموظف" value={form.employee_number} onChange={e => setForm(f => ({ ...f, employee_number: e.target.value }))} placeholder="EMP-001" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>الدور *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: roleInfo(form.role).bg, borderRadius: 10, border: `1px solid ${roleInfo(form.role).color}22` }}>
            <p style={{ fontSize: 12, color: roleInfo(form.role).color, fontWeight: 600 }}>
              <Shield size={12} style={{ display: 'inline', marginLeft: 4 }} />
              {roleInfo(form.role).desc}
            </p>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              صلاحيات: {DEFAULT_PERMISSIONS[form.role].length} صلاحية
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleAddUser}>إنشاء المستخدم</Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal open={showPerms} onClose={() => setShowPerms(false)} title="إدارة صلاحيات الأدوار" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Role Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setSelectedRole(r.value)}
                style={{ padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${selectedRole === r.value ? r.color : '#e2e8f0'}`, background: selectedRole === r.value ? r.bg : '#fff', color: selectedRole === r.value ? r.color : '#64748b', transition: 'all 0.15s' }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Permissions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {ALL_PERMISSIONS.map(p => {
              const active = perms[selectedRole]?.includes(p.key)
              return (
                <label key={p.key} onClick={() => togglePerm(p.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${active ? '#bfdbfe' : '#f1f5f9'}`, background: active ? '#eff6ff' : '#fafafa', transition: 'all 0.15s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? '#2563eb' : '#cbd5e1'}`, background: active ? '#2563eb' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {active && <CheckCircle size={11} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#1d4ed8' : '#475569' }}>{p.label}</span>
                </label>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {perms[selectedRole]?.length || 0} صلاحية محددة
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" onClick={() => setShowPerms(false)}>إغلاق</Button>
              <Button icon={saved ? <CheckCircle size={14} /> : <Save size={14} />} loading={saving} onClick={handleSavePerms}
                style={saved ? { background: 'linear-gradient(135deg,#059669,#10b981)' } : {}}>
                {saved ? 'تم الحفظ ✓' : 'حفظ الصلاحيات'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
