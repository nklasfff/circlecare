import { useState, type FormEvent } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">❤️</div>
        <h1 className="text-3xl font-bold text-ink">CircleCare</h1>
        <p className="mt-1 text-muted">Hold styr på hvem der gør hvad.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-2xl bg-warning/15 p-4 text-sm text-ink">
          <strong>Supabase mangler.</strong> Kopiér <code>.env.example</code>{' '}
          til <code>.env</code> og udfyld din projekt-URL og anon-nøgle for at
          logge ind.
        </div>
      )}

      {status === 'sent' ? (
        <div className="rounded-2xl bg-success/15 p-5 text-center">
          <div className="mb-1 text-2xl">📧</div>
          <p className="font-semibold text-ink">Tjek din mail</p>
          <p className="mt-1 text-sm text-muted">
            Vi har sendt et login-link til {email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-surface px-4 py-4 text-lg text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-lg font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {status === 'sending' ? 'Sender…' : 'Send login-link'}
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      )}
    </div>
  )
}
