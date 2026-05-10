export default function EmployeeLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Cairo, sans-serif' }}>
      {children}
    </div>
  )
}
