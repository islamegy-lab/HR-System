import type { NextConfig } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'

// قراءة الإصدار مباشرة من package.json في وقت البناء
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))
const version = pkg.version

// قراءة الـ commit hash
const run = (cmd: string, fallback: string) => {
  try { return require('child_process').execSync(cmd).toString().trim() } catch { return fallback }
}
const commitHash = run('git rev-parse --short HEAD', 'dev')

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
