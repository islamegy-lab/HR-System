'use client'
import { useEffect, useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { pageStyle, bodyStyle, cardStyle, CardHeader } from '@/components/ui/PageComponents'
import {
  Save, Building2, Globe, Bell, Shield, CheckCircle,
  MapPin, Plus, Upload, Image, Trash2
} from 'lucide-react'
import { attendanceApi, companyApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { AttendanceLocation, CompanySettings } from '@/types'

export default function SettingsPage() {
  const [company, setCompany]     = useState<CompanySettings | null>(null)
  const [companyId, setCompanyId] = useState('')
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name_ar: '', name_en: '', phone: '', email: '',
    address: '', city: '', country: 'المملكة العربية السعودية',
    website: '', tax_number: '', commercial_reg: '',
    currency: 'SAR', logo_url: ''
  })

  useEffect(() => {
    companyApi.get().then(({ data }) => {
      if (data) {
        const c = data as CompanySettings
        setCompany(c); setCompanyId(c.id)
        setForm({
          name_ar: c.name_ar || '', name_en: c.name_en || '',
          phone: c.phone || '', email: c.email || '',
          address: c.address || '', city: c.city || '',
          country: c.country || 'المملكة العربية السعودية',
          website: c.website || '', tax_number: c.tax_number || '',
          commercial_reg: c.commercial_reg || '',
          currency: c.currency || 'SAR', logo_url: c.logo_url || ''
        })
      }
    })
  }, [])

  const handleSave = async () => {
    if (!companyId) return
    setSaving(true)
    await companyApi.update(companyId, form)
    setSaved(true); setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const { url, error } = await companyApi.uploadLogo(file)
    if (url) {
      setForm(f => ({ ...f, logo_url: url }))
      if (companyId) await companyApi.update(companyId, { logo_url: url })
    }
    setLogoUploading(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div style={pageStyle}>
      <Topbar title="الإعدادات" />
      <div style={{ ...bodyStyle, maxWidth: 800 }}>

        {/* بيانات الشركة */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="بيانات الشركة" color="#2563eb" />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* اللوغو */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 90, height: 90, borderRadius: 16, border: '2px dashed #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f8fafc', overflow: 'hidden', flexShrink: 0, cursor: 'pointer'
              }} onClick={() => logoRef.current?.click()}>
                {form.logo_url
                  ? <img src={form.logo_url} style={{ width: 90, height: 90, objectFit: 'contain' }} alt="logo" />
                  : <Image size={28} color="#cbd5e1" />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>شعار الشركة</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>PNG أو JPG · يظهر في التقارير والقائمة الجانبية</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="outline" icon={<Upload size={13} />}
                    loading={logoUploading} onClick={() => logoRef.current?.click()}>
                    {logoUploading ? 'جاري الرفع...' : 'رفع الشعار'}
                  </Button>
                  {form.logo_url && (
                    <Button size="sm" variant="ghost" icon={<Trash2 size={13} />}
                      onClick={() => setForm(f => ({ ...f, logo_url: '' }))}>
                      حذف
                    </Button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="اسم الشركة (عربي) *" value={form.name_ar} onChange={set('name_ar')} />
              <Input label="اسم الشركة (إنجليزي)" value={form.name_en} onChange={set('name_en')} />
              <Input label="البريد الإلكتروني" value={form.email} onChange={set('email')} type="email" />
              <Input label="رقم الهاتف" value={form.phone} onChange={set('phone')} />
              <Input label="الموقع الإلكتروني" value={form.website} onChange={set('website')} />
              <Input label="الرقم الضريبي" value={form.tax_number} onChange={set('tax_number')} />
              <Input label="السجل التجاري" value={form.commercial_reg} onChange={set('commercial_reg')} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>العملة</label>
                <select value={form.currency} onChange={set('currency')}
                  style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none' }}>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="KWD">دينار كويتي (KWD)</option>
                </select>
              </div>
              <Input label="المدينة" value={form.city} onChange={set('city')} />
              <div style={{ gridColumn: 'span 2' }}>
                <Input label="العنوان" value={form.address} onChange={set('address')} />
              </div>
            </div>
          </div>
        </div>

        {/* إعدادات النظام */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="إعدادات النظام" color="#7c3aed" />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'اللغة الافتراضية', opts: [['ar','العربية'],['en','English']] },
              { label: 'المنطقة الزمنية', opts: [['Asia/Riyadh','توقيت الرياض (GMT+3)'],['Africa/Cairo','توقيت القاهرة (GMT+2)'],['Asia/Dubai','توقيت دبي (GMT+4)']] },
              { label: 'بداية أسبوع العمل', opts: [['sunday','الأحد'],['monday','الاثنين']] },
              { label: 'تنسيق التاريخ', opts: [['ar-SA','عربي (١٤٤٦/٠١/٠١)'],['en-GB','ميلادي (01/01/2025)']] },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{s.label}</label>
                <select style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none' }}>
                  {s.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* مواقع الحضور */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="مواقع الحضور الجغرافية" color="#16a34a" />
          <div style={{ padding: 20 }}>
            <LocationSettings />
          </div>
        </div>

        {/* الإشعارات */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="الإشعارات" color="#d97706" />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              'إشعار عند تقديم طلب إجازة جديد',
              'إشعار عند الموافقة على الإجازة',
              'تذكير بمواعيد الرواتب',
              'إشعار عند إضافة موظف جديد',
              'تنبيه انتهاء صلاحية الوثائق',
              'تقرير أسبوعي للحضور',
            ].map(item => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                <span style={{ fontSize: 13, color: '#334155' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* الأمان */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="الأمان" color="#e11d48" />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" />
            <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
          <Button icon={saved ? <CheckCircle size={15} /> : <Save size={14} />}
            loading={saving} onClick={handleSave}
            style={saved ? { background: 'linear-gradient(135deg,#059669,#10b981)' } : {}}>
            {saved ? 'تم الحفظ بنجاح ✓' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ===== Location Settings Component =====
function LocationSettings() {
  const [locs, setLocs]   = useState<AttendanceLocation[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm]   = useState({ name: '', latitude: '', longitude: '', radius_meters: '200' })

  const load = () => attendanceApi.getLocations().then(({ data }) => { if (data) setLocs(data as AttendanceLocation[]) })
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.latitude || !form.longitude) return
    setSaving(true)
    await attendanceApi.saveLocation({
      name: form.name,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius_meters: parseInt(form.radius_meters),
      is_active: true
    })
    setForm({ name: '', latitude: '', longitude: '', radius_meters: '200' })
    await load(); setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('attendance_locations').delete().eq('id', id)
    load()
  }

  const handleGetMyLocation = () => {
    navigator.geolocation.getCurrentPosition(pos =>
      setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }))
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {locs.length === 0 && (
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>لا توجد مواقع مضافة بعد</p>
      )}
      {locs.map(loc => (
        <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={16} color="#16a34a" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{loc.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
              {loc.latitude}, {loc.longitude} — نطاق {loc.radius_meters}م
            </p>
          </div>
          <button onClick={() => handleDelete(loc.id)}
            style={{ padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94a3b8' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="اسم الموقع *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="المقر الرئيسي" />
        <Input label="نطاق الحضور (متر)" type="number" value={form.radius_meters} onChange={e => setForm(f => ({ ...f, radius_meters: e.target.value }))} />
        <Input label="خط العرض (Latitude)" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="24.7136" />
        <Input label="خط الطول (Longitude)" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="46.6753" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="outline" icon={<MapPin size={13} />} onClick={handleGetMyLocation}>
          استخدم موقعي الحالي
        </Button>
        <Button size="sm" icon={<Plus size={13} />} loading={saving} onClick={handleAdd}>
          إضافة موقع
        </Button>
      </div>
    </div>
  )
}
