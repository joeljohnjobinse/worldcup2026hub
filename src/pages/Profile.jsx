import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MATCHES, TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'

export default function Profile() {
  const { user, profile } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('all')

  useEffect(() => {
    async function load() {
      if (!user) return
      const q    = query(collection(db, 'predictions'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      setPredictions(snap.docs.map(d => d.data()))
      setLoading(false)
    }
    load()
  }, [user])

  const resolved   = predictions.filter(p => p.pointsEarned !== null)
  const pending    = predictions.filter(p => p.pointsEarned === null)
  const totalPts   = resolved.reduce((s, p) => s + (p.pointsEarned || 0), 0)
  const exactScores = resolved.filter(p => p.pointsEarned >= 6).length
  const correctResults = resolved.filter(p => p.pointsEarned >= 1).length

  const filtered = predictions.filter(p => {
    if (tab === 'resolved') return p.pointsEarned !== null
    if (tab === 'pending')  return p.pointsEarned === null
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-wc-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Profile hero */}
      <div className="card mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, #F0A500, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <img
              src={profile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              className="w-20 h-20 rounded-2xl border-2 border-wc-gold shadow-lg shadow-yellow-900/30"
            />
            {profile?.isAdmin && (
              <div className="absolute -top-2 -right-2 bg-wc-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                ADMIN
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-4xl font-black text-white uppercase tracking-wide">
              {profile?.displayName || 'Fan'}
            </h1>
            <p className="text-wc-muted text-sm mt-1">{user?.email}</p>
            <p className="text-xs text-wc-muted mt-1">
              Member since {profile?.createdAt?.seconds
                ? format(new Date(profile.createdAt.seconds * 1000), 'MMMM yyyy')
                : '2026'}
            </p>
          </div>

          {/* Points badge */}
          <div className="text-center flex-shrink-0">
            <div className="font-display text-5xl font-black text-wc-gold">{profile?.totalPoints || totalPts}</div>
            <div className="text-xs text-wc-muted font-semibold uppercase tracking-widest mt-1">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Predictions Made', value: predictions.length, icon: '🎯' },
          { label: 'Resolved',         value: resolved.length,    icon: '✅' },
          { label: 'Correct Results',  value: correctResults,     icon: '👍' },
          { label: 'Exact Scores',     value: exactScores,        icon: '🎰' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-display text-3xl font-black text-wc-gold">{value}</div>
            <div className="text-xs text-wc-muted mt-1 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Predictions list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-black uppercase text-white">My Predictions</h2>
          <div className="flex gap-2">
            {['all','resolved','pending'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                  tab === t
                    ? 'bg-wc-red text-white'
                    : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-wc-muted">
            <div className="text-5xl mb-3">🎯</div>
            <p>No predictions here yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(pred => {
              const match = MATCHES.find(m => m.id === pred.matchId)
              if (!match) return null
              const homeTeam = TEAMS[match.homeTeam]
              const awayTeam = TEAMS[match.awayTeam]
              const isResolved = pred.pointsEarned !== null
              const isExact    = pred.pointsEarned >= 6
              const isCorrect  = pred.pointsEarned >= 1 && !isExact
              let dateStr = ''
              try { dateStr = format(parseISO(match.date), 'dd MMM') } catch {}

              return (
                <div key={pred.matchId} className={`card flex items-center gap-4 ${
                  isExact ? 'border-wc-gold/40' : isCorrect ? 'border-green-700/40' : isResolved ? 'border-red-900/30' : ''
                }`}>
                  {/* Teams */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`fi fi-${homeTeam?.flag} rounded flex-shrink-0`} style={{ width:'1.5rem', height:'1.125rem' }} />
                    <span className="font-display text-sm font-bold text-white uppercase">{match.homeTeam}</span>
                    <span className="text-wc-muted text-xs">vs</span>
                    <span className="font-display text-sm font-bold text-white uppercase">{match.awayTeam}</span>
                    <span className={`fi fi-${awayTeam?.flag} rounded flex-shrink-0`} style={{ width:'1.5rem', height:'1.125rem' }} />
                  </div>

                  {/* Date */}
                  <div className="text-xs text-wc-muted hidden sm:block flex-shrink-0">{dateStr}</div>

                  {/* Your prediction */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="text-xs text-wc-muted mb-0.5">Your pick</div>
                    <div className="font-display text-lg font-black text-wc-gold">
                      {pred.predictedHome}–{pred.predictedAway}
                    </div>
                  </div>

                  {/* Actual score */}
                  {isResolved && (
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="text-xs text-wc-muted mb-0.5">Result</div>
                      <div className="font-display text-lg font-black text-white">
                        {match.finalHome}–{match.finalAway}
                      </div>
                      {match.penHome !== null && match.penHome !== undefined && (
                        <div className="text-xs text-wc-gold font-semibold">
                          ({match.penHome}–{match.penAway} pens)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Points */}
                  <div className="flex-shrink-0 text-right min-w-[60px]">
                    {isResolved ? (
                      <div className={`font-display text-2xl font-black ${
                        isExact ? 'text-wc-gold' : isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pred.pointsEarned > 0 ? `+${pred.pointsEarned}` : '0'}
                      </div>
                    ) : (
                      <div className="badge bg-wc-border/40 text-wc-muted">Pending</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}