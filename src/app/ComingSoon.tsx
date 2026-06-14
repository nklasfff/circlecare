export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-5 rounded-2xl bg-surface p-6 text-center text-muted">
        <div className="mb-2 text-3xl">🚧</div>
        Kommer i en senere fase.
      </div>
    </div>
  )
}
