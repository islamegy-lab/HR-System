import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { CompanyProvider } from '@/lib/CompanyContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </div>
    </CompanyProvider>
  )
}
