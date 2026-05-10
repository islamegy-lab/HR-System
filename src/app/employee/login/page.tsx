'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { ADMIN_ROLES } from '@/lib/EmployeeAuthContext'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('يرجى إدخال البريد وكلمة المرور'); return }
    setLoading(true); setError('')

    const { error: err, data } = await authApi.signIn(email, password)
    if (err || !data.user) {
      setError('البريد أو كلمة المرور غير صحيحة')
      setLoading(false); return
    }

    // جلب دور الموظف من قاعدة البيانات
    const { data: emp } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    const role = emp?.role || 'employee'

    // توجيه حسب الدور
    if (ADMIN_ROLES.includes(role)) {
      router.push('/dashboard')
    } else {
      router.push('/employee')
    }
    router.refresh()
  }

  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden', fontFamily: 'Cairo, sans-serif'
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
            <Clock size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>بوابة الموظف</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>سجّل دخولك لمتابعة بياناتك</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
                <AlertCircle size={14} color="#f87171" />
                <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@company.com"
                style={{ padding: '11px 14px', borderRadius: 11, fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: 'Cairo, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 11, fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', boxSizing: 'border-box', fontFamily: 'Cairo, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '12px 0', borderRadius: 11, fontSize: 14, fontWeight: 700,
              background: loading ? 'rgba(37,99,235,0.4)' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Cairo, sans-serif', boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)'
            }}>
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري التحقق...</> : 'دخول'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            لوحة الإدارة ←
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>مشغّل بواسطة</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa' }}>دُكَّانِي</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>⎇ v{version}</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
