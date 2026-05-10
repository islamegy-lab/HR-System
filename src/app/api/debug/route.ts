import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase.from('departments').select('count').limit(1)
    
    // اختبار Auth
    const { data: authTest, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test-nonexistent@test.com',
      password: 'wrongpassword123'
    })

    return NextResponse.json({
      supabase_url: url,
      db_connection: error ? `ERROR: ${error.message}` : 'OK',
      auth_connection: authError?.message === 'Invalid login credentials' 
        ? 'Auth OK - credentials wrong as expected' 
        : `Auth issue: ${authError?.message}`,
    })
  } catch (err: any) {
    return NextResponse.json({ fatal_error: err.message })
  }
}
