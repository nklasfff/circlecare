interface AvatarProps {
  name: string | null
  color?: string | null
  size?: number
}

const GRADIENTS = [
  'linear-gradient(135deg, #007AFF, #5856D6)',
  'linear-gradient(135deg, #FF9500, #FF2D55)',
  'linear-gradient(135deg, #34C759, #30B0C7)',
  'linear-gradient(135deg, #FF6B6B, #FFD93D)',
]

function pickGradient(name: string | null): string {
  if (!name) return GRADIENTS[0]
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}

export function Avatar({ name, color, size = 44 }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: color ?? pickGradient(name),
      }}
      aria-hidden
    >
      {initial}
    </div>
  )
}
