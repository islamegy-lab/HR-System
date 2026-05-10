'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/lib/api'
import type { Employee } from '@/types'

interface EmployeeAuthCtx {
  employee: Employee | null
  loading: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<EmployeeAuthCtx>({ employee: null, loading: true, signOut: async () => {} })

export function EmployeeAuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading]   = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await authApi.getEmployeeByUserId(user.id)
      if (data) setEmployee(data as Employee)
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) { setEmployee(null); router.push('/employee/login') }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    await authApi.signOut()
    setEmployee(null)
    router.push('/employee/login')
  }

  return <Ctx.Provider value={{ employee, loading, signOut }}>{children}</Ctx.Provider>
}

export const useEmployeeAuth = () => useContext(Ctx)
