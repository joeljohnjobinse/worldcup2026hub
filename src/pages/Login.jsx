import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Decorative team flags for the side panel
const SIDE_TEAMS = [
  { code: 'BRA', flag: 'br', name: 'Brazil' },
  { code: 'ARG', flag: 'ar', name: 'Argentina' },
  { code: 'FRA', flag: 'fr', name: 'France' },
  { code: 'ENG', flag: 'gb-eng', name: 'England' },
  { code: 'GER', flag: 'de', name: 'Germany' },
  { code: 'ESP', flag: 'es', name: 'Spain' },
  { code: 'POR', flag: 'pt', name: 'Portugal' },
  { code: 'USA', flag: 'us', name: 'USA' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '', remember: true })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password, form.remember)
      navigate('/')
    } catch (err) {
      const codes = {
        'auth/invalid-credential':     'Incorrect email or password. Try again.',
        'auth/user-not-found':         'No account found with that email.',
        'auth/wrong-password':         'Incorrect password.',
        'auth/too-many-requests':      'Too many attempts. Please wait a moment.',
        'auth/invalid-email':          'Please enter a valid email address.',
      }
      setError(codes[err.code] || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0008 0%, #0D0D18 40%, #0a0a0f 100%)' }}
      >
        {/* Red glow */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C8102E 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />

        {/* Gold glow bottom */}
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F0A500 0%, transparent 70%)', transform: 'translate(20%, 20%)' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wc-red flex items-center justify-center shadow-lg shadow-red-900/50">
              <span className="text-2xl">⚽</span>
            </div>
            <div>
              <div className="font-display text-xl font-black text-white tracking-wide">WC2026</div>
              <div className="text-[10px] text-wc-gold font-semibold tracking-widest uppercase -mt-0.5">Friends Hub</div>
            </div>
          </div>

          {/* Middle content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-wc-red/20 border border-wc-red/30 rounded-full px-3 py-1 mb-5">
              <span className="w-2 h-2 rounded-full bg-wc-red animate-pulse" />
              <span className="text-xs text-wc-gold font-semibold tracking-widest uppercase">Tournament Active</span>
            </div>

            <h2 className="font-display text-5xl xl:text-6xl font-black text-white uppercase leading-none mb-4">
              The World's<br />
              <span style={{ WebkitTextStroke: '1px #F0A500', color: 'transparent' }}>Greatest</span><br />
              Tournament
            </h2>
            <p className="text-wc-muted text-base leading-relaxed max-w-sm">
              48 teams. 104 matches. One trophy. Sign in to predict results, 
              generate tickets and compete with your friends.
            </p>
          </div>

          {/* Flag strip */}
          <div>
            <p className="text-xs text-wc-muted uppercase tracking-widest font-semibold mb-3">Competing Nations</p>
            <div className="flex flex-wrap gap-2">
              {SIDE_TEAMS.map(t => (
                <div key={t.code} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-wc-gold/30 transition-colors">
                  <span className={`fi fi-${t.flag} rounded`} style={{ width: '1.1rem', height: '0.825rem' }} />
                  <span className="text-xs font-semibold text-wc-light">{t.code}</span>
                </div>
              ))}
              <div className="flex items-center px-2.5 py-1.5">
                <span className="text-xs text-wc-muted font-semibold">+40 more…</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: '#0A0A0F' }}
      >
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-wc-red flex items-center justify-center">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="font-display text-lg font-black text-white">WC2026 Hub</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-black uppercase text-white mb-1">
              Welcome Back
            </h1>
            <p className="text-wc-muted">
              Sign in to your squad account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/60 rounded-xl">
              <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-red-300 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wc-muted text-base">
                  ✉
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  className="input pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wc-muted text-base">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  className="input pl-10 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wc-muted hover:text-wc-light transition-colors text-sm font-medium"
                  tabIndex={-1}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setForm(f => ({ ...f, remember: !f.remember }))}
                className={`w-10 h-6 rounded-full cursor-pointer transition-all duration-200 relative flex-shrink-0 ${
                  form.remember ? 'bg-wc-gold' : 'bg-wc-border'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  form.remember ? 'left-5' : 'left-1'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-wc-light">Remember me on this device</p>
                <p className="text-xs text-wc-muted">Stay signed in between sessions</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-display text-lg font-bold uppercase tracking-wide text-white transition-all duration-200 disabled:opacity-60 relative overflow-hidden"
              style={{
                background: loading
                  ? '#4A1020'
                  : 'linear-gradient(90deg, #C8102E 0%, #E8203E 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(200,16,46,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-wc-border" />
            <span className="text-xs text-wc-muted">Don't have an account?</span>
            <div className="flex-1 h-px bg-wc-border" />
          </div>

          {/* Register CTA */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center py-3.5 rounded-xl border border-wc-border hover:border-wc-gold/50 text-wc-light hover:text-wc-gold font-display text-lg font-bold uppercase tracking-wide transition-all duration-200"
          >
            🏆 Create an Account
          </Link>

          <p className="text-center text-xs text-wc-muted mt-6">
            Not affiliated with FIFA · Fan project for private use
          </p>
        </div>
      </div>
    </div>
  )
}