'use client'
import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { pageStyle, bodyStyle, cardStyle, CardHeader } from '@/components/ui/PageComponents'
import { Save, Building2, Globe, Bell, Shield, CheckCircle, MapPin, Plus, Trash2 } from 'lucide-react'
import { attendanceApi } from '@/lib/api'
import type { AttendanceLocation } from '@/types'

export default function SettingsPage() {
  const [company, setCompany] = useState({ name: 'شركة النجاح', name_en: 'Success Company', email: 'hr@company.com', phone: '+966500000000', address: 'الرياض، المملكة العربية السعودية' })
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  function LocationSettings() {
    const [locs, setLocs] = useState<AttendanceLocation[]>([])
    const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius_meters: '200' })
    const [saving, setSavingLoc] = useState(false)

    useEffect(() => {
      attendanceApi.getLocations().then(({ data }) => { if (data) setLocs(data as AttendanceLocation[]) })
    }, [])

    const handleAdd = async () => {
      if (!form.name || !form.latitude || !form.longitude) return
      setSavingLoc(true)
      await attendanceApi.saveLocation({
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius_meters: parseInt(form.radius_meters),
        is_active: true
      })
      setForm({ name: '', latitude: '', longitude: '', radius_meters: '200' })
      const { data } = await attendanceApi.getLocations()
      if (data) setLocs(data as AttendanceLocation[])
      setSavingLoc(false)
    }

    const handleGetMyLocation = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }))
      })
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {locs.map(loc => (
          <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={16} color="#16a34a" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{loc.name}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{loc.latitude}, {loc.longitude} — نطاق {loc.radius_meters}م</p>
            </div>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          <Input label="اسم الموقع" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="المقر الرئيسي" />
          <Input label="نطاق الحضور (متر)" type="number" value={form.radius_meters} onChange={e => setForm(f => ({ ...f, radius_meters: e.target.value }))} />
          <Input label="خط العرض (Latitude)" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="24.7136" />
          <Input label="خط الطول (Longitude)" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="46.6753" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleGetMyLocation} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <MapPin size={13} /> استخدم موقعي الحالي
          </button>
          <Button size="sm" icon={<Plus size={13} />} loading={saving} onClick={handleAdd}>إضافة موقع</Button>
        </div>
      </div>
    )
  }

  const selectStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' }

  return (
    <div style={pageStyle}>
      <Topbar title="الإعدادات" />
      <div style={{ ...bodyStyle, maxWidth: 760 }}>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="بيانات الشركة" color="#2563eb" />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="اسم الشركة (عربي)" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
            <Input label="اسم الشركة (إنجليزي)" value={company.name_en} onChange={e => setCompany(c => ({ ...c, name_en: e.target.value }))} />
            <Input label="البريد الإلكتروني" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
            <Input label="رقم الهاتف" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="العنوان" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="إعدادات النظام" color="#7c3aed" />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'اللغة الافتراضية', opts: [['ar','العربية'],['en','English']] },
              { label: 'العملة', opts: [['SAR','ريال سعودي'],['USD','دولار أمريكي'],['EGP','جنيه مصري']] },
              { label: 'المنطقة الزمنية', opts: [['Asia/Riyadh','توقيت الرياض (GMT+3)'],['Africa/Cairo','توقيت القاهرة (GMT+2)']] },
              { label: 'بداية أسبوع العمل', opts: [['sunday','الأحد'],['monday','الاثنين']] },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{s.label}</label>
                <select style={selectStyle}>{s.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="الإشعارات" color="#d97706" />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['إشعار عند تقديم طلب إجازة جديد','إشعار عند الموافقة على الإجازة','تذكير بمواعيد الرواتب','إشعار عند إضافة موظف جديد','تقرير أسبوعي للحضور'].map(item => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                <span style={{ fontSize: 13, color: '#334155' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={cardStyle} className="slide-up">
          <CardHeader title="الأمان" color="#16a34a" />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="كلمة المرور الحالية" type="password" placeholder="••••••••" />
            <div />
            <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" />
            <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
          </div>
        </div>

        {/* Location Settings */}
        <div style={cardStyle} className="slide-up">
          <CardHeader title="مواقع الحضور الجغرافية" color="#16a34a" />
          <div style={{ padding: 20 }}>
            <LocationSettings />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon={saved ? <CheckCircle size={15} /> : <Save size={14} />} onClick={handleSave}
            className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
            {saved ? 'تم الحفظ بنجاح ✓' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  )
}
