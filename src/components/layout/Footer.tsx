'use client'
import { useEffect, useState } from 'react'

export function Footer() {
  const [version, setVersion] = useState('...')
  const year = new Date().getFullYear()

  useEffect(() => {
    fetch('/api/version')
      .then(r => r.json())
      .then(d => setVersion(d.version || d.commit || '1.0.0'))
      .catch(() => setVersion('1.0.0'))
  }, [])

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
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
        © {year} نظام إدارة الموارد البشرية — جميع الحقوق محفوظة
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>مشغّل بواسطة</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb' }}>دُكَّانِي</span>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#475569',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          padding: '3px 9px', borderRadius: 6, fontFamily: 'monospace',
        }}>
          ⎇ v{version}
        </span>
      </div>
    </footer>
  )
}
