'use client'
export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  const commit  = process.env.NEXT_PUBLIC_COMMIT_HASH  || 'dev'
  const year    = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid #e2e8f0',
      background: '#fff',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      {/* Left: copyright */}
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
        © {year} نظام إدارة الموارد البشرية — جميع الحقوق محفوظة
      </p>

      {/* Right: powered by + version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>مشغّل بواسطة</span>
        <span style={{
          fontSize: 12, fontWeight: 800, color: '#2563eb',
          letterSpacing: '0.02em',
        }}>
          دُكَّانِي
        </span>
        <span style={{ color: '#e2e8f0', fontSize: 14 }}>|</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#475569',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          padding: '3px 9px', borderRadius: 6,
        }}>
          v{version}
        </span>
        <span style={{ color: '#e2e8f0', fontSize: 14 }}>|</span>
        <a
          href={`https://github.com/islamegy-lab/HR-System/commit/${commit}`}
          target="_blank"
          rel="noreferrer"
          title="عرض هذا الإصدار على GitHub"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600,
            color: '#64748b', textDecoration: 'none',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            padding: '3px 9px', borderRadius: 6,
            fontFamily: 'monospace',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#eff6ff'
            ;(e.currentTarget as HTMLElement).style.color = '#2563eb'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#f8fafc'
            ;(e.currentTarget as HTMLElement).style.color = '#64748b'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
          }}
        >
          #{commit}
        </a>
      </div>
    </footer>
  )
}
