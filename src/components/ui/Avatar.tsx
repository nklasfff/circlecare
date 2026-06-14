interface AvatarProps {
  name: string | null
  size?: number
}

// Blå toner til ansvarlig-cirkler; initial i mørk blå.
const TONES = ['#9FB4D8', '#B2C2DE', '#7F95C0', '#A8BAD9']
const INITIAL_INK = '#16203A'

function pickTone(name: string | null): string {
  if (!name) return TONES[0]
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return TONES[sum % TONES.length]
}

export function Avatar({ name, size = 36 }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: pickTone(name),
        color: INITIAL_INK,
      }}
      aria-hidden
    >
      {initial}
    </div>
  )
}

/** Overlappende klynge af cirkler til en gruppe af medlemmer. */
export function AvatarCluster({
  names,
  size = 30,
  max = 4,
}: {
  names: string[]
  size?: number
  max?: number
}) {
  const shown = names.slice(0, max)
  const overlap = size * 0.38
  return (
    <div className="flex items-center" style={{ paddingLeft: overlap }}>
      {shown.map((n, i) => (
        <div
          key={`${n}-${i}`}
          style={{ marginLeft: -overlap, zIndex: i }}
          className="rounded-full ring-2 ring-white/70"
        >
          <Avatar name={n} size={size} />
        </div>
      ))}
    </div>
  )
}
