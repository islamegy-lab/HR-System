'use client'
import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'
import { getStatusColor, getStatusLabel } from '@/lib/utils'

const n = (v: number) => v.toLocaleString('ar-SA')
const curr = (v: number) => {
  try { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v) }
  catch { return `${n(v)} ر.س` }
}
const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

export default function EmployeePayslipsPage() {
  const { employee } = useEmployeeAuth()
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!employee) return
    supabase.from('payroll').select('*').eq('employee_id', employee.id)
      .order('year', { ascending: false }).order('month', { ascending: false })
      .then(({ data }) => {
        if (data) { setPayrolls(data); if (data.length) setSelected(data[0]) }
      })
  }, [employee])

  if (!selected) return (
    <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', paddingTop: 60 }}>
      <DollarSign size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
      <p style={{ fontSize: 13 }}>لا توجد كشوف رواتب بعد</p>
    </div>
  )

  const allowances = (selected.housing_allowance||0) + (selected.transport_allowance||0) + (selected.other_allowances||0) + (selected.overtime_pay||0)
  const deductions = (selected.deductions||0) + (selected.tax||0)

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Month Selector */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {payrolls.map(p => (
          <button key={p.id} onClick={() => setSelected(p)} style={{
            padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Cairo, sans-serif',
            background: selected?.id === p.id ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : '#fff',
            color: selected?.id === p.id ? '#fff' : '#475569',
            boxShadow: selected?.id === p.id ? '0 2px 8px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {MONTHS[p.month - 1]} {n(p.year)}
          </button>
        ))}
      </div>

      {/* Net Salary Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 18, padding: '24px 20px', color: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '0 0 8px' }}>
          {MONTHS[selected.month - 1]} {n(selected.year)} · <span className={`badge`} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 10 }}>{getStatusLabel(selected.status)}</span>
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>صافي الراتب</p>
        <p style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>{curr(selected.net_salary)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={11} /> إجمالي الإضافات
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{curr(selected.basic_salary + allowances)}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingDown size={11} /> إجمالي الخصومات
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{curr(deductions)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>تفاصيل الراتب</span>
        </div>

        {/* Earnings */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', margin: '0 0 10px', textTransform: 'uppercase' as const }}>الإضافات</p>
          {[
            { label: 'الراتب الأساسي',  val: selected.basic_salary },
            { label: 'بدل السكن',        val: selected.housing_allowance },
            { label: 'بدل النقل',        val: selected.transport_allowance },
            { label: 'بدلات أخرى',       val: selected.other_allowances },
            { label: 'أجر إضافي',        val: selected.overtime_pay },
          ].filter(r => r.val > 0).map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{curr(r.val)}</span>
            </div>
          ))}
        </div>

        {/* Deductions */}
        {deductions > 0 && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', margin: '0 0 10px' }}>الخصومات</p>
            {[
              { label: 'خصومات', val: selected.deductions },
              { label: 'ضريبة',  val: selected.tax },
            ].filter(r => r.val > 0).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e11d48' }}>({curr(r.val)})</span>
              </div>
            ))}
          </div>
        )}

        {/* Net */}
        <div style={{ padding: '14px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>صافي الراتب</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>{curr(selected.net_salary)}</span>
        </div>
      </div>

    </div>
  )
}
