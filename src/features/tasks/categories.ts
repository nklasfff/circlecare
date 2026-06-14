import type { TaskCategory } from '@/types/database'

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'medicine', label: 'Medicin' },
  { value: 'food', label: 'Mad' },
  { value: 'transport', label: 'Transport' },
  { value: 'appointment', label: 'Aftale' },
  { value: 'other', label: 'Andet' },
]

export function categoryLabel(category: string): string {
  return TASK_CATEGORIES.find((c) => c.value === category)?.label ?? 'Andet'
}
