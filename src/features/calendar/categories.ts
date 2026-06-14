import type { EventCategory } from '@/types/database'

export const EVENT_CATEGORIES: {
  value: EventCategory
  label: string
  icon: string
  color: string
}[] = [
  { value: 'visit', label: 'Besøg', icon: '👋', color: '#34c759' },
  { value: 'medical', label: 'Læge', icon: '👨‍⚕️', color: '#ff3b30' },
  { value: 'meal', label: 'Måltid', icon: '🍽️', color: '#ff9500' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#5856d6' },
  { value: 'other', label: 'Andet', icon: '•', color: '#007aff' },
]

export function eventIcon(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.icon ?? '•'
}

export function eventLabel(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.label ?? 'Andet'
}

export function eventColor(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.color ?? '#007aff'
}
