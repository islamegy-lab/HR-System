'use client'
import { useEffect, useState } from 'react'
import { MapPin, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react'
import { useEmployeeAuth } from '@/lib/EmployeeAuthContext'
import { supabase } from '@/lib/supabase'
import { attendanceApi } from '@/lib/api'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Attendance, AttendanceLocation } from '@/types'

const n = (v: number) => v.toLocaleString('ar-SA')

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function EmployeeAttendancePage() {
  const { employee } = useEmployeeAuth()
  const [records, setRecords]     = useState<Attendance[]>([])
  const [locations, setLocations] = useState<AttendanceLocation[]>([])
  const [todayRec, setTodayRec]   = useState<Attendance | null>(null)
  const [time, setTime]           = useState(new Date())
  const [geoStatus, setGeoStatus] = useState<'idle'|'loading'|'ok'|'error'|'range'>('idle')
  const [geoMsg, setGeoMsg]       = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [done, setDone]           = useState('')

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const load = async () => {
    if (!employee) return
    const today = new Date().toISOString().split('T')[0]
    const [recs, locs, today_rec] = await Promise.all([
      supabase.from('attendance').select('*').eq('employee_id', employee.id).order('date', { ascending: false }).limit(20),
      attendanceApi.getLocations(),
      supabase.from('attendance').select('*').eq('employee_id', employee.id).eq('date', today).single(),
    ])
    if (recs.data)      setRecords(recs.data as Attendance[])
    if (locs.data)      setLocations(locs.data as AttendanceLocation[])
    if (today_rec.data) setTodayRec(today_rec.data as Attendance)
    else setTodayRec(null)
  }

  useEffect(() => { load() }, [employee])

  const getPos = (): Promise<GeolocationPosition> =>
    new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 }))

  const checkRange = (lat: number, lng: number) => {
    if (!locations.length) return { ok: true, name: 'غير محدد', dist: 0 }
    for (const loc of locations) {
      const d = calcDistance(lat, lng, loc.latitude, loc.longitude)
      if (d <= loc.radius_meters) return { ok: true, name: loc.name, dist: Math.round(d) }
    }
    const d = calcDistance(lat, lng, locations[0].latitude, locations[0].longitude)
    return { ok: false, name: locations[0].name, dist: Math.round(d) }
  }

  const handleCheckIn = async () => {
    if (!employee) return
    setGeoStatus('loading'); setGeoMsg('جاري تحديد موقعك...')
    try {
      const pos = await getPos()
      const { latitude: lat, longitude: lng } = pos.coords
      const { ok, name, dist } = checkRange(lat, lng)
      if (!ok) { setGeoStatus('range'); setGeoMsg(`أنت خارج نطاق العمل — ${n(dist)} متر من ${name}`); return }
      setGeoStatus('ok'); setGeoMsg(`✓ ${name}`)
      setActionLoading(true)
      const today = new Date().toISOString().split('T')[0]
      await attendanceApi.upsert({ employee_id: employee.id, date: today, check_in: new Date().toISOString(), status: 'present', check_in_lat: lat, check_in_lng: lng, location_verified: true })
      setDone('تم تسجيل حضورك بنجاح ✓')
      await load(); setActionLoading(false)
    } catch { setGeoStatus('error'); setGeoMsg('تعذّر تحديد موقعك — تأكد من السماح بالوصول') }
  }

  const handleCheckOut = async () => {
    if (!employee || !todayRec) return
    setGeoStatus('loading'); setGeoMsg('جاري تحديد موقعك...')
    try {
      const pos = await getPos()
      const { latitude: lat, longitude: lng } = pos.coords
      const { ok, name, dist } = checkRange(lat, lng)
      if (!ok) { setGeoStatus('range'); setGeoMsg(`أنت خارج نطاق العمل — ${n(dist)} متر من ${name}`); return }
      setGeoStatus('ok'); setGeoMsg(`✓ ${name}`)
      setActionLoading(true)
      const checkOut = new Date().toISOString()
      const wh = todayRec.check_in ? (new Date(checkOut).getTime() - new Date(todayRec.check_in).getTime()) / 3600000 : 0
      await attendanceApi.upsert({ ...todayRec, check_out: checkOut, work_hours: wh, check_out_lat: lat, check_out_lng: lng })
      setDone('تم تسجيل انصرافك بنجاح ✓')
      await load(); setActionLoading(false)
    } catch { setGeoStatus('error'); setGeoMsg('تعذّر تحديد موقعك') }
  }

  const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
  const checkedIn  = !!todayRec?.check_in
  const checkedOut = !!todayRec?.check_out

  const thisMonth = records.filter(r => r.date?.startsWith(new Date().toISOString().slice(0,7)))
  const presentCount = thisMonth.filter(r => r.status === 'present').length
  const absentCount  = thisMonth.filter(r => r.status === 'absent').length
  const totalHours   = thisMonth.reduce((s, r) => s + (r.work_hours || 0), 0)

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Clock */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 18, padding: '20px 20px', color: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>
          {time.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p style={{ fontSize: 40, fontWeight: 800, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
          {time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
          {[
            { label: 'الحضور',   val: fmtTime(todayRec?.check_in) },
            { label: 'الانصراف', val: fmtTime(todayRec?.check_out) },
            { label: 'ساعات العمل', val: todayRec?.work_hours ? `${Number(todayRec.work_hours).toLocaleString('ar-SA', { maximumFractionDigits: 1 })} س` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Geo Status */}
      {geoStatus !== 'idle' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
          background: geoStatus === 'ok' ? '#f0fdf4' : geoStatus === 'range' ? '#fffbeb' : geoStatus === 'error' ? '#fff1f2' : '#eff6ff',
          border: `1px solid ${geoStatus === 'ok' ? '#bbf7d0' : geoStatus === 'range' ? '#fde68a' : geoStatus === 'error' ? '#fecdd3' : '#bfdbfe'}`
        }}>
          {geoStatus === 'loading' && <Loader2 size={15} color="#2563eb" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
          {geoStatus === 'ok'      && <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0 }} />}
          {geoStatus === 'range'   && <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0 }} />}
          {geoStatus === 'error'   && <XCircle size={15} color="#e11d48" style={{ flexShrink: 0 }} />}
          <span style={{ fontSize: 12, fontWeight: 500, color: geoStatus === 'ok' ? '#15803d' : geoStatus === 'range' ? '#92400e' : geoStatus === 'error' ? '#9f1239' : '#1d4ed8' }}>
            {geoMsg}
          </span>
        </div>
      )}

      {/* Done message */}
      {done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
          <CheckCircle size={16} color="#16a34a" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{done}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!checkedIn && (
        <button onClick={handleCheckIn} disabled={actionLoading} style={{
          padding: '16px 0', borderRadius: 14, fontSize: 15, fontWeight: 700,
          background: actionLoading ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#22c55e)',
          color: '#fff', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: actionLoading ? 'none' : '0 4px 14px rgba(22,163,74,0.35)',
          fontFamily: 'Cairo, sans-serif'
        }}>
          {actionLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={18} />}
          تسجيل الحضور
        </button>
      )}
      {checkedIn && !checkedOut && (
        <button onClick={handleCheckOut} disabled={actionLoading} style={{
          padding: '16px 0', borderRadius: 14, fontSize: 15, fontWeight: 700,
          background: actionLoading ? '#94a3b8' : 'linear-gradient(135deg,#e11d48,#f43f5e)',
          color: '#fff', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: actionLoading ? 'none' : '0 4px 14px rgba(225,29,72,0.35)',
          fontFamily: 'Cairo, sans-serif'
        }}>
          {actionLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={18} />}
          تسجيل الانصراف
        </button>
      )}
      {checkedIn && checkedOut && (
        <div style={{ padding: '16px 0', borderRadius: 14, background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <CheckCircle size={20} color="#16a34a" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>
            تم تسجيل الحضور والانصراف · {Number(todayRec?.work_hours || 0).toLocaleString('ar-SA', { maximumFractionDigits: 1 })} ساعة
          </span>
        </div>
      )}

      {/* Monthly Stats */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '0 0 12px' }}>إحصائيات هذا الشهر</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'أيام الحضور', val: n(presentCount), color: '#16a34a' },
            { label: 'أيام الغياب',  val: n(absentCount),  color: '#e11d48' },
            { label: 'إجمالي الساعات', val: `${totalHours.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} س`, color: '#2563eb' },
          ].map(s => (
            <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0 }}>{s.val}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: '3px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>سجل الحضور</span>
        </div>
        {records.slice(0, 10).map((r, i) => (
          <div key={r.id} style={{ padding: '12px 16px', borderBottom: i < 9 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {new Date(r.date).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                {fmtTime(r.check_in)} — {fmtTime(r.check_out)}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {r.work_hours && <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{Number(r.work_hours).toLocaleString('ar-SA', { maximumFractionDigits: 1 })} س</span>}
              <span className={`badge ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
