'use client'
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, DollarSign, TrendingUp, Users, Printer } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { CardHeader, StatCard, Avatar, EmptyState, pageStyle, bodyStyle, cardStyle, thStyle, tdStyle } from '@/components/ui/PageComponents'
import { payrollApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatCurrency } from '@/lib/utils'
import type { Payroll } from '@/types'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await payrollApi.getAll({ month, year })
    if (data) setPayrolls(data as Payroll[])
    setLoading(false)
  }, [month, year])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => { setGenerating(true); await payrollApi.generateMonthly(month, year); setGenerating(false); load() }
  const handlePay = async (id: string) => { await payrollApi.update(id, { status: 'paid', paid_at: new Date().toISOString() }); load() }

  const totalNet   = payrolls.reduce((s, p) => s + p.net_salary, 0)
  const totalBasic = payrolls.reduce((s, p) => s + p.basic_salary, 0)
  const paidCount  = payrolls.filter(p => p.status === 'paid').length

  const selectStyle = { padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none', cursor: 'pointer' }

  return (
    <div style={pageStyle}>
      <Topbar title="الرواتب" subtitle={`${MONTHS[month - 1]} ${year}`}
        actions={<>
          <Button variant="outline" size="sm" icon={<Printer size={13} />}
            onClick={() => window.open(`/payroll/print?month=${month}&year=${year}`, '_blank')}>
            طباعة الكشف
          </Button>
          <Button variant="outline" size="sm" icon={<RefreshCw size={13} />} loading={generating} onClick={handleGenerate}>توليد الرواتب</Button>
        </>} />

      <div style={bodyStyle}>

        <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>الفترة</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={selectStyle}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <StatCard label="إجمالي الأساسي" value={formatCurrency(totalBasic)} icon={DollarSign} bg="#eff6ff" ic="#2563eb" delay={0} />
          <StatCard label="إجمالي الصافي"  value={formatCurrency(totalNet)}   icon={TrendingUp} bg="#f0fdf4" ic="#16a34a" delay={60} />
          <StatCard label="تم الصرف"        value={`${paidCount} / ${payrolls.length}`} icon={Users} bg="#faf5ff" ic="#7c3aed" delay={120} />
        </div>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="كشف الرواتب"
            right={<span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{payrolls.length} موظف</span>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['الموظف','القسم','الأساسي','بدل السكن','بدل النقل','إضافي','خصومات','ضريبة','الصافي','الحالة',''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={11} style={{ padding: '10px 16px' }}><div className="shimmer" style={{ height: 20, borderRadius: 8 }} /></td></tr>
                )) : payrolls.length === 0 ? (
                  <tr><td colSpan={11}>
                    <EmptyState icon={DollarSign} text="لا توجد رواتب لهذه الفترة"
                      action={<button onClick={handleGenerate} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>اضغط لتوليد الرواتب</button>} />
                  </td></tr>
                ) : payrolls.map(p => (
                  <tr key={p.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={p.employee?.first_name || '؟'} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.employee?.first_name} {p.employee?.last_name}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{p.employee?.employee_number}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: 12 }}>{(p.employee as any)?.department?.name_ar || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(p.basic_salary)}</td>
                    <td style={tdStyle}>{formatCurrency(p.housing_allowance)}</td>
                    <td style={tdStyle}>{formatCurrency(p.transport_allowance)}</td>
                    <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 600 }}>{formatCurrency(p.overtime_pay)}</td>
                    <td style={{ ...tdStyle, color: '#e11d48' }}>{formatCurrency(p.deductions)}</td>
                    <td style={{ ...tdStyle, color: '#e11d48' }}>{formatCurrency(p.tax)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb', fontSize: 14 }}>{formatCurrency(p.net_salary)}</td>
                    <td style={tdStyle}><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    <td style={tdStyle}>
                      {p.status !== 'paid' && (
                        <button onClick={() => handlePay(p.id)}
                          style={{ padding: '5px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          صرف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {payrolls.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                    <td colSpan={2} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569' }}>الإجمالي</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{formatCurrency(totalBasic)}</td>
                    <td colSpan={5} />
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{formatCurrency(totalNet)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
