'use client'
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, DollarSign, TrendingUp, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="الرواتب" subtitle={`${MONTHS[month - 1]} ${year}`}
        actions={<Button variant="outline" size="sm" icon={<RefreshCw size={13} />} loading={generating} onClick={handleGenerate}>توليد الرواتب</Button>} />

      <div className="p-6 space-y-4">
        {/* Period */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">الفترة</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'إجمالي الأساسي', value: formatCurrency(totalBasic), icon: DollarSign, bg: 'bg-blue-50',   ic: 'text-blue-600' },
            { label: 'إجمالي الصافي',  value: formatCurrency(totalNet),   icon: TrendingUp, bg: 'bg-green-50',  ic: 'text-green-600' },
            { label: 'تم الصرف',       value: `${paidCount} / ${payrolls.length}`, icon: Users, bg: 'bg-indigo-50', ic: 'text-indigo-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}><s.icon size={20} className={s.ic} /></div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['الموظف','القسم','الأساسي','بدل السكن','بدل النقل','إضافي','خصومات','ضريبة','الصافي','الحالة',''].map(h => (
                  <th key={h} className="text-right text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={11} className="px-4 py-3"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={11}>
                  <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                    <DollarSign size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">لا توجد رواتب لهذه الفترة</p>
                    <button onClick={handleGenerate} className="text-xs text-indigo-600 hover:underline mt-1">اضغط لتوليد الرواتب</button>
                  </div>
                </td></tr>
              ) : payrolls.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">{p.employee?.first_name?.[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.employee?.first_name} {p.employee?.last_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.employee?.employee_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{(p.employee as any)?.department?.name_ar || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(p.basic_salary)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.housing_allowance)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.transport_allowance)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(p.overtime_pay)}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{formatCurrency(p.deductions)}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{formatCurrency(p.tax)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-700">{formatCurrency(p.net_salary)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status !== 'paid' && (
                      <button onClick={() => handlePay(p.id)} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition border border-green-200">صرف</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {payrolls.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={2} className="px-4 py-3 text-xs font-bold text-gray-600">الإجمالي</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(totalBasic)}</td>
                  <td colSpan={5} />
                  <td className="px-4 py-3 text-sm font-bold text-indigo-700">{formatCurrency(totalNet)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
