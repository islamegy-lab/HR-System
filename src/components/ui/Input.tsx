import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
          'placeholder:text-gray-400',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
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
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        <option value="">— اختر —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
