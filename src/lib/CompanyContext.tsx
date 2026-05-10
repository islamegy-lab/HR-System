'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { companyApi } from '@/lib/api'
import type { CompanySettings } from '@/types'

interface CompanyContextType {
  company: CompanySettings | null
  currency: string
  reload: () => void
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  currency: 'SAR',
  reload: () => {},
})

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanySettings | null>(null)

  const load = () => {
    companyApi.get().then(({ data }) => {
      if (data) setCompany(data as CompanySettings)
    })
  }

  useEffect(() => { load() }, [])

  return (
    <CompanyContext.Provider value={{
      company,
      currency: company?.currency || 'SAR',
      reload: load,
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => useContext(CompanyContext)
