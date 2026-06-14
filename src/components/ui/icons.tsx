import {
  Pill,
  Utensils,
  Car,
  CalendarDays,
  HandHeart,
  Stethoscope,
  Soup,
  Dot,
  ShieldCheck,
  ListChecks,
  Calendar,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react'

/** Tynde linje-ikoner, stroke 1.5, runde ender — matcher referencen. */
export function Icon({
  as: Cmp,
  size = 22,
  className,
}: {
  as: LucideIcon
  size?: number
  className?: string
}) {
  return <Cmp size={size} strokeWidth={1.5} absoluteStrokeWidth className={className} />
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  medicine: Pill,
  food: Utensils,
  transport: Car,
  appointment: CalendarDays,
  visit: HandHeart,
  medical: Stethoscope,
  meal: Soup,
  other: Dot,
}

export function CategoryIcon({
  category,
  size = 22,
  className,
}: {
  category: string
  size?: number
  className?: string
}) {
  const Cmp = CATEGORY_ICON[category] ?? Dot
  return <Icon as={Cmp} size={size} className={className} />
}

export const TabIcons = {
  coverage: ShieldCheck,
  tasks: ListChecks,
  calendar: Calendar,
  messages: MessagesSquare,
}
