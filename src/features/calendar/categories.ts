import type { EventCategory } from '@/types/database'

// Blå-familie-toner til måneds-prikker; "Læge" får den kraftige handlings-indigo.
export const EVENT_CATEGORIES: {
  value: EventCategory
  label: string
  color: string
}[] = [
  { value: 'visit', label: 'Besøg', color: '#7F95C0' },
  { value: 'medical', label: 'Læge', color: '#3C4E86' },
  { value: 'meal', label: 'Måltid', color: '#9FB4D8' },
  { value: 'transport', label: 'Transport', color: '#5A6E9C' },
  { value: 'other', label: 'Andet', color: '#A8BAD9' },
]

export function eventLabel(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.label ?? 'Andet'
}

export function eventColor(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.color ?? '#7F95C0'
}
