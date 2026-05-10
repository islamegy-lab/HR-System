import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'نظام الموارد البشرية',
  description: 'نظام إدارة الموارد البشرية المتكامل',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
