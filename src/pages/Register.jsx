import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AVATARS = [
  { seed: 'striker',    emoji: '⚡' },
  { seed: 'keeper',     emoji: '🧤' },
  { seed: 'captain',    emoji: '🦅' },
  { seed: 'legend',     emoji: '🌟' },
  { seed: 'tactician',  emoji: '🧠' },
  { seed: 'mvp',        emoji: '🏆' },
]

const STEPS = ['Account', 'Profile', 'Done']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState({
    email: '', password: '', confirm: '', displayName: '', avatarSeed: AVATARS[0].seed,
  })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Step 0 → 1 validation
  function handleStep0(e) {
    e.preventDefault()
    setError('')
    if (!form.email.includes('@')) return setError('Enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    setStep(1)
  }

  // Final submit
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.displayName.trim()) return setError('Please enter your display name.')
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName.trim(), form.avatarSeed)
      setStep(2)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      const codes = {
        'auth/email-already-in-use': 'That email is already registered. Try signing in.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/weak-password':        'Password is too weak. Use at least 6 characters.',
      }
      setError(codes[err.code] || 'Something went wrong. Please try again.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(form.displayName || form.avatarSeed)}&backgroundColor=c8102e&textColor=ffffff`

  return (
    <div className="min-h-[calc(100vh-64px)] flex">

      {/* ── Left panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#0A0A0F' }}>
        <div className="w-full max-w-[460px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-wc-gold flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div className="font-display text-lg font-black text-white">WC2026 Hub</div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i < step       ? 'bg-green-500 text-white' :
                  i === step     ? 'bg-wc-gold text-black' :
                                   'bg-wc-border text-wc-muted'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold uppercase tracking-widest ${
                  i === step ? 'text-wc-gold' : 'text-wc-muted'
                }`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 transition-all ${i < step ? 'bg-green-500' : 'bg-wc-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 2: Success ── */}
          {step === 2 && (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="font-display text-4xl font-black text-white uppercase mb-2">You're In!</h2>
              <p className="text-wc-muted mb-6">Welcome to the squad, <span className="text-wc-gold font-semibold">{form.displayName}</span>!</p>
              <div className="flex items-center justify-center gap-2 text-sm text-wc-muted">
                <span className="w-4 h-4 border-2 border-wc-gold/40 border-t-wc-gold rounded-full animate-spin" />
                Redirecting to home…
              </div>
            </div>
          )}

          {/* ── Step 0: Account ── */}
          {step === 0 && (
            <>
              <div className="mb-6">
                <h1 className="font-display text-4xl font-black uppercase text-white mb-1">Join the Squad</h1>
                <p className="text-wc-muted">Create your account — takes 30 seconds.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/60 rounded-xl">
                  <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleStep0} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wc-muted">✉</span>
                    <input
                      type="email" required value={form.email} onChange={set('email')}
                      className="input pl-10" placeholder="you@example.com" autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wc-muted">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                      className="input pl-10 pr-12" placeholder="Min. 6 characters" autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wc-muted hover:text-wc-light text-sm font-medium transition-colors" tabIndex={-1}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map(i => {
                        const len = form.password.length
                        const active = (i === 1 && len >= 1) || (i === 2 && len >= 6) || (i === 3 && len >= 8 && /[A-Z]/.test(form.password)) || (i === 4 && len >= 10 && /[^a-zA-Z0-9]/.test(form.password))
                        const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500']
                        return <div key={i} className={`h-1 flex-1 rounded-full transition-all ${active ? colors[i-1] : 'bg-wc-border'}`} />
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wc-muted">🔒</span>
                    <input
                      type="password" required value={form.confirm} onChange={set('confirm')}
                      className="input pl-10" placeholder="Repeat your password" autoComplete="new-password"
                    />
                    {form.confirm && (
                      <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-base ${
                        form.confirm === form.password ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {form.confirm === form.password ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-display text-lg font-bold uppercase tracking-wide text-black transition-all duration-200"
                  style={{ background: 'linear-gradient(90deg, #F0A500, #FFD060)', boxShadow: '0 4px 20px rgba(240,165,0,0.35)' }}
                >
                  Continue →
                </button>
              </form>
            </>
          )}

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="font-display text-4xl font-black uppercase text-white mb-1">Your Profile</h1>
                <p className="text-wc-muted">How will you appear on the leaderboard?</p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/60 rounded-xl">
                  <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar preview */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-20 h-20 rounded-full border-4 border-wc-gold shadow-lg shadow-yellow-900/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-wc-gold rounded-full flex items-center justify-center text-sm">
                      {AVATARS.find(a => a.seed === form.avatarSeed)?.emoji || '⚽'}
                    </div>
                  </div>
                  <p className="text-xs text-wc-muted">Avatar auto-generated from your name</p>
                </div>

                {/* Display name */}
                <div>
                  <label className="block text-xs font-semibold text-wc-muted uppercase tracking-widest mb-2">
                    Display Name <span className="text-wc-red">*</span>
                  </label>
                  <input
                    type="text" required value={form.displayName} onChange={set('displayName')}
                    className="input text-center font-display text-xl font-bold" maxLength={20}
                    placeholder="Your nickname"
                    autoComplete="nickname"
                  />
                  <p className="text-xs text-wc-muted mt-1.5 text-right">{form.displayName.length}/20</p>
                </div>

                {/* Scoring reminder */}
                <div className="rounded-xl border border-wc-gold/20 bg-wc-gold/5 p-4">
                  <p className="text-xs font-bold text-wc-gold uppercase tracking-widest mb-3">🎯 How Scoring Works</p>
                  <div className="space-y-2">
                    {[
                      ['Correct result (Win/Draw)', '1 point'],
                      ['Exact score bonus',         '+5 points'],
                      ['Max per match',             '6 points'],
                    ].map(([label, pts]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-wc-muted">{label}</span>
                        <span className="text-wc-gold font-bold">{pts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button" onClick={() => { setStep(0); setError('') }}
                    className="btn-ghost flex-shrink-0 py-3.5"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex-1 py-3.5 rounded-xl font-display text-lg font-bold uppercase tracking-wide text-black disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(90deg, #F0A500, #FFD060)', boxShadow: loading ? 'none' : '0 4px 20px rgba(240,165,0,0.35)' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : '🏆 Join the Hub'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step < 2 && (
            <p className="text-center text-wc-muted text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-wc-gold hover:text-yellow-300 font-semibold transition-colors">Sign in</Link>
            </p>
          )}
        </div>
      </div>

      {/* ── Right panel — decorative ── */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[480px] flex-shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0D0D18 0%, #101020 50%, #0a0a0f 100%)' }}
      >
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F0A500 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div />

          <div>
            {/* Trophy graphic */}
            <div className="text-8xl mb-6 text-center">🏆</div>

            <h2 className="font-display text-4xl font-black text-white uppercase text-center mb-4 leading-tight">
              Predict.<br />
              <span className="text-wc-gold">Compete.</span><br />
              Win.
            </h2>
            <p className="text-wc-muted text-sm text-center leading-relaxed mb-8 max-w-xs mx-auto">
              Join your friends, submit predictions before each match and rise to the top 
              of your private leaderboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-3">
              {[
                { icon: '📅', label: 'Live match schedule — all 104 games' },
                { icon: '🎯', label: 'Predict scores & earn up to 6 pts per match' },
                { icon: '🏅', label: 'Private friends leaderboard' },
                { icon: '🎟️', label: 'Custom printable match tickets' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm text-wc-light">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-wc-muted">Not affiliated with FIFA · Fan project</p>
        </div>
      </div>
    </div>
  )
}