interface CardProps {
  children: React.ReactNode
  teal?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({ children, teal = false, style, onClick }: CardProps) {
  return (
    <div
      className={`card${teal ? ' card-teal' : ''}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
