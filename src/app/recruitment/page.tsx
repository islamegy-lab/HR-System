'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Users, Calendar, MapPin } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { recruitmentApi } from '@/lib/api'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { RecruitmentJob, JobApplication } from '@/types'
import { supabase } from '@/lib/supabase'

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<RecruitmentJob[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string; name_ar?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showApps, setShowApps] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', department_id: '', positions_count: 1, description: '', requirements: '', deadline: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await recruitmentApi.getJobs()
    if (data) setJobs(data as RecruitmentJob[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    supabase.from('departments').select('*').then(({ data }) => { if (data) setDepartments(data) })
  }, [])

  const handleSaveJob = async () => {
    setSaving(true)
    await recruitmentApi.createJob({ ...form, status: 'open' })
    setSaving(false)
    setShowJobForm(false)
    load()
  }

  const loadApplications = async (jobId: string) => {
    const { data } = await recruitmentApi.getApplications(jobId)
    if (data) setApplications(data as JobApplication[])
    setShowApps(jobId)
  }

  const stages = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected']
  const stageColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700',
    screening: 'bg-blue-100 text-blue-700',
    interview: 'bg-yellow-100 text-yellow-700',
    offer: 'bg-purple-100 text-purple-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <Topbar title="التوظيف" subtitle={`${jobs.filter(j => j.status === 'open').length} وظيفة مفتوحة`} />
      <div className="p-6 space-y-4">

        <div className="flex justify-end">
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowJobForm(true)}>إضافة وظيفة</Button>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.department?.name_ar || job.department?.name}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.positions_count} مقعد</span>
                    {job.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(job.deadline)}</span>}
                  </div>

                  {job.description && <p className="text-xs text-gray-500 mb-4 line-clamp-2">{job.description}</p>}

                  <div className="flex gap-2">
                    <button onClick={() => loadApplications(job.id)}
                      className="flex-1 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
                      المتقدمون ({job.applications_count || 0})
                    </button>
                    {job.status === 'open' && (
                      <button onClick={() => recruitmentApi.updateJob(job.id, { status: 'closed' }).then(load)}
                        className="py-1.5 px-3 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
                        إغلاق
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      <Modal open={showJobForm} onClose={() => setShowJobForm(false)} title="إضافة وظيفة جديدة" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="المسمى الوظيفي *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Select
              label="القسم"
              value={form.department_id}
              onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
              options={departments.map(d => ({ value: d.id, label: d.name_ar || d.name }))}
            />
            <Input label="عدد المقاعد" type="number" value={form.positions_count} onChange={e => setForm(f => ({ ...f, positions_count: Number(e.target.value) }))} />
            <Input label="آخر موعد للتقديم" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">وصف الوظيفة</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">المتطلبات</label>
            <textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowJobForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSaveJob}>نشر الوظيفة</Button>
          </div>
        </div>
      </Modal>

      {/* Applications Modal */}
      <Modal open={!!showApps} onClose={() => setShowApps(null)} title="المتقدمون للوظيفة" size="xl">
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا يوجد متقدمون بعد</p>
          ) : applications.map(app => (
            <div key={app.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                {app.applicant_name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{app.applicant_name}</p>
                <p className="text-xs text-gray-500">{app.email} · {app.phone}</p>
              </div>
              <select
                value={app.stage}
                onChange={async e => { await recruitmentApi.updateApplicationStage(app.id, e.target.value); loadApplications(showApps!) }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 ${stageColors[app.stage]}`}
              >
                {stages.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
