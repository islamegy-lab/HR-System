import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontFamily: 'Cairo, sans-serif', fontWeight: 600,
    borderRadius: 10, border: 'none', cursor: 'pointer',
    transition: 'all 0.18s ease', outline: 'none',
    whiteSpace: 'nowrap',
  },
  primary: {
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
  },
  outline: {
    background: '#fff',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: '1.5px solid transparent',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
  },
  success: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
  },
  sm:  { padding: '6px 14px',  fontSize: 12 },
  md:  { padding: '9px 18px',  fontSize: 13 },
  lg:  { padding: '11px 24px', fontSize: 14 },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
}

export function Button({
  children, variant = 'primary', size = 'md',
  loading, icon, disabled, style, className, ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return
    const el = e.currentTarget
    if (variant === 'primary') el.style.boxShadow = '0 4px 16px rgba(37,99,235,0.5)'
    if (variant === 'outline') { el.style.borderColor = '#3b82f6'; el.style.color = '#2563eb'; el.style.background = '#eff6ff' }
    if (variant === 'ghost')   { el.style.background = '#f3f4f6'; el.style.color = '#374151' }
    if (variant === 'danger')  el.style.boxShadow = '0 4px 16px rgba(220,38,38,0.45)'
    if (variant === 'success') el.style.boxShadow = '0 4px 16px rgba(5,150,105,0.45)'
    el.style.transform = 'translateY(-1px)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return
    const el = e.currentTarget
    if (variant === 'primary') el.style.boxShadow = '0 2px 8px rgba(37,99,235,0.35)'
    if (variant === 'outline') { el.style.borderColor = '#d1d5db'; el.style.color = '#374151'; el.style.background = '#fff' }
    if (variant === 'ghost')   { el.style.background = 'transparent'; el.style.color = '#6b7280' }
    if (variant === 'danger')  el.style.boxShadow = '0 2px 8px rgba(220,38,38,0.3)'
    if (variant === 'success') el.style.boxShadow = '0 2px 8px rgba(5,150,105,0.3)'
    el.style.transform = 'translateY(0)'
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return
    e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return
    e.currentTarget.style.transform = 'translateY(-1px) scale(1)'
  }

  return (
    <button
      disabled={isDisabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        ...(isDisabled ? styles.disabled : {}),
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {loading
        ? <Loader2 size={size === 'sm' ? 13 : 15} style={{ animation: 'spin 1s linear infinite' }} />
        : icon}
      {children}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}
