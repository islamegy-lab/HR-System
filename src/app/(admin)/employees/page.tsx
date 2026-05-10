'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye, Edit, UserX } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { Employee } from '@/types'
import { EmployeeForm } from './EmployeeForm'

const TABS = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'on_leave', label: 'في إجازة' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'terminated', label: 'منتهي' },
]

const S = {
  page: { minHeight: '100vh', background: '#f1f5f9' },
  body: { padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 16 },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  th: { padding: '11px 16px', textAlign: 'right' as const, fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
  td: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc' },
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [viewing, setViewing] = useState<Employee | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await employeesApi.getAll({ search, status: tab || undefined })
    if (data) setEmployees(data as Employee[])
    setLoading(false)
  }, [search, tab])

  useEffect(() => { load() }, [load])

  return (
    <div style={S.page}>
      <Topbar title="الموظفون" subtitle={`${employees.length} موظف`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => { setSelected(null); setShowForm(true) }}>موظف جديد</Button>} />

      <div style={S.body}>

        {/* Filters */}
        <div style={{ ...S.card, padding: '12px 16px', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم..."
              style={{ paddingRight: 32, paddingLeft: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, width: 220, color: '#0f172a', background: '#f8fafc', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === t.value ? '#2563eb' : 'transparent',
                color: tab === t.value ? '#fff' : '#64748b',
                transition: 'all 0.15s',
                boxShadow: tab === t.value ? '0 2px 8px rgba(37,99,235,0.3)' : 'none'
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={S.card} className="slide-up">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 99, background: '#2563eb' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>قائمة الموظفين</span>
            <span style={{ marginRight: 'auto', fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{employees.length} موظف</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}><input type="checkbox" /></th>
                  {['الموظف', 'الرقم الوظيفي', 'القسم', 'المسمى الوظيفي', 'تاريخ التعيين', 'نوع العقد', 'الحالة', ''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : employees.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <UserX size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <p style={{ fontSize: 13 }}>لا يوجد موظفون</p>
                      <button onClick={() => setShowForm(true)} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontWeight: 600 }}>إضافة أول موظف</button>
                    </div>
                  </td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={S.td}><input type="checkbox" /></td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {emp.photo_url ? <img src={emp.photo_url} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} alt="" /> : emp.first_name[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{emp.first_name} {emp.last_name}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12 }}>{emp.employee_number}</td>
                    <td style={S.td}>{emp.department?.name_ar || '—'}</td>
                    <td style={S.td}>{emp.job_position?.title_ar || '—'}</td>
                    <td style={S.td}>{formatDate(emp.hire_date)}</td>
                    <td style={S.td}>
                      <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{getStatusLabel(emp.contract_type)}</span>
                    </td>
                    <td style={S.td}>
                      <span className={`badge ${getStatusColor(emp.status)}`}>{getStatusLabel(emp.status)}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        className="row-actions">
                        <button onClick={() => setViewing(emp)} style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                          onMouseEnter={e => { (e.currentTarget.style.background = '#eff6ff'); (e.currentTarget.style.color = '#2563eb') }}
                          onMouseLeave={e => { (e.currentTarget.style.background = '#fff'); (e.currentTarget.style.color = '#64748b') }}>
                          <Eye size={13} />
                        </button>
                        <button onClick={() => { setSelected(emp); setShowForm(true) }} style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                          onMouseEnter={e => { (e.currentTarget.style.background = '#eff6ff'); (e.currentTarget.style.color = '#2563eb') }}
                          onMouseLeave={e => { (e.currentTarget.style.background = '#fff'); (e.currentTarget.style.color = '#64748b') }}>
                          <Edit size={13} />
                        </button>
                        <button onClick={async () => { if (confirm('إنهاء خدمة هذا الموظف؟')) { await employeesApi.delete(emp.id); load() } }} style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                          onMouseEnter={e => { (e.currentTarget.style.background = '#fff1f2'); (e.currentTarget.style.color = '#e11d48') }}
                          onMouseLeave={e => { (e.currentTarget.style.background = '#fff'); (e.currentTarget.style.color = '#64748b') }}>
                          <UserX size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {employees.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>إجمالي {employees.length} موظف</p>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ padding: '5px 12px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#475569' }}>السابق</button>
                <button style={{ padding: '5px 12px', fontSize: 12, border: 'none', borderRadius: 8, background: '#2563eb', cursor: 'pointer', color: '#fff' }}>1</button>
                <button style={{ padding: '5px 12px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#475569' }}>التالي</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setSelected(null) }} title={selected ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'} size="xl">
        <EmployeeForm employee={selected} onSave={() => { setShowForm(false); setSelected(null); load() }} onCancel={() => { setShowForm(false); setSelected(null) }} />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="ملف الموظف" size="lg">
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800 }}>{viewing.first_name[0]}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{viewing.first_name} {viewing.last_name}</h3>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{viewing.job_position?.title_ar || '—'}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className={`badge ${getStatusColor(viewing.status)}`}>{getStatusLabel(viewing.status)}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{viewing.employee_number}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['البريد الإلكتروني', viewing.email], ['الهاتف', viewing.phone || '—'],
                ['القسم', viewing.department?.name_ar || '—'], ['تاريخ التعيين', formatDate(viewing.hire_date)],
                ['نوع العقد', getStatusLabel(viewing.contract_type)], ['الجنسية', viewing.nationality || '—'],
                ['رقم الهوية', viewing.national_id || '—'], ['الراتب الأساسي', viewing.basic_salary ? `${viewing.basic_salary.toLocaleString()} ر.س` : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" variant="outline" icon={<Edit size={13} />} onClick={() => { setViewing(null); setSelected(viewing); setShowForm(true) }}>تعديل</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
