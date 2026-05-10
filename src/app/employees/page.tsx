'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye, Edit, UserX, Download, Filter } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { Employee } from '@/types'
import { EmployeeForm } from './EmployeeForm'

const statusTabs = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'on_leave', label: 'في إجازة' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'terminated', label: 'منتهي' },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await employeesApi.getAll({ search, status: statusFilter || undefined })
    if (data) setEmployees(data as Employee[])
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  const handleSave = () => { setShowForm(false); setSelected(null); load() }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Topbar
        title="الموظفون"
        subtitle={`${employees.length} موظف`}
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setSelected(null); setShowForm(true) }} size="sm">
            موظف جديد
          </Button>
        }
      />

      <div className="p-6 space-y-4">

        {/* Filters Bar - Odoo style */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الرقم أو البريد..."
              className="w-full pr-8 pl-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#875bf7] bg-gray-50 focus:bg-white transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {statusTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${statusFilter === tab.value ? 'bg-white shadow text-[#875bf7]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mr-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <Filter className="w-3.5 h-3.5" /> فلترة
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <Download className="w-3.5 h-3.5" /> تصدير
            </button>
          </div>
        </div>

        {/* Table - Odoo style */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300 accent-[#875bf7]" />
                  </th>
                  {['الموظف', 'الرقم الوظيفي', 'القسم', 'المسمى الوظيفي', 'تاريخ التعيين', 'نوع العقد', 'الحالة', ''].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={9} className="px-4 py-3">
                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <UserX className="w-10 h-10 opacity-30" />
                        <p className="text-sm">لا يوجد موظفون</p>
                        <button onClick={() => setShowForm(true)} className="text-xs text-[#875bf7] hover:underline mt-1">إضافة أول موظف</button>
                      </div>
                    </td>
                  </tr>
                ) : employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-[#f8f9fb] transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300 accent-[#875bf7]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#f3eeff] rounded-full flex items-center justify-center text-[#875bf7] font-bold text-sm shrink-0">
                          {emp.photo_url
                            ? <img src={emp.photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                            : emp.first_name[0]
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{emp.employee_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department?.name_ar || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.job_position?.title_ar || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(emp.hire_date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{getStatusLabel(emp.contract_type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(emp.status)}`}>
                        {getStatusLabel(emp.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewEmployee(emp)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600" title="عرض">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setSelected(emp); setShowForm(true) }} className="p-1.5 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-600" title="تعديل">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={async () => { if (confirm('هل تريد إنهاء خدمة هذا الموظف؟')) { await employeesApi.delete(emp.id); load() } }} className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500" title="إنهاء الخدمة">
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {employees.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">إجمالي {employees.length} موظف</p>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition text-gray-500">السابق</button>
                <span className="px-3 py-1 text-xs bg-[#875bf7] text-white rounded">1</span>
                <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition text-gray-500">التالي</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setSelected(null) }} title={selected ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'} size="xl">
        <EmployeeForm employee={selected} onSave={handleSave} onCancel={() => { setShowForm(false); setSelected(null) }} />
      </Modal>

      <Modal open={!!viewEmployee} onClose={() => setViewEmployee(null)} title="ملف الموظف" size="lg">
        {viewEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-[#f3eeff] rounded-xl">
              <div className="w-16 h-16 bg-[#875bf7] rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {viewEmployee.first_name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewEmployee.first_name} {viewEmployee.last_name}</h3>
                <p className="text-sm text-gray-500">{viewEmployee.job_position?.title_ar || '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(viewEmployee.status)}`}>
                    {getStatusLabel(viewEmployee.status)}
                  </span>
                  <span className="text-xs text-gray-400">{viewEmployee.employee_number}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['البريد الإلكتروني', viewEmployee.email],
                ['الهاتف', viewEmployee.phone || '—'],
                ['القسم', viewEmployee.department?.name_ar || '—'],
                ['تاريخ التعيين', formatDate(viewEmployee.hire_date)],
                ['نوع العقد', getStatusLabel(viewEmployee.contract_type)],
                ['الجنسية', viewEmployee.nationality || '—'],
                ['رقم الهوية', viewEmployee.national_id || '—'],
                ['الراتب الأساسي', viewEmployee.basic_salary ? `${viewEmployee.basic_salary.toLocaleString()} ر.س` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setViewEmployee(null); setSelected(viewEmployee); setShowForm(true) }}>
                <Edit className="w-3.5 h-3.5" /> تعديل
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
