export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #e2e8f0',
      background: '#fff',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto'
    }}>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        © {new Date().getFullYear()} نظام إدارة الموارد البشرية — جميع الحقوق محفوظة
      </p>
      <p style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>HR System v2.0</p>
    </footer>
  )
}
