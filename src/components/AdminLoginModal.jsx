import { useEffect, useRef, useState } from 'react'
import { Lock, X } from 'lucide-react'
import { ADMIN_EMAIL, isSupabaseConfigured } from '../lib/supabase'

export default function AdminLoginModal({ open, onClose, onLogin }) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setError('')
    setEmail(ADMIN_EMAIL)
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await onLogin(password, email.trim())
      if (result?.ok) {
        onClose()
      } else {
        setError(result?.message || 'Mot de passe incorrect')
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-brand-sand px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-brown-deep text-brand-gold-bright">
              <Lock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-xl font-bold text-brand-brown-deep">
              Accès admin
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-muted hover:bg-brand-sand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {isSupabaseConfigured && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Email admin
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-brown/12 bg-brand-cream px-3.5 py-3 text-base text-brand-brown-deep outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                required
              />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Mot de passe
            </span>
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Entrez le mot de passe"
              className="w-full rounded-xl border border-brand-brown/12 bg-brand-cream px-3.5 py-3 text-base tracking-wide text-brand-brown-deep outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-brand-sand bg-brand-cream/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-brown/15 px-4 py-2.5 text-sm font-semibold text-brand-brown-soft"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl bg-brand-brown-deep px-4 py-2.5 text-sm font-semibold text-brand-gold-bright shadow-md transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? 'Connexion…' : 'Connexion'}
          </button>
        </div>
      </form>
    </div>
  )
}
