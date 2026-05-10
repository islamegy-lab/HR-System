import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="form-label">{label}</label>}
      <input
        className={cn('form-input', error && 'form-input-error', className)}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
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
    <div className="flex flex-col gap-1">
      {label && <label className="form-label">{label}</label>}
      <select
        className={cn('form-input bg-white', error && 'form-input-error', className)}
        {...props}
      >
        <option value="">— اختر —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  )
}
