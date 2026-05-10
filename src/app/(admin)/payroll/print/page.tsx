'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Printer, X } from 'lucide-react'
import { payrollApi, companyApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Payroll, CompanySettings } from '@/types'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

export default function PayrollPrintPage() {
  const params  = useSearchParams()
  const month   = Number(params.get('month')) || new Date().getMonth() + 1
  const year    = Number(params.get('year'))  || new Date().getFullYear()

  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [company,  setCompany]  = useState<CompanySettings | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      payrollApi.getAll({ month, year }),
      companyApi.get(),
    ]).then(([p, c]) => {
      if (p.data) setPayrolls(p.data as Payroll[])
      if (c.data) setCompany(c.data as CompanySettings)
      setLoading(false)
    })
  }, [month, year])

  const totalBasic     = payrolls.reduce((s, p) => s + p.basic_salary, 0)
  const totalHousing   = payrolls.reduce((s, p) => s + (p.housing_allowance || 0), 0)
  const totalTransport = payrolls.reduce((s, p) => s + (p.transport_allowance || 0), 0)
  const totalOther     = payrolls.reduce((s, p) => s + (p.other_allowances || 0), 0)
  const totalOvertime  = payrolls.reduce((s, p) => s + (p.overtime_pay || 0), 0)
  const totalDeduct    = payrolls.reduce((s, p) => s + (p.deductions || 0), 0)
  const totalTax       = payrolls.reduce((s, p) => s + (p.tax || 0), 0)
  const totalNet       = payrolls.reduce((s, p) => s + p.net_salary, 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Cairo, sans-serif' }}>
      <p>جاري التحميل...</p>
    </div>
  )

  return (
    <>
      {/* أزرار التحكم - لا تُطبع */}
      <div className="no-print" style={{
        position: 'fixed', top: 16, left: 16, display: 'flex', gap: 10, zIndex: 100
      }}>
        <button onClick={() => window.print()} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
        }}>
          <Printer size={16} /> طباعة
        </button>
        <button onClick={() => window.close()} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
          borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif'
        }}>
          <X size={16} /> إغلاق
        </button>
      </div>

      {/* صفحة الطباعة */}
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '40px 40px 60px',
        fontFamily: 'Cairo, sans-serif', background: '#fff', minHeight: '100vh',
        direction: 'rtl'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '3px solid #1d4ed8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {company?.logo_url && (
              <img src={company.logo_url} style={{ width: 70, height: 70, objectFit: 'contain' }} alt="logo" />
            )}
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {company?.name_ar || 'شركتي'}
              </h1>
              {company?.name_en && <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>{company.name_en}</p>}
              {company?.address && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{company.city ? `${company.city} - ` : ''}{company.address}</p>}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>كشف الرواتب</p>
              <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>{MONTHS[month - 1]} {year}</p>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
              تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        {/* Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'عدد الموظفين', value: payrolls.length },
            { label: 'إجمالي الرواتب الأساسية', value: formatCurrency(totalBasic) },
            { label: 'إجمالي البدلات', value: formatCurrency(totalHousing + totalTransport + totalOther) },
            { label: 'إجمالي الصافي', value: formatCurrency(totalNet), highlight: true },
          ].map(s => (
            <div key={s.label} style={{
              padding: '12px 16px', borderRadius: 10,
              background: s.highlight ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : '#f8fafc',
              border: s.highlight ? 'none' : '1px solid #e2e8f0'
            }}>
              <p style={{ fontSize: 10, color: s.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: s.highlight ? '#fff' : '#0f172a', margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1d4ed8', color: '#fff' }}>
              {['#', 'الموظف', 'الرقم الوظيفي', 'القسم', 'الأساسي', 'بدل السكن', 'بدل النقل', 'بدلات أخرى', 'إضافي', 'خصومات', 'ضريبة', 'الصافي', 'الحالة'].map((h, i) => (
                <th key={i} style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '9px 8px', color: '#94a3b8', fontSize: 11 }}>{i + 1}</td>
                <td style={{ padding: '9px 8px', fontWeight: 600, color: '#0f172a' }}>
                  {p.employee?.first_name} {p.employee?.last_name}
                </td>
                <td style={{ padding: '9px 8px', fontFamily: 'monospace', color: '#64748b', fontSize: 11 }}>{p.employee?.employee_number}</td>
                <td style={{ padding: '9px 8px', color: '#64748b' }}>{(p.employee as any)?.department?.name_ar || '—'}</td>
                <td style={{ padding: '9px 8px', fontWeight: 600 }}>{formatCurrency(p.basic_salary)}</td>
                <td style={{ padding: '9px 8px', color: '#2563eb' }}>{formatCurrency(p.housing_allowance)}</td>
                <td style={{ padding: '9px 8px', color: '#2563eb' }}>{formatCurrency(p.transport_allowance)}</td>
                <td style={{ padding: '9px 8px', color: '#2563eb' }}>{formatCurrency(p.other_allowances)}</td>
                <td style={{ padding: '9px 8px', color: '#16a34a', fontWeight: 600 }}>{formatCurrency(p.overtime_pay)}</td>
                <td style={{ padding: '9px 8px', color: '#e11d48' }}>{formatCurrency(p.deductions)}</td>
                <td style={{ padding: '9px 8px', color: '#e11d48' }}>{formatCurrency(p.tax)}</td>
                <td style={{ padding: '9px 8px', fontWeight: 800, color: '#1d4ed8', fontSize: 13 }}>{formatCurrency(p.net_salary)}</td>
                <td style={{ padding: '9px 8px' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                    background: p.status === 'paid' ? '#f0fdf4' : '#fffbeb',
                    color: p.status === 'paid' ? '#16a34a' : '#d97706',
                    border: `1px solid ${p.status === 'paid' ? '#bbf7d0' : '#fde68a'}`
                  }}>
                    {p.status === 'paid' ? 'مدفوع' : 'مسودة'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#1e3a8a', color: '#fff', fontWeight: 700 }}>
              <td colSpan={4} style={{ padding: '11px 8px', fontSize: 13 }}>الإجمالي</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalBasic)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalHousing)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalTransport)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalOther)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalOvertime)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalDeduct)}</td>
              <td style={{ padding: '11px 8px' }}>{formatCurrency(totalTax)}</td>
              <td style={{ padding: '11px 8px', fontSize: 15 }}>{formatCurrency(totalNet)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, marginTop: 60 }}>
          {['مدير الموارد البشرية', 'المدير المالي', 'المدير العام'].map(title => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #cbd5e1', marginBottom: 8, paddingBottom: 40 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{title}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>التوقيع والختم</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 10, color: '#94a3b8' }}>
            {company?.name_ar} · {company?.phone || ''} · {company?.email || ''}
          </p>
          <p style={{ fontSize: 10, color: '#94a3b8' }}>
            مشغّل بواسطة دُكَّانِي · v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 15mm; size: A4 landscape; }
        }
      `}</style>
    </>
  )
}
