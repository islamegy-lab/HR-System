import type { NextConfig } from 'next'
import { execSync } from 'child_process'

const run = (cmd: string, fallback: string) => {
  try { return execSync(cmd).toString().trim() } catch { return fallback }
}

const commitHash  = run('git rev-parse --short HEAD', 'dev')
const commitCount = run('git rev-list --count HEAD', '0')
const version     = `1.0.${commitCount}`  // يزيد تلقائياً مع كل commit

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION:  version,
    NEXT_PUBLIC_COMMIT_HASH:  commitHash,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
