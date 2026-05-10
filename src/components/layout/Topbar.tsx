'use client'
import { Bell, Search, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

const NOTIFS = [
  { id: 1, text: 'طلب إجازة جديد من أحمد محمد', time: 'منذ 5 دقائق', color: '#2563eb' },
  { id: 2, text: 'تم صرف رواتب شهر يناير',       time: 'منذ ساعة',    color: '#10b981' },
  { id: 3, text: 'موظف جديد تم إضافته',           time: 'منذ 3 ساعات', color: '#8b5cf6' },
]

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      height: 64, background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{subtitle}</p>}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', right: 12, color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          placeholder="بحث سريع..."
          style={{
            paddingRight: 36, paddingLeft: 14, paddingTop: 8, paddingBottom: 8,
            border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13,
            width: 200, background: '#f8fafc', color: '#0f172a', outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Actions */}
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}

      {/* Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 38, height: 38, borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
        >
          <Bell size={16} color="#475569" />
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 8, height: 8,
            background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
            animation: 'pulse 2s infinite'
          }} />
        </button>

        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <div style={{
              position: 'absolute', left: 0, top: 46, width: 300,
              background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)', zIndex: 50,
              overflow: 'hidden', animation: 'scaleIn 0.2s ease'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>الإشعارات</span>
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  {NOTIFS.length} جديد
                </span>
              </div>
              {NOTIFS.map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                  display: 'flex', gap: 12, cursor: 'pointer', transition: 'background 0.15s'
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{n.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <button style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  عرض كل الإشعارات
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 12px 6px 8px', borderRadius: 10,
        border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700
        }}>م</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>مدير النظام</p>
          <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>مشرف</p>
        </div>
        <ChevronDown size={12} color="#94a3b8" />
      </div>
    </header>
  )
}
