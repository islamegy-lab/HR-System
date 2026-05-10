'use client'
import { useEffect, useState, useCallback } from 'react'
import { Shield, Plus, Save, Trash2, UserCheck, CheckCircle, X } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CardHeader, pageStyle, bodyStyle, cardStyle, thStyle, tdStyle, Avatar, EmptyState } from '@/components/ui/PageComponents'
import { supabase } from '@/lib/supabase'

const ALL_PERMISSIONS = [
  { key: 'employees.view',     label: 'عرض الموظفين' },
  { key: 'employees.create',   label: 'إضافة موظف' },
  { key: 'employees.edit',     label: 'تعديل موظف' },
  { key: 'employees.delete',   label: 'حذف موظف' },
  { key: 'payroll.view',       label: 'عرض الرواتب' },
  { key: 'payroll.manage',     label: 'إدارة الرواتب' },
  { key: 'leaves.view',        label: 'عرض الإجازات' },
  { key: 'leaves.approve',     label: 'الموافقة على الإجازات' },
  { key: 'attendance.view',    label: 'عرض الحضور' },
  { key: 'attendance.manage',  label: 'إدارة الحضور' },
  { key: 'documents.view',     label: 'عرض الوثائق' },
  { key: 'documents.manage',   label: 'إدارة الوثائق' },
  { key: 'recruitment.view',   label: 'عرض التوظيف' },
  { key: 'recruitment.manage', label: 'إدارة التوظيف' },
  { key: 'reports.view',       label: 'عرض التقارير' },
  { key: 'settings.manage',    label: 'إدارة الإعدادات' },
  { key: 'roles.manage',       label: 'إدارة الصلاحيات' },
]

const COLORS = ['#2563eb','#7c3aed','#0d9488','#d97706','#e11d48','#16a34a','#0891b2','#9333ea']
const BGS    = ['#eff6ff','#faf5ff','#f0fdfa','#fffbeb','#fff1f2','#f0fdf4','#ecfeff','#fdf4ff']

interface RoleRow { id: string; name: string; label_ar: string; permissions: string[]; color: string; bg: string; is_system: boolean }
interface UserRow  { id: string; email: string; role: string; employee_name?: string; employee_number?: string; created_at: string }

export default function RolesPage() {
  const [roles, setRoles]         = useState<RoleRow[]>([])
  const [users, setUsers]         = useState<UserRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showPerms, setShowPerms] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  const [roleForm, setRoleForm] = useState({ label_ar: '', name: '', color: COLORS[0], bg: BGS[0] })
  const [userForm, setUserForm] = useState({ email: '', password: '', first_name: '', last_name: '', employee_number: '', role: '' })

  const loadRoles = useCallback(async () => {
    const { data } = await supabase.from('role_permissions').select('*').order('created_at', { ascending: true })
    if (data) {
      setRoles(data.map((r: any, i: number) => ({
        id: r.id, name: r.role, label_ar: r.label_ar || r.role,
        permissions: r.permissions || [],
        color: r.color || COLORS[i % COLORS.length],
        bg:    r.bg    || BGS[i % BGS.length],
        is_system: ['super_admin','hr_manager','hr_staff','employee'].includes(r.role),
      })))
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('*, employee:employees(first_name,last_name,employee_number)')
      .order('created_at', { ascending: false })
    if (data) {
      setUsers(data.map((u: any) => ({
        id: u.id, email: u.email || '', role: u.role,
        employee_name: u.employee ? `${u.employee.first_name} ${u.employee.last_name}` : undefined,
        employee_number: u.employee?.employee_number,
        created_at: u.created_at,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { Promise.all([loadRoles(), loadUsers()]) }, [loadRoles, loadUsers])

  // إضافة دور جديد
  const handleAddRole = async () => {
    if (!roleForm.label_ar || !roleForm.name) return
    setSaving(true)
    await supabase.from('role_permissions').insert({
      role: roleForm.name.toLowerCase().replace(/\s+/g, '_'),
      label_ar: roleForm.label_ar,
      permissions: [],
      color: roleForm.color,
      bg: roleForm.bg,
    })
    setSaving(false)
    setShowAddRole(false)
    setRoleForm({ label_ar: '', name: '', color: COLORS[0], bg: BGS[0] })
    loadRoles()
  }

  // حذف دور
  const handleDeleteRole = async (role: RoleRow) => {
    if (role.is_system) return
    if (!confirm(`هل تريد حذف دور "${role.label_ar}"؟`)) return
    await supabase.from('role_permissions').delete().eq('id', role.id)
    loadRoles()
  }

  // إضافة مستخدم
  const handleAddUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.first_name || !userForm.role) return
    setSaving(true)
    const res = await fetch('/api/auth/create-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userForm.email, password: userForm.password,
        first_name: userForm.first_name, last_name: userForm.last_name,
        employee_number: userForm.employee_number || `EMP-${Date.now()}`,
        hire_date: new Date().toISOString().split('T')[0],
        contract_type: 'full_time', status: 'active', role: userForm.role,
      }),
    })
    setSaving(false)
    if (res.ok) { setShowAddUser(false); loadUsers() }
  }

  // حفظ الصلاحيات
  const handleSavePerms = async () => {
    if (!selectedRole) return
    setSaving(true)
    await supabase.from('role_permissions')
      .update({ permissions: selectedRole.permissions })
      .eq('id', selectedRole.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadRoles()
  }

  const togglePerm = (perm: string) => {
    if (!selectedRole) return
    setSelectedRole(r => r ? ({
      ...r,
      permissions: r.permissions.includes(perm)
        ? r.permissions.filter(x => x !== perm)
        : [...r.permissions, perm]
    }) : r)
  }

  const getRoleInfo = (roleName: string) =>
    roles.find(r => r.name === roleName) || { label_ar: roleName, color: '#64748b', bg: '#f8fafc' }

  return (
    <div style={pageStyle}>
      <Topbar title="الصلاحيات والأدوار" subtitle={`${roles.length} دور · ${users.length} مستخدم`}
        actions={<>
          <Button variant="outline" size="sm" icon={<Plus size={13} />} onClick={() => setShowAddRole(true)}>دور جديد</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddUser(true)}>إضافة مستخدم</Button>
        </>} />

      <div style={bodyStyle}>

        {/* Role Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {roles.map(r => {
            const count = users.filter(u => u.role === r.name).length
            return (
              <div key={r.id} className="card slide-up" style={{ padding: 18, position: 'relative' }}>
                {!r.is_system && (
                  <button onClick={() => handleDeleteRole(r)}
                    style={{ position: 'absolute', top: 10, left: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e11d48'}
                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                    <X size={13} />
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} color={r.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.label_ar}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{count} مستخدم</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{r.permissions.length} صلاحية</p>
                <button onClick={() => { setSelectedRole(r); setShowPerms(true) }}
                  style={{ width: '100%', padding: '6px 0', borderRadius: 8, border: `1px solid ${r.color}33`, background: r.bg, color: r.color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  تعديل الصلاحيات
                </button>
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
                  const r = getRoleInfo(u.role)
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
                          {r.label_ar}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{u.employee_number || '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                      <td style={tdStyle}>
                        <button onClick={async () => { if (!confirm('حذف؟')) return; await supabase.from('user_profiles').delete().eq('id', u.id); loadUsers() }}
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

      {/* Add Role Modal */}
      <Modal open={showAddRole} onClose={() => setShowAddRole(false)} title="إضافة دور جديد">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="اسم الدور (عربي) *" value={roleForm.label_ar} onChange={e => setRoleForm(f => ({ ...f, label_ar: e.target.value }))} placeholder="مثال: مشرف الحضور" />
          <Input label="المعرف (إنجليزي) *" value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: attendance_supervisor" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>اللون</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map((c, i) => (
                <button key={c} onClick={() => setRoleForm(f => ({ ...f, color: c, bg: BGS[i] }))}
                  style={{ width: 28, height: 28, borderRadius: 8, background: c, border: roleForm.color === c ? '3px solid #0f172a' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: roleForm.bg, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={16} color={roleForm.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: roleForm.color }}>{roleForm.label_ar || 'اسم الدور'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowAddRole(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleAddRole}>إضافة الدور</Button>
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="إضافة مستخدم جديد" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="الاسم الأول *" value={userForm.first_name} onChange={e => setUserForm(f => ({ ...f, first_name: e.target.value }))} />
            <Input label="الاسم الأخير"  value={userForm.last_name}  onChange={e => setUserForm(f => ({ ...f, last_name: e.target.value }))} />
            <Input label="البريد الإلكتروني *" type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="كلمة المرور *" type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
            <Input label="رقم الموظف" value={userForm.employee_number} onChange={e => setUserForm(f => ({ ...f, employee_number: e.target.value }))} placeholder="EMP-001" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>الدور *</label>
              <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                <option value="">— اختر الدور —</option>
                {roles.map(r => <option key={r.id} value={r.name}>{r.label_ar}</option>)}
              </select>
            </div>
          </div>
          {userForm.role && (() => { const r = getRoleInfo(userForm.role); return (
            <div style={{ padding: '10px 14px', background: r.bg, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} color={r.color} />
              <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.label_ar} · {roles.find(x => x.name === userForm.role)?.permissions.length || 0} صلاحية</span>
            </div>
          )})()}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleAddUser}>إنشاء المستخدم</Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal open={showPerms} onClose={() => setShowPerms(false)} title={`صلاحيات: ${selectedRole?.label_ar}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
            {ALL_PERMISSIONS.map(p => {
              const active = selectedRole?.permissions.includes(p.key)
              return (
                <label key={p.key} onClick={() => togglePerm(p.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${active ? '#bfdbfe' : '#f1f5f9'}`, background: active ? '#eff6ff' : '#fafafa', transition: 'all 0.15s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? '#2563eb' : '#cbd5e1'}`, background: active ? '#2563eb' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <CheckCircle size={11} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#1d4ed8' : '#475569' }}>{p.label}</span>
                </label>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{selectedRole?.permissions.length || 0} صلاحية محددة</span>
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
