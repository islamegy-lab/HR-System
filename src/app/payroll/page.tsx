'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Download, RefreshCw, DollarSign } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { payrollApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatCurrency } from '@/lib/utils'
import type { Payroll } from '@/types'

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

  const handleGenerate = async () => {
    setGenerating(true)
    await payrollApi.generateMonthly(month, year)
    setGenerating(false)
    load()
  }

  const handlePay = async (id: string) => {
    await payrollApi.update(id, { status: 'paid', paid_at: new Date().toISOString() })
    load()
  }

  const totalNet = payrolls.reduce((s, p) => s + p.net_salary, 0)
  const totalBasic = payrolls.reduce((s, p) => s + p.basic_salary, 0)

  const months = [
    'يناير','فبراير','مارس','أبريل','مايو','يونيو',
    'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
  ]

  return (
    <div>
      <Topbar title="الرواتب" subtitle={`${months[month - 1]} ${year}`} />
      <div className="p-6 space-y-4">

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} loading={generating} onClick={handleGenerate}>
              توليد الرواتب
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'إجمالي الرواتب الأساسية', value: formatCurrency(totalBasic), color: 'bg-blue-500' },
            { label: 'إجمالي الصافي', value: formatCurrency(totalNet), color: 'bg-green-500' },
            { label: 'عدد الموظفين', value: payrolls.length, color: 'bg-purple-500' },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['الموظف', 'القسم', 'الراتب الأساسي', 'بدل السكن', 'بدل النقل', 'الإضافي', 'الخصومات', 'الضريبة', 'الصافي', 'الحالة', 'إجراء'].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
                ) : payrolls.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-12 text-gray-400">لا توجد رواتب. اضغط "توليد الرواتب" أولاً</td></tr>
                ) : payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">
                          {p.employee?.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.employee?.first_name} {p.employee?.last_name}</p>
                          <p className="text-xs text-gray-400">{p.employee?.employee_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(p.employee as any)?.department?.name_ar || '—'}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.basic_salary)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.housing_allowance)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.transport_allowance)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(p.overtime_pay)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(p.deductions)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(p.tax)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(p.net_salary)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status !== 'paid' && (
                        <button onClick={() => handlePay(p.id)}
                          className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium">
                          صرف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
