'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Users, Calendar, Briefcase } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { pageStyle, bodyStyle, cardStyle, EmptyState, Avatar } from '@/components/ui/PageComponents'
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
  useEffect(() => { supabase.from('departments').select('*').then(({ data }) => { if (data) setDepartments(data) }) }, [])

  const handleSaveJob = async () => {
    setSaving(true)
    await recruitmentApi.createJob({ ...form, status: 'open' })
    setSaving(false); setShowJobForm(false); load()
  }

  const loadApplications = async (jobId: string) => {
    const { data } = await recruitmentApi.getApplications(jobId)
    if (data) setApplications(data as JobApplication[])
    setShowApps(jobId)
  }

  const stages = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected']
  const stageStyle: Record<string, { bg: string; color: string }> = {
    new:       { bg: '#f1f5f9', color: '#475569' },
    screening: { bg: '#eff6ff', color: '#2563eb' },
    interview: { bg: '#fffbeb', color: '#d97706' },
    offer:     { bg: '#faf5ff', color: '#7c3aed' },
    hired:     { bg: '#f0fdf4', color: '#16a34a' },
    rejected:  { bg: '#fff1f2', color: '#e11d48' },
  }

  return (
    <div style={pageStyle}>
      <Topbar title="التوظيف" subtitle={`${jobs.filter(j => j.status === 'open').length} وظيفة مفتوحة`}
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowJobForm(true)}>إضافة وظيفة</Button>} />

      <div style={bodyStyle}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 180, borderRadius: 16 }} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div style={cardStyle}><EmptyState icon={Briefcase} text="لا توجد وظائف"
            action={<button onClick={() => setShowJobForm(true)} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>إضافة أول وظيفة</button>} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {jobs.map((job, i) => (
              <div key={job.id} className="card slide-up" style={{ padding: 20, animationDelay: `${i * 50}ms` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={18} color="#2563eb" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{job.title}</h3>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{job.department?.name_ar || job.department?.name}</p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(job.status)}`}>{getStatusLabel(job.status)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                    <Users size={11} /> {job.positions_count} مقعد
                  </span>
                  {job.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, background: '#f8fafc', color: '#64748b', padding: '4px 10px', borderRadius: 8 }}>
                      <Calendar size={11} /> {formatDate(job.deadline)}
                    </span>
                  )}
                </div>
                {job.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => loadApplications(job.id)} style={{ flex: 1, padding: '8px 0', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    المتقدمون ({job.applications_count || 0})
                  </button>
                  {job.status === 'open' && (
                    <button onClick={() => recruitmentApi.updateJob(job.id, { status: 'closed' }).then(load)}
                      style={{ padding: '8px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      إغلاق
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showJobForm} onClose={() => setShowJobForm(false)} title="إضافة وظيفة جديدة" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="المسمى الوظيفي *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Select label="القسم" value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
              options={departments.map(d => ({ value: d.id, label: d.name_ar || d.name }))} />
            <Input label="عدد المقاعد" type="number" value={form.positions_count} onChange={e => setForm(f => ({ ...f, positions_count: Number(e.target.value) }))} />
            <Input label="آخر موعد للتقديم" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          {[{ key: 'description', label: 'وصف الوظيفة' }, { key: 'requirements', label: 'المتطلبات' }].map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{f.label}</label>
              <textarea value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} rows={3}
                style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowJobForm(false)}>إلغاء</Button>
            <Button loading={saving} onClick={handleSaveJob}>نشر الوظيفة</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showApps} onClose={() => setShowApps(null)} title="المتقدمون للوظيفة" size="xl">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: 13 }}>لا يوجد متقدمون بعد</p>
          ) : applications.map(app => (
            <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <Avatar name={app.applicant_name} size={40} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{app.applicant_name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{app.email} · {app.phone}</p>
              </div>
              <select value={app.stage}
                onChange={async e => { await recruitmentApi.updateApplicationStage(app.id, e.target.value); loadApplications(showApps!) }}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', background: stageStyle[app.stage]?.bg, color: stageStyle[app.stage]?.color }}>
                {stages.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
