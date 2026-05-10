'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, FileText, AlertTriangle, CheckCircle, Clock, Trash2, Edit, Bell } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { CardHeader, pageStyle, bodyStyle, cardStyle, thStyle, tdStyle, Avatar, EmptyState, TabBar } from '@/components/ui/PageComponents'
import { documentsApi, employeesApi } from '@/lib/api'
import type { EmployeeDocument, Employee } from '@/types'

const DOC_TYPES = [
  { value: 'national_id',    label: 'بطاقة الهوية الوطنية' },
  { value: 'passport',       label: 'جواز السفر' },
  { value: 'residence',      label: 'الإقامة' },
  { value: 'work_permit',    label: 'تصريح العمل' },
  { value: 'driving_license',label: 'رخصة القيادة' },
  { value: 'health_card',    label: 'البطاقة الصحية' },
  { value: 'contract',       label: 'عقد العمل' },
  { value: 'certificate',    label: 'شهادة علمية' },
  { value: 'other',          label: 'أخرى' },
]

const TABS = [
  { value: 'all',      label: 'الكل' },
  { value: 'expiring', label: 'تنتهي قريباً' },
  { value: 'expired',  label: 'منتهية' },
]

const emptyForm = {
  employee_id: '', document_type: '', document_name: '',
  document_number: '', issue_date: '', expiry_date: '',
  notify_days_before: 30, notes: '', file_url: ''
}

function getDaysStatus(expiry?: string) {
  if (!expiry) return null
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0)  return { days, label: `منتهية منذ ${Math.abs(days)} يوم`, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', icon: AlertTriangle }
  if (days <= 30) return { days, label: `تنتهي خلال ${days} يوم`, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock }
  return { days, label: `${days} يوم متبقي`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle }
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<EmployeeDocument[]>([])
  const [expiring, setExpiring] = useState<EmployeeDocument[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EmployeeDocument | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [docsRes, expiringRes] = await Promise.all([
      documentsApi.getAll(),
      documentsApi.getExpiring(),
    ])
    if (docsRes.data) setDocs(docsRes.data as EmployeeDocument[])
    if (expiringRes.data) setExpiring(expiringRes.data as EmployeeDocument[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    employeesApi.getAll({ status: 'active' }).then(({ data }) => { if (data) setEmployees(data as Employee[]) })
  }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (doc: EmployeeDocument) => {
    setEditing(doc)
    setForm({
      employee_id: doc.employee_id, document_type: doc.document_type,
      document_name: doc.document_name, document_number: doc.document_number || '',
      issue_date: doc.issue_date || '', expiry_date: doc.expiry_date || '',
      notify_days_before: doc.notify_days_before, notes: doc.notes || '', file_url: doc.file_url || ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.employee_id || !form.document_type || !form.document_name) return
    setSaving(true)
    if (editing) {
      await documentsApi.update(editing.id, form)
    } else {
      await documentsApi.create(form)
    }
    setSaving(false); setShowForm(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الوثيقة؟')) return
    await documentsApi.delete(id)
    load()
  }

  const filtered = (() => {
    let list = docs
    if (tab === 'expiring') list = docs.filter(d => { const s = getDaysStatus(d.expiry_date); return s && s.days >= 0 && s.days <= 30 })
    if (tab === 'expired')  list = docs.filter(d => { const s = getDaysStatus(d.expiry_date); return s && s.days < 0 })
    if (search) list = list.filter(d => d.document_name.includes(search) || d.employee?.first_name?.includes(search) || d.employee?.last_name?.includes(search))
    return list
  })()

  const expiredCount  = docs.filter(d => { const s = getDaysStatus(d.expiry_date); return s && s.days < 0 }).length
  const expiringCount = docs.filter(d => { const s = getDaysStatus(d.expiry_date); return s && s.days >= 0 && s.days <= 30 }).length

  return (
    <div style={pageStyle}>
      <Topbar title="الأوراق الرسمية" subtitle={`${docs.length} وثيقة`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>إضافة وثيقة</Button>} />

      <div style={bodyStyle}>

        {/* Alert Banner */}
        {(expiredCount > 0 || expiringCount > 0) && (
          <div style={{ background: expiredCount > 0 ? '#fff1f2' : '#fffbeb', border: `1px solid ${expiredCount > 0 ? '#fecdd3' : '#fde68a'}`, borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: expiredCount > 0 ? '#fee2e2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={20} color={expiredCount > 0 ? '#e11d48' : '#d97706'} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: expiredCount > 0 ? '#9f1239' : '#92400e' }}>
                {expiredCount > 0 ? `${expiredCount} وثيقة منتهية الصلاحية` : ''}
                {expiredCount > 0 && expiringCount > 0 ? ' · ' : ''}
                {expiringCount > 0 ? `${expiringCount} وثيقة تنتهي خلال 30 يوم` : ''}
              </p>
              <p style={{ fontSize: 12, color: expiredCount > 0 ? '#e11d48' : '#d97706', marginTop: 2 }}>يرجى مراجعة الوثائق وتجديدها في أقرب وقت</p>
            </div>
            <button onClick={() => setTab('expiring')} style={{ marginRight: 'auto', padding: '7px 16px', background: expiredCount > 0 ? '#e11d48' : '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              عرض التنبيهات
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'إجمالي الوثائق', value: docs.length,    bg: '#eff6ff', ic: '#2563eb', icon: FileText },
            { label: 'سارية',          value: docs.length - expiredCount - expiringCount, bg: '#f0fdf4', ic: '#16a34a', icon: CheckCircle },
            { label: 'تنتهي قريباً',   value: expiringCount,  bg: '#fffbeb', ic: '#d97706', icon: Clock },
            { label: 'منتهية',         value: expiredCount,   bg: '#fff1f2', ic: '#e11d48', icon: AlertTriangle },
          ].map((s, i) => (
            <div key={s.label} className="card slide-up" style={{ padding: 18, animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={20} color={s.ic} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
          <TabBar
            tabs={TABS.map(t => ({
              ...t,
              count: t.value === 'expiring' ? expiringCount : t.value === 'expired' ? expiredCount : undefined
            }))}
            value={tab} onChange={setTab}
          />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الوثيقة..."
            style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none', width: 220 }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Table */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="قائمة الوثائق"
            right={<span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{filtered.length} وثيقة</span>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['الموظف', 'نوع الوثيقة', 'اسم الوثيقة', 'الرقم', 'تاريخ الإصدار', 'تاريخ الانتهاء', 'الحالة', 'التنبيه', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={9}><EmptyState icon={FileText} text="لا توجد وثائق" /></td></tr>
                ) : filtered.map(doc => {
                  const status = getDaysStatus(doc.expiry_date)
                  const docTypeLabel = DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type
                  return (
                    <tr key={doc.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={doc.employee?.first_name || '؟'} size={32} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{doc.employee?.first_name} {doc.employee?.last_name}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{doc.employee?.employee_number}</p>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{docTypeLabel}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>{doc.document_name}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{doc.document_number || '—'}</td>
                      <td style={tdStyle}>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('ar-SA') : '—'}</td>
                      <td style={tdStyle}>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('ar-SA') : '—'}</td>
                      <td style={tdStyle}>
                        {status ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                            <status.icon size={11} />
                            {status.label}
                          </span>
                        ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>لا يوجد تاريخ</span>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                          <Bell size={10} /> قبل {doc.notify_days_before} يوم
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noreferrer"
                              style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = '#64748b' }}>
                              <FileText size={13} />
                            </a>
                          )}
                          <button onClick={() => openEdit(doc)} style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b' }}>
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'تعديل الوثيقة' : 'إضافة وثيقة جديدة'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="الموظف *" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} — ${e.employee_number}` }))} />
            <Select label="نوع الوثيقة *" value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
              options={DOC_TYPES} />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="اسم الوثيقة *" value={form.document_name} onChange={e => setForm(f => ({ ...f, document_name: e.target.value }))} placeholder="مثال: هوية وطنية - محمد أحمد" />
            </div>
            <Input label="رقم الوثيقة" value={form.document_number} onChange={e => setForm(f => ({ ...f, document_number: e.target.value }))} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>التنبيه قبل الانتهاء (أيام)</label>
              <select value={form.notify_days_before} onChange={e => setForm(f => ({ ...f, notify_days_before: Number(e.target.value) }))}
                style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>قبل {d} يوم</option>)}
              </select>
            </div>
            <Input label="تاريخ الإصدار" type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
            <Input label="تاريخ الانتهاء" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="رابط الملف (اختياري)" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          {/* Preview expiry status */}
          {form.expiry_date && (() => {
            const s = getDaysStatus(form.expiry_date)
            if (!s) return null
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10 }}>
                <s.icon size={16} color={s.color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</span>
              </div>
            )
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>ملاحظات</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'حفظ التعديلات' : 'إضافة الوثيقة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
