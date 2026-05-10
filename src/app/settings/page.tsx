'use client'
import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Save, Building2, Globe, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [company, setCompany] = useState({ name: 'شركة النجاح', name_en: 'Success Company', email: 'hr@company.com', phone: '+966500000000', address: 'الرياض، المملكة العربية السعودية' })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      icon: Building2, title: 'بيانات الشركة',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Input label="اسم الشركة (عربي)" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
          <Input label="اسم الشركة (إنجليزي)" value={company.name_en} onChange={e => setCompany(c => ({ ...c, name_en: e.target.value }))} />
          <Input label="البريد الإلكتروني" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
          <Input label="رقم الهاتف" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
          <div className="col-span-2">
            <Input label="العنوان" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
          </div>
        </div>
      )
    },
    {
      icon: Globe, title: 'إعدادات النظام',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">اللغة الافتراضية</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">العملة</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="EGP">جنيه مصري (EGP)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">المنطقة الزمنية</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="Asia/Riyadh">توقيت الرياض (GMT+3)</option>
              <option value="Africa/Cairo">توقيت القاهرة (GMT+2)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">بداية أسبوع العمل</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="sunday">الأحد</option>
              <option value="monday">الاثنين</option>
            </select>
          </div>
        </div>
      )
    },
    {
      icon: Bell, title: 'الإشعارات',
      content: (
        <div className="space-y-3">
          {[
            'إشعار عند تقديم طلب إجازة جديد',
            'إشعار عند الموافقة على الإجازة',
            'تذكير بمواعيد الرواتب',
            'إشعار عند إضافة موظف جديد',
            'تقرير أسبوعي للحضور',
          ].map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      icon: Shield, title: 'الأمان',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Input label="كلمة المرور الحالية" type="password" placeholder="••••••••" />
          <div />
          <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" />
          <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
        </div>
      )
    },
  ]

  return (
    <div>
      <Topbar title="الإعدادات" />
      <div className="p-6 space-y-6 max-w-4xl">
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <section.icon className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>
            {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  )
}
