'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CalendarDays, DollarSign, FileText, CheckCircle, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'

const n = (v: number) => v.toLocaleString('ar-SA')
const curr = (v: number, c = 'SAR') => {
  try { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(v) }
  catch { return `${n(v)} ${c}` }
}

export default function EmployeeDashboard() {
  const { employee, loading } = useEmployeeAuth()
  const router = useRouter()
  const [stats, setStats]   = useState({ present: 0, absent: 0, leaves: 0, pendingLeaves: 0 })
  const [payslip, setPayslip] = useState<any>(null)
  const [leaves, setLeaves]   = useState<any[]>([])
  const [docs, setDocs]       = useState<any[]>([])
  const [todayAtt, setTodayAtt] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!employee) return
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().getMonth() + 1
    const thisYear  = new Date().getFullYear()

    Promise.all([
      // حضور هذا الشهر
      supabase.from('attendance').select('status').eq('employee_id', employee.id)
        .gte('date', `${thisYear}-${String(thisMonth).padStart(2,'0')}-01`),
      // آخر راتب
      supabase.from('payroll').select('*').eq('employee_id', employee.id)
        .order('created_at', { ascending: false }).limit(1).single(),
      // آخر 3 طلبات إجازة
      supabase.from('leave_requests').select('*, leave_type:leave_types(name_ar)')
        .eq('employee_id', employee.id).order('created_at', { ascending: false }).limit(3),
      // وثائق تنتهي قريباً
      supabase.from('employee_documents').select('*').eq('employee_id', employee.id)
        .eq('status', 'active').not('expiry_date', 'is', null)
        .lte('expiry_date', new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0])
        .order('expiry_date'),
      // حضور اليوم
      supabase.from('attendance').select('*').eq('employee_id', employee.id).eq('date', today).single(),
    ]).then(([att, pay, lv, dc, todayRec]) => {
      const attData = att.data || []
      setStats({
        present:      attData.filter((a: any) => a.status === 'present').length,
        absent:       attData.filter((a: any) => a.status === 'absent').length,
        leaves:       attData.filter((a: any) => a.status === 'on_leave').length,
        pendingLeaves: (lv.data || []).filter((l: any) => l.status === 'pending').length,
      })
      if (pay.data) setPayslip(pay.data)
      setLeaves(lv.data || [])
      setDocs(dc.data || [])
      setTodayAtt(todayRec.data || null)
      setDataLoading(false)
    })
  }, [employee])

  if (loading || !employee) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: `bounce 1s ${i*0.15}s infinite` }} />)}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  )

  const today = new Date()
  const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Welcome */}
      <div style={{ borderRadius: 18, padding: '20px 20px', color: '#fff', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#1e3a8a,#2563eb,#3b82f6)' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' }}>
          {today.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>مرحباً، {employee.first_name} 👋</h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
          {employee.job_position?.title_ar || ''} · {employee.department?.name_ar || ''}
        </p>

        {/* Today attendance status */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>حضور اليوم</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{fmtTime(todayAtt?.check_in)}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>انصراف اليوم</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{fmtTime(todayAtt?.check_out)}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>ساعات العمل</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              {todayAtt?.work_hours ? `${Number(todayAtt.work_hours).toLocaleString('ar-SA', { maximumFractionDigits: 1 })} س` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'أيام الحضور', value: n(stats.present), icon: CheckCircle, bg: '#f0fdf4', ic: '#16a34a' },
          { label: 'أيام الغياب',  value: n(stats.absent),  icon: AlertTriangle, bg: '#fff1f2', ic: '#e11d48' },
          { label: 'أيام الإجازة', value: n(stats.leaves),  icon: CalendarDays,  bg: '#fffbeb', ic: '#d97706' },
          { label: 'طلبات معلقة',  value: n(stats.pendingLeaves), icon: Clock, bg: '#eff6ff', ic: '#2563eb' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.ic} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '3px 0 0' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* آخر راتب */}
      {payslip && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 18, borderRadius: 99, background: '#7c3aed' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>آخر راتب</span>
            </div>
            <button onClick={() => router.push('/employee/payslips')} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Cairo, sans-serif' }}>
              عرض الكل <ArrowLeft size={11} />
            </button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][payslip.month - 1]} {n(payslip.year)}
              </span>
              <span className={`badge ${getStatusColor(payslip.status)}`}>{getStatusLabel(payslip.status)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { label: 'الأساسي',  val: payslip.basic_salary },
                { label: 'البدلات',  val: (payslip.housing_allowance||0)+(payslip.transport_allowance||0)+(payslip.other_allowances||0) },
                { label: 'الصافي',   val: payslip.net_salary, highlight: true },
              ].map(r => (
                <div key={r.label} style={{ background: r.highlight ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : '#f8fafc', borderRadius: 10, padding: '10px 12px', border: r.highlight ? 'none' : '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 10, color: r.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8', margin: '0 0 3px' }}>{r.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: r.highlight ? '#fff' : '#0f172a', margin: 0 }}>{curr(r.val)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* آخر طلبات الإجازة */}
      {leaves.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 18, borderRadius: 99, background: '#d97706' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>طلبات الإجازة</span>
            </div>
            <button onClick={() => router.push('/employee/leaves')} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Cairo, sans-serif' }}>
              عرض الكل <ArrowLeft size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leaves.map((l, i) => (
              <div key={l.id} style={{ padding: '12px 16px', borderBottom: i < leaves.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{l.leave_type?.name_ar}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{formatDate(l.start_date)} — {formatDate(l.end_date)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{n(l.days_count)} يوم</span>
                  <span className={`badge ${getStatusColor(l.status)}`}>{getStatusLabel(l.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تنبيهات الوثائق */}
      {docs.length > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: 16, border: '1px solid #fde68a', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#d97706" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>وثائق تنتهي قريباً</span>
          </div>
          {docs.map(d => {
            const days = Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / 86400000)
            return (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fef3c7' }}>
                <span style={{ fontSize: 12, color: '#78350f' }}>{d.document_name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: days <= 0 ? '#e11d48' : '#d97706' }}>
                  {days <= 0 ? 'منتهية' : `${n(days)} يوم`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'تسجيل الحضور', href: '/employee/attendance', icon: Clock,        bg: '#eff6ff', ic: '#2563eb' },
          { label: 'طلب إجازة',    href: '/employee/leaves',     icon: CalendarDays, bg: '#fffbeb', ic: '#d97706' },
          { label: 'كشف الراتب',   href: '/employee/payslips',   icon: DollarSign,   bg: '#faf5ff', ic: '#7c3aed' },
          { label: 'وثائقي',       href: '/employee/documents',  icon: FileText,     bg: '#f0fdf4', ic: '#16a34a' },
        ].map(q => (
          <button key={q.href} onClick={() => router.push(q.href)} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textAlign: 'right', fontFamily: 'Cairo, sans-serif',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <q.icon size={18} color={q.ic} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{q.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
