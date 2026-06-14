import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  accent?: string
  className?: string
  onClick?: () => void
}

export function Card({ children, accent, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
      className={`glass p-4 ${
        onClick ? 'cursor-pointer transition active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
