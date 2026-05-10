'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Filter, Eye, Edit, UserX } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { employeesApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { Employee } from '@/types'
import { EmployeeForm } from './EmployeeForm'

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
    <div>
      <Topbar title="الموظفون" subtitle={`${employees.length} موظف`} />
      <div className="p-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الرقم..."
                className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="on_leave">في إجازة</option>
              <option value="terminated">منتهي</option>
            </select>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setSelected(null); setShowForm(true) }}>
            إضافة موظف
          </Button>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">الموظف</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الرقم الوظيفي</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">القسم</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المسمى الوظيفي</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">تاريخ التعيين</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">نوع العقد</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">لا يوجد موظفون</td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                          {emp.photo_url
                            ? <img src={emp.photo_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                            : emp.first_name[0]
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.employee_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department?.name_ar || emp.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.job_position?.title_ar || emp.job_position?.title || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(emp.hire_date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{getStatusLabel(emp.contract_type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(emp.status)}`}>
                        {getStatusLabel(emp.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewEmployee(emp)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelected(emp); setShowForm(true) }} className="p-1.5 hover:bg-blue-50 rounded-lg transition text-blue-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={async () => { await employeesApi.delete(emp.id); load() }} className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500">
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setSelected(null) }} title={selected ? 'تعديل موظف' : 'إضافة موظف جديد'} size="xl">
        <EmployeeForm employee={selected} onSave={handleSave} onCancel={() => { setShowForm(false); setSelected(null) }} />
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewEmployee} onClose={() => setViewEmployee(null)} title="بيانات الموظف" size="lg">
        {viewEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 text-2xl font-bold">
                {viewEmployee.first_name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewEmployee.first_name} {viewEmployee.last_name}</h3>
                <p className="text-gray-500">{viewEmployee.job_position?.title_ar}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(viewEmployee.status)}`}>
                  {getStatusLabel(viewEmployee.status)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['الرقم الوظيفي', viewEmployee.employee_number],
                ['البريد الإلكتروني', viewEmployee.email],
                ['الهاتف', viewEmployee.phone || '—'],
                ['القسم', viewEmployee.department?.name_ar || '—'],
                ['تاريخ التعيين', formatDate(viewEmployee.hire_date)],
                ['نوع العقد', getStatusLabel(viewEmployee.contract_type)],
                ['الجنسية', viewEmployee.nationality || '—'],
                ['الراتب الأساسي', viewEmployee.basic_salary ? `${viewEmployee.basic_salary} ر.س` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
