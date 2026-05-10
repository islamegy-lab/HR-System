'use client'
import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Save, Building2, Globe, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [company, setCompany] = useState({ name: 'شركة النجاح', name_en: 'Success Company', email: 'hr@company.com', phone: '+966500000000', address: 'الرياض، المملكة العربية السعودية' })
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const SectionCard = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-indigo-600" />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="الإعدادات" />
      <div className="p-6 space-y-5 max-w-3xl">

        <SectionCard icon={Building2} title="بيانات الشركة">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم الشركة (عربي)" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
            <Input label="اسم الشركة (إنجليزي)" value={company.name_en} onChange={e => setCompany(c => ({ ...c, name_en: e.target.value }))} />
            <Input label="البريد الإلكتروني" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
            <Input label="رقم الهاتف" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
            <div className="col-span-2">
              <Input label="العنوان" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Globe} title="إعدادات النظام">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'اللغة الافتراضية', options: [{ value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' }] },
              { label: 'العملة', options: [{ value: 'SAR', label: 'ريال سعودي (SAR)' }, { value: 'USD', label: 'دولار أمريكي (USD)' }, { value: 'EGP', label: 'جنيه مصري (EGP)' }] },
              { label: 'المنطقة الزمنية', options: [{ value: 'Asia/Riyadh', label: 'توقيت الرياض (GMT+3)' }, { value: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2)' }] },
              { label: 'بداية أسبوع العمل', options: [{ value: 'sunday', label: 'الأحد' }, { value: 'monday', label: 'الاثنين' }] },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
                  {s.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="الإشعارات">
          <div className="space-y-3">
            {['إشعار عند تقديم طلب إجازة جديد', 'إشعار عند الموافقة على الإجازة', 'تذكير بمواعيد الرواتب', 'إشعار عند إضافة موظف جديد', 'تقرير أسبوعي للحضور'].map(item => (
              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600 rounded" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">{item}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Shield} title="الأمان">
          <div className="grid grid-cols-2 gap-4">
            <Input label="كلمة المرور الحالية" type="password" placeholder="••••••••" />
            <div />
            <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" />
            <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button icon={<Save size={14} />} onClick={handleSave}>
            {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  )
}
