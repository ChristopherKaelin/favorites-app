import { useState } from 'react'
import { supabase, setAuthPersistence } from '../lib/supabase'

const DEMO_EMAIL = 'demo@christopherkaelin.com'
const DEMO_PASSWORD = 'D3mo@Chr1sKa3l1n'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function signIn(signInEmail: string, signInPassword: string) {
    setError(null)
    setLoading(true)

    setAuthPersistence(signInEmail !== DEMO_EMAIL)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    if (data.user?.email === DEMO_EMAIL) {
      const { error: resetError } = await supabase.rpc('reset_demo_data')
      if (resetError) {
        setError(`Signed in, but couldn't reset demo data: ${resetError.message}`)
      }
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    await signIn(email, password)
  }

  const handleTryDemo = async () => {
    await signIn(DEMO_EMAIL, DEMO_PASSWORD)
  }

  return (
    <div>
      <div className="signin-actions">
        <button type="button" onClick={handleTryDemo} disabled={loading}>
          {loading ? 'Loading...' : 'Try Demo'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          disabled={loading}
        >
          Enter App
        </button>
      </div>

      {showForm && (
        <form className="signin-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      )}
    </div>
  )
}
