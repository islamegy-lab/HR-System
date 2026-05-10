'use client'
import { useEffect, useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Save, CheckCircle, MapPin, Plus, Upload, Trash2,
  Building2, Globe, Bell, Shield, ImageIcon
} from 'lucide-react'
import { attendanceApi, companyApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { AttendanceLocation, CompanySettings } from '@/types'

// ─── Section Card ────────────────────────────────────────────────
function Section({ title, color, icon: Icon, children }: {
  title: string; color: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
        background: '#fafafa'
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

// ─── Select Field ─────────────────────────────────────────────────
function SelectField({ label, value, onChange, options }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: [string, string][]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</label>
      <select value={value} onChange={onChange} style={{
        padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10,
        fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none',
        cursor: 'pointer', transition: 'border-color 0.2s'
      }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function SettingsPage() {
  const [companyId, setCompanyId]         = useState('')
  const [saved, setSaved]                 = useState(false)
  const [saving, setSaving]               = useState(false)
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
      if (!data) return
      const c = data as CompanySettings
      setCompanyId(c.id)
      setForm({
        name_ar: c.name_ar || '', name_en: c.name_en || '',
        phone: c.phone || '', email: c.email || '',
        address: c.address || '', city: c.city || '',
        country: c.country || 'المملكة العربية السعودية',
        website: c.website || '', tax_number: c.tax_number || '',
        commercial_reg: c.commercial_reg || '',
        currency: c.currency || 'SAR', logo_url: c.logo_url || ''
      })
    })
  }, [])

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

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
    const { url } = await companyApi.uploadLogo(file)
    if (url) {
      setForm(f => ({ ...f, logo_url: url }))
      if (companyId) await companyApi.update(companyId, { logo_url: url })
    }
    setLogoUploading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Topbar title="الإعدادات" />

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, width: '100%' }}>

        {/* ── بيانات الشركة ── */}
        <Section title="بيانات الشركة" color="#2563eb" icon={Building2}>

          {/* اللوغو */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 0 20px', borderBottom: '1px solid #f1f5f9', marginBottom: 20 }}>
            <div
              onClick={() => logoRef.current?.click()}
              style={{
                width: 88, height: 88, borderRadius: 16, flexShrink: 0,
                border: form.logo_url ? '2px solid #e2e8f0' : '2px dashed #cbd5e1',
                background: form.logo_url ? '#fff' : '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = form.logo_url ? '#e2e8f0' : '#cbd5e1')}
            >
              {form.logo_url
                ? <img src={form.logo_url} style={{ width: 88, height: 88, objectFit: 'contain' }} alt="logo" />
                : <ImageIcon size={26} color="#cbd5e1" />}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>شعار الشركة</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                PNG أو JPG · يظهر في القائمة الجانبية والتقارير المطبوعة
              </p>
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

          {/* الحقول */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="اسم الشركة (عربي) *" value={form.name_ar} onChange={set('name_ar')} />
            <Input label="اسم الشركة (إنجليزي)" value={form.name_en} onChange={set('name_en')} />
            <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={set('email')} />
            <Input label="رقم الهاتف" value={form.phone} onChange={set('phone')} />
            <Input label="الموقع الإلكتروني" value={form.website} onChange={set('website')} />
            <Input label="الرقم الضريبي" value={form.tax_number} onChange={set('tax_number')} />
            <Input label="السجل التجاري" value={form.commercial_reg} onChange={set('commercial_reg')} />
            <SelectField label="العملة" value={form.currency} onChange={set('currency')}
              options={[['SAR','ريال سعودي (SAR)'],['AED','درهم إماراتي (AED)'],['USD','دولار أمريكي (USD)'],['EGP','جنيه مصري (EGP)'],['KWD','دينار كويتي (KWD)']]} />
            <Input label="المدينة" value={form.city} onChange={set('city')} />
            <Input label="الدولة" value={form.country} onChange={set('country')} />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="العنوان التفصيلي" value={form.address} onChange={set('address')} />
            </div>
          </div>
        </Section>

        {/* ── إعدادات النظام ── */}
        <Section title="إعدادات النظام" color="#7c3aed" icon={Globe}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SelectField label="اللغة الافتراضية" value="ar" onChange={() => {}}
              options={[['ar','العربية'],['en','English']]} />
            <SelectField label="المنطقة الزمنية" value="Asia/Riyadh" onChange={() => {}}
              options={[['Asia/Riyadh','توقيت الرياض (GMT+3)'],['Africa/Cairo','توقيت القاهرة (GMT+2)'],['Asia/Dubai','توقيت دبي (GMT+4)']]} />
            <SelectField label="بداية أسبوع العمل" value="sunday" onChange={() => {}}
              options={[['sunday','الأحد'],['monday','الاثنين']]} />
            <SelectField label="تنسيق التاريخ" value="ar-SA" onChange={() => {}}
              options={[['ar-SA','هجري (١٤٤٦/٠١/٠١)'],['en-GB','ميلادي (01/01/2025)']]} />
          </div>
        </Section>

        {/* ── مواقع الحضور ── */}
        <Section title="مواقع الحضور الجغرافية" color="#16a34a" icon={MapPin}>
          <LocationSettings />
        </Section>

        {/* ── الإشعارات ── */}
        <Section title="الإشعارات" color="#d97706" icon={Bell}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[
              'إشعار عند تقديم طلب إجازة جديد',
              'إشعار عند الموافقة على الإجازة',
              'تذكير بمواعيد الرواتب',
              'إشعار عند إضافة موظف جديد',
              'تنبيه انتهاء صلاحية الوثائق',
              'تقرير أسبوعي للحضور',
            ].map(item => (
              <label key={item} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer'
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#2563eb', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#334155' }}>{item}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* ── الأمان ── */}
        <Section title="تغيير كلمة المرور" color="#e11d48" icon={Shield}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" />
            <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
          </div>
        </Section>

        {/* ── Save Button ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
          <Button
            icon={saved ? <CheckCircle size={15} /> : <Save size={14} />}
            loading={saving} onClick={handleSave}
            style={saved ? { background: 'linear-gradient(135deg,#059669,#10b981)' } : {}}>
            {saved ? 'تم الحفظ بنجاح ✓' : 'حفظ الإعدادات'}
          </Button>
        </div>

      </div>
    </div>
  )
}

// ─── Location Settings ────────────────────────────────────────────
function LocationSettings() {
  const [locs, setLocs]     = useState<AttendanceLocation[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState({ name: '', latitude: '', longitude: '', radius_meters: '200' })

  const load = () =>
    attendanceApi.getLocations().then(({ data }) => { if (data) setLocs(data as AttendanceLocation[]) })

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

  const handleGetMyLocation = () =>
    navigator.geolocation.getCurrentPosition(pos =>
      setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }))
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* قائمة المواقع */}
      {locs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
          لا توجد مواقع مضافة بعد
        </div>
      ) : locs.map(loc => (
        <div key={loc.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', background: '#f8fafc',
          borderRadius: 10, border: '1px solid #e2e8f0'
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={16} color="#16a34a" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{loc.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>
              {loc.latitude}, {loc.longitude} · نطاق {loc.radius_meters} متر
            </p>
          </div>
          <button onClick={() => handleDelete(loc.id)} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', color: '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94a3b8' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {/* إضافة موقع جديد */}
      <div style={{ paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 12 }}>إضافة موقع جديد</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="اسم الموقع *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="المقر الرئيسي" />
          <Input label="نطاق الحضور (متر)" type="number" value={form.radius_meters}
            onChange={e => setForm(f => ({ ...f, radius_meters: e.target.value }))} />
          <Input label="خط العرض (Latitude)" value={form.latitude}
            onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="24.7136" />
          <Input label="خط الطول (Longitude)" value={form.longitude}
            onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="46.6753" />
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
    </div>
  )
}
