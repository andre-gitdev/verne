'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` }
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-medium text-stone-800 mb-2">Verne</h1>
        <p className="text-stone-500 text-sm mb-8">Your long-form writing space.</p>
        {sent ? (
          <div className="text-stone-600 text-sm bg-stone-100 rounded-lg p-4">
            Check your email — a magic link is on its way.
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}