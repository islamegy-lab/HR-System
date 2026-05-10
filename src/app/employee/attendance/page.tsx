'use client'
import { useEffect, useState } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, Loader2, LogIn, LogOut, AlertTriangle, User } from 'lucide-react'
import { authApi, attendanceApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Employee, Attendance, AttendanceLocation } from '@/types'

type Step = 'login' | 'loading' | 'portal'

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function EmployeeAttendancePage() {
  const [step, setStep] = useState<Step>('login')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null)
  const [locations, setLocations] = useState<AttendanceLocation[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'out_of_range'>('idle')
  const [geoMsg, setGeoMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionDone, setActionDone] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    attendanceApi.getLocations().then(({ data }) => { if (data) setLocations(data as AttendanceLocation[]) })
  }, [])

  const loadTodayRecord = async (empId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('attendance').select('*').eq('employee_id', empId).eq('date', today).single()
    setTodayRecord(data as Attendance | null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginError('')
    const { error, data } = await authApi.signIn(email, password)
    if (error || !data.user) { setLoginError('البريد أو كلمة المرور غير صحيحة'); setLoginLoading(false); return }
    setStep('loading')
    const { data: emp } = await authApi.getEmployeeByUserId(data.user.id)
    if (!emp) { setLoginError('لم يتم ربط هذا الحساب بموظف'); setStep('login'); setLoginLoading(false); return }
    setEmployee(emp as Employee)
    await loadTodayRecord(emp.id)
    setStep('portal')
    setLoginLoading(false)
  }

  const getLocation = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }))

  const checkInRange = (lat: number, lng: number) => {
    if (locations.length === 0) return { inRange: true, locationName: 'غير محدد', distance: 0 }
    for (const loc of locations) {
      const dist = calcDistance(lat, lng, loc.latitude, loc.longitude)
      if (dist <= loc.radius_meters) return { inRange: true, locationName: loc.name, distance: Math.round(dist) }
    }
    const nearest = locations[0]
    const dist = calcDistance(lat, lng, nearest.latitude, nearest.longitude)
    return { inRange: false, locationName: nearest.name, distance: Math.round(dist) }
  }

  const handleCheckIn = async () => {
    if (!employee) return
    setGeoStatus('loading'); setGeoMsg('جاري تحديد موقعك...')
    try {
      const pos = await getLocation()
      const { latitude: lat, longitude: lng } = pos.coords
      const { inRange, locationName, distance } = checkInRange(lat, lng)
      if (!inRange) {
        setGeoStatus('out_of_range')
        setGeoMsg(`أنت خارج نطاق العمل (${distance} متر من ${locationName})`)
        return
      }
      setGeoStatus('success'); setGeoMsg(`تم تحديد موقعك — ${locationName} (${distance} متر)`)
      setActionLoading(true)
      const today = new Date().toISOString().split('T')[0]
      await attendanceApi.upsert({
        employee_id: employee.id, date: today,
        check_in: new Date().toISOString(), status: 'present',
        check_in_lat: lat, check_in_lng: lng, location_verified: true
      })
      await loadTodayRecord(employee.id)
      setActionDone('تم تسجيل حضورك بنجاح ✓')
      setActionLoading(false)
    } catch {
      setGeoStatus('error'); setGeoMsg('تعذّر تحديد موقعك. يرجى السماح بالوصول للموقع')
    }
  }

  const handleCheckOut = async () => {
    if (!employee || !todayRecord) return
    setGeoStatus('loading'); setGeoMsg('جاري تحديد موقعك...')
    try {
      const pos = await getLocation()
      const { latitude: lat, longitude: lng } = pos.coords
      const { inRange, locationName, distance } = checkInRange(lat, lng)
      if (!inRange) {
        setGeoStatus('out_of_range')
        setGeoMsg(`أنت خارج نطاق العمل (${distance} متر من ${locationName})`)
        return
      }
      setGeoStatus('success'); setGeoMsg(`تم تحديد موقعك — ${locationName}`)
      setActionLoading(true)
      const checkOut = new Date().toISOString()
      const workHours = todayRecord.check_in
        ? (new Date(checkOut).getTime() - new Date(todayRecord.check_in).getTime()) / 3600000
        : 0
      await attendanceApi.upsert({
        ...todayRecord,
        check_out: checkOut, work_hours: workHours,
        check_out_lat: lat, check_out_lng: lng
      })
      await loadTodayRecord(employee.id)
      setActionDone('تم تسجيل انصرافك بنجاح ✓')
      setActionLoading(false)
    } catch {
      setGeoStatus('error'); setGeoMsg('تعذّر تحديد موقعك')
    }
  }

  const handleLogout = async () => { await authApi.signOut(); setStep('login'); setEmployee(null); setTodayRecord(null); setActionDone('') }

  const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'

  // LOGIN SCREEN
  if (step === 'login') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e3a8a,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
            <Clock size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>بوابة الموظف</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>تسجيل الحضور والانصراف</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loginError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: 12, color: '#f87171' }}>{loginError}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@company.com"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
            <button type="submit" disabled={loginLoading} style={{ padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loginLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري الدخول...</> : 'دخول'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // LOADING
  if (step === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // PORTAL
  const checkedIn  = !!todayRecord?.check_in
  const checkedOut = !!todayRecord?.check_out

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>بوابة الموظف</p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>تسجيل الحضور والانصراف</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <LogOut size={13} /> خروج
        </button>
      </div>

      <div style={{ flex: 1, padding: 20, maxWidth: 480, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Employee Card */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 20, padding: 24, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
              {employee?.first_name?.[0]}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800 }}>{employee?.first_name} {employee?.last_name}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{employee?.job_position?.title_ar || employee?.department?.name_ar}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1, fontFamily: 'monospace' }}>{employee?.employee_number}</p>
            </div>
          </div>
          {/* Clock */}
          <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 16 }}>
            <p style={{ fontSize: 42, fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {/* Today summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>وقت الحضور</p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{fmtTime(todayRecord?.check_in)}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>وقت الانصراف</p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{fmtTime(todayRecord?.check_out)}</p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {actionDone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
            <CheckCircle size={18} color="#16a34a" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#15803d' }}>{actionDone}</span>
          </div>
        )}

        {/* Geo Status */}
        {geoStatus !== 'idle' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
            background: geoStatus === 'success' ? '#f0fdf4' : geoStatus === 'out_of_range' ? '#fffbeb' : geoStatus === 'error' ? '#fff1f2' : '#eff6ff',
            border: `1px solid ${geoStatus === 'success' ? '#bbf7d0' : geoStatus === 'out_of_range' ? '#fde68a' : geoStatus === 'error' ? '#fecdd3' : '#bfdbfe'}`
          }}>
            {geoStatus === 'loading' && <Loader2 size={16} color="#2563eb" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
            {geoStatus === 'success' && <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />}
            {geoStatus === 'out_of_range' && <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />}
            {geoStatus === 'error' && <XCircle size={16} color="#e11d48" style={{ flexShrink: 0 }} />}
            <span style={{ fontSize: 13, fontWeight: 500, color: geoStatus === 'success' ? '#15803d' : geoStatus === 'out_of_range' ? '#92400e' : geoStatus === 'error' ? '#9f1239' : '#1d4ed8' }}>
              {geoMsg}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!checkedIn && (
            <button onClick={handleCheckIn} disabled={actionLoading}
              style={{ padding: '16px 0', borderRadius: 16, fontSize: 16, fontWeight: 700, background: actionLoading ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: actionLoading ? 'none' : '0 4px 16px rgba(22,163,74,0.35)', transition: 'all 0.2s' }}>
              {actionLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><MapPin size={20} /> تسجيل الحضور</>}
            </button>
          )}
          {checkedIn && !checkedOut && (
            <button onClick={handleCheckOut} disabled={actionLoading}
              style={{ padding: '16px 0', borderRadius: 16, fontSize: 16, fontWeight: 700, background: actionLoading ? '#94a3b8' : 'linear-gradient(135deg,#e11d48,#f43f5e)', color: '#fff', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: actionLoading ? 'none' : '0 4px 16px rgba(225,29,72,0.35)', transition: 'all 0.2s' }}>
              {actionLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><MapPin size={20} /> تسجيل الانصراف</>}
            </button>
          )}
          {checkedIn && checkedOut && (
            <div style={{ padding: '16px 0', borderRadius: 16, background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <CheckCircle size={22} color="#16a34a" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                تم تسجيل الحضور والانصراف — {todayRecord?.work_hours?.toFixed(1)} ساعة عمل
              </span>
            </div>
          )}
        </div>

        {/* Location info */}
        {locations.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="#2563eb" /> مواقع العمل المعتمدة
            </p>
            {locations.map(loc => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{loc.name}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>نطاق مسموح: {loc.radius_meters} متر</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
