import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'نظام الموارد البشرية',
  description: 'نظام إدارة الموارد البشرية المتكامل',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-auto bg-surface-50">{children}</main>
        </div>
      </body>
    </html>
  )
}
