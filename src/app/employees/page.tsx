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

const STATUS_TABS = [
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
    <div className="page-wrapper">
      <Topbar
        title="الموظفون"
        subtitle={`${employees.length} موظف`}
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setSelected(null); setShowForm(true) }}>
            موظف جديد
          </Button>
        }
      />

      <div className="p-6 space-y-4">

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الرقم..."
              className="search-input w-56"
            />
          </div>
          <div className="tab-group">
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`tab-item ${tab === t.value ? 'tab-item-active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th w-10 px-4"><input type="checkbox" className="rounded accent-brand-600" /></th>
                {['الموظف', 'الرقم الوظيفي', 'القسم', 'المسمى الوظيفي', 'تاريخ التعيين', 'نوع العقد', 'الحالة', ''].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="h-6 bg-surface-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <UserX size={36} className="mb-2 opacity-20" />
                      <p className="text-sm">لا يوجد موظفون</p>
                      <button onClick={() => setShowForm(true)} className="text-xs text-brand-600 hover:underline mt-1">
                        إضافة أول موظف
                      </button>
                    </div>
                  </td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="table-row group">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded accent-brand-600" /></td>
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar w-8 h-8 text-sm">
                        {emp.photo_url
                          ? <img src={emp.photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                          : emp.first_name[0]
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td font-mono text-gray-500 text-xs">{emp.employee_number}</td>
                  <td className="table-td text-gray-600">{emp.department?.name_ar || '—'}</td>
                  <td className="table-td text-gray-600">{emp.job_position?.title_ar || '—'}</td>
                  <td className="table-td text-gray-500">{formatDate(emp.hire_date)}</td>
                  <td className="table-td">
                    <span className="badge badge-gray">{getStatusLabel(emp.contract_type)}</span>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${getStatusColor(emp.status)}`}>{getStatusLabel(emp.status)}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewing(emp)} className="p-1.5 hover:bg-surface-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => { setSelected(emp); setShowForm(true) }} className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-600 transition">
                        <Edit size={14} />
                      </button>
                      <button onClick={async () => { if (confirm('إنهاء خدمة هذا الموظف؟')) { await employeesApi.delete(emp.id); load() } }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                        <UserX size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length > 0 && (
            <div className="px-4 py-3 border-t border-surface-200 flex items-center justify-between bg-surface-50">
              <p className="text-xs text-gray-400">إجمالي {employees.length} موظف</p>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 text-xs border border-surface-200 rounded-lg hover:bg-white transition text-gray-500">السابق</button>
                <span className="px-2.5 py-1 text-xs bg-brand-600 text-white rounded-lg">1</span>
                <button className="px-2.5 py-1 text-xs border border-surface-200 rounded-lg hover:bg-white transition text-gray-500">التالي</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setSelected(null) }}
        title={selected ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'} size="xl">
        <EmployeeForm employee={selected} onSave={() => { setShowForm(false); setSelected(null); load() }} onCancel={() => { setShowForm(false); setSelected(null) }} />
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="ملف الموظف" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
              <div className="avatar w-14 h-14 text-xl bg-brand-600 text-white">{viewing.first_name[0]}</div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{viewing.first_name} {viewing.last_name}</h3>
                <p className="text-sm text-gray-500">{viewing.job_position?.title_ar || '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getStatusColor(viewing.status)}`}>{getStatusLabel(viewing.status)}</span>
                  <span className="text-xs text-gray-400 font-mono">{viewing.employee_number}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['البريد الإلكتروني', viewing.email],
                ['الهاتف', viewing.phone || '—'],
                ['القسم', viewing.department?.name_ar || '—'],
                ['تاريخ التعيين', formatDate(viewing.hire_date)],
                ['نوع العقد', getStatusLabel(viewing.contract_type)],
                ['الجنسية', viewing.nationality || '—'],
                ['رقم الهوية', viewing.national_id || '—'],
                ['الراتب الأساسي', viewing.basic_salary ? `${viewing.basic_salary.toLocaleString()} ر.س` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{k}</p>
                  <p className="text-sm font-semibold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" icon={<Edit size={13} />}
                onClick={() => { setViewing(null); setSelected(viewing); setShowForm(true) }}>
                تعديل
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
