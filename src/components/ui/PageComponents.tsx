import React from 'react'

export const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f1f5f9' }
export const bodyStyle: React.CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }
export const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }
export const thStyle: React.CSSProperties = { padding: '11px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }
export const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc' }

export function CardHeader({ title, color = '#2563eb', right }: { title: string; color?: string; right?: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 20, borderRadius: 99, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</span>
      {right && <div style={{ marginRight: 'auto' }}>{right}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, bg, ic, border, delay = 0 }: {
  label: string; value: number | string; icon: React.ElementType;
  bg: string; ic: string; border?: string; delay?: number
}) {
  return (
    <div className="card slide-up" style={{ padding: 20, animationDelay: `${delay}ms`, border: border ? `1px solid ${border}` : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={ic} />
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 3 }}>{label}</p>
        </div>
      </div>
    </div>
  )
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0
    }}>{name[0]}</div>
  )
}

export function EmptyState({ icon: Icon, text, action }: { icon: React.ElementType; text: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '52px 20px', textAlign: 'center', color: '#94a3b8' }}>
      <Icon size={40} style={{ margin: '0 auto 10px', opacity: 0.25 }} />
      <p style={{ fontSize: 13 }}>{text}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

export function TabBar({ tabs, value, onChange }: { tabs: { value: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
          background: value === t.value ? '#2563eb' : 'transparent',
          color: value === t.value ? '#fff' : '#64748b',
          transition: 'all 0.15s',
          boxShadow: value === t.value ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          {t.label}
          {t.count !== undefined && t.count > 0 && (
            <span style={{ fontSize: 10, background: value === t.value ? 'rgba(255,255,255,0.25)' : '#fde68a', color: value === t.value ? '#fff' : '#92400e', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
