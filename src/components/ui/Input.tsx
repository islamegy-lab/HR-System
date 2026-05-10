import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</label>}
      <input
        className={cn(className)}
        style={{
          width: '100%', padding: '9px 12px', border: `1px solid ${error ? '#f87171' : '#e2e8f0'}`,
          borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e2e8f0'}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</label>}
      <select
        className={cn(className)}
        style={{
          width: '100%', padding: '9px 12px', border: `1px solid ${error ? '#f87171' : '#e2e8f0'}`,
          borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none',
          transition: 'border-color 0.2s', cursor: 'pointer'
        }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e2e8f0'}
        {...props}
      >
        <option value="">— اختر —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>}
    </div>
  )
}
