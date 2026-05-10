import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'نظام الموارد البشرية',
  description: 'نظام إدارة الموارد البشرية المتكامل',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className} style={{ background: '#f1f5f9', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
