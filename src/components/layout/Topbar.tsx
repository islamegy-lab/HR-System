'use client'
import { Bell, Search, ChevronDown, Grid3x3 } from 'lucide-react'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left: breadcrumb style title */}
      <div className="flex items-center gap-2">
        <Grid3x3 className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm">/</span>
        <h1 className="text-sm font-semibold text-gray-800">{title}</h1>
        {subtitle && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{subtitle}</span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            className="pr-8 pl-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Actions slot */}
        {actions}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <Bell className="w-4.5 h-4.5 text-gray-500" size={18} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute left-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">الإشعارات</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { text: 'طلب إجازة جديد من أحمد محمد', time: 'منذ 5 دقائق', color: 'bg-yellow-400' },
                  { text: 'تم صرف رواتب شهر مايو', time: 'منذ ساعة', color: 'bg-green-400' },
                  { text: 'موظف جديد تم إضافته', time: 'منذ 3 ساعات', color: 'bg-blue-400' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <span className={`w-2 h-2 ${n.color} rounded-full mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-xs text-gray-700">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-xs text-purple-600 hover:underline w-full text-center">عرض كل الإشعارات</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition">
          <div className="w-7 h-7 bg-[#875bf7] rounded-full flex items-center justify-center text-white text-xs font-bold">م</div>
          <span className="text-xs font-medium text-gray-700 hidden md:block">مدير النظام</span>
          <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
        </button>
      </div>
    </header>
  )
}
