'use client'
import { useCompany } from '@/lib/CompanyContext'

export function useCurrency() {
  const { currency } = useCompany()

  const format = (amount: number) => {
    try {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${amount.toLocaleString('ar-SA')} ${currency}`
    }
  }

  return { format, currency }
}
