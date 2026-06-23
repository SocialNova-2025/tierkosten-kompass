import { BTN } from '../styles/tokens'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'textLink'
  type?: 'button' | 'submit'
  ariaLabel?: string
}

/**
 * All buttons use INLINE styles so the host stylesheet cannot override them.
 * CSS class-based backgrounds on <button> are overridden by many UI frameworks.
 */
export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  const getStyle = () => {
    if (variant === 'primary') {
      return disabled ? BTN.primaryDisabled : BTN.primary
    }
    return {
      outline: BTN.outline,
      ghost: BTN.ghost,
      textLink: BTN.textLink,
    }[variant]
  }

  return (
    <button
      type={type}
      style={{ cssText: getStyle() } as React.CSSProperties}
      ref={el => { if (el) el.style.cssText = getStyle() }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
