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
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
      className={`rounded-2xl bg-surface p-4 shadow-sm ${
        onClick ? 'cursor-pointer transition active:scale-[0.98]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
