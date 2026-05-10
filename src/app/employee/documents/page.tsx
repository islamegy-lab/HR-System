'use client'
import { useEffect, useState } from 'react'
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'

const n = (v: number) => v.toLocaleString('ar-SA')

const DOC_LABELS: Record<string, string> = {
  national_id: 'بطاقة الهوية', passport: 'جواز السفر', residence: 'الإقامة',
  work_permit: 'تصريح العمل', driving_license: 'رخصة القيادة',
  health_card: 'البطاقة الصحية', contract: 'عقد العمل',
  certificate: 'شهادة علمية', other: 'أخرى'
}

export default function EmployeeDocumentsPage() {
  const { employee } = useEmployeeAuth()
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    if (!employee) return
    supabase.from('employee_documents').select('*').eq('employee_id', employee.id)
      .eq('status', 'active').order('expiry_date', { ascending: true })
      .then(({ data }) => { if (data) setDocs(data) })
  }, [employee])

  const getStatus = (expiry?: string) => {
    if (!expiry) return null
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
    if (days < 0)   return { days, label: `منتهية منذ ${n(Math.abs(days))} يوم`, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', icon: AlertTriangle }
    if (days <= 30) return { days, label: `تنتهي خلال ${n(days)} يوم`, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock }
    return { days, label: `${n(days)} يوم متبقي`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle }
  }

  const expired  = docs.filter(d => { const s = getStatus(d.expiry_date); return s && s.days < 0 })
  const expiring = docs.filter(d => { const s = getStatus(d.expiry_date); return s && s.days >= 0 && s.days <= 30 })

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Alerts */}
      {(expired.length > 0 || expiring.length > 0) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={16} color="#d97706" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>تنبيهات الوثائق</span>
          </div>
          {expired.length > 0 && <p style={{ fontSize: 12, color: '#e11d48', margin: '0 0 3px' }}>• {n(expired.length)} وثيقة منتهية الصلاحية</p>}
          {expiring.length > 0 && <p style={{ fontSize: 12, color: '#d97706', margin: 0 }}>• {n(expiring.length)} وثيقة تنتهي خلال ٣٠ يوم</p>}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'إجمالي',       val: n(docs.length),    color: '#2563eb' },
          { label: 'تنتهي قريباً', val: n(expiring.length), color: '#d97706' },
          { label: 'منتهية',       val: n(expired.length),  color: '#e11d48' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>{s.val}</p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: '3px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Documents List */}
      {docs.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13, margin: 0 }}>لا توجد وثائق مضافة</p>
          <p style={{ fontSize: 11, margin: '4px 0 0' }}>تواصل مع الإدارة لإضافة وثائقك</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => {
            const status = getStatus(doc.expiry_date)
            return (
              <div key={doc.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${status?.border || '#e2e8f0'}`, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} color="#2563eb" />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{doc.document_name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{DOC_LABELS[doc.document_type] || doc.document_type}</p>
                    </div>
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none', background: '#eff6ff', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                      عرض
                    </a>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {doc.document_number && (
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 2px' }}>رقم الوثيقة</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0, fontFamily: 'monospace' }}>{doc.document_number}</p>
                    </div>
                  )}
                  {doc.issue_date && (
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 2px' }}>تاريخ الإصدار</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>{new Date(doc.issue_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  )}
                  {doc.expiry_date && (
                    <div style={{ background: status?.bg || '#f8fafc', borderRadius: 8, padding: '8px 10px', gridColumn: doc.document_number && doc.issue_date ? 'span 2' : 'auto' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 2px' }}>تاريخ الانتهاء</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>{new Date(doc.expiry_date).toLocaleDateString('ar-SA')}</p>
                        {status && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: status.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <status.icon size={11} /> {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
