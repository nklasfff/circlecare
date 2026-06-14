import type { TaskCategory } from '@/types/database'

export const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'medicine', label: 'Medicin', icon: '💊' },
  { value: 'food', label: 'Mad', icon: '🍲' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'appointment', label: 'Aftale', icon: '📅' },
  { value: 'other', label: 'Andet', icon: '•' },
]

export function categoryIcon(category: string): string {
  return TASK_CATEGORIES.find((c) => c.value === category)?.icon ?? '•'
}

export function categoryLabel(category: string): string {
  return TASK_CATEGORIES.find((c) => c.value === category)?.label ?? 'Andet'
}
