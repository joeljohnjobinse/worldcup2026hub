import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, writeBatch, doc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useMatches } from '../hooks/useMatches'
import { MATCHES, TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'

export default function Admin() {
  const { matches, updateMatchResult, setMatchLive, resetMatch } = useMatches()
  const [scores, setScores]     = useState({})
  const [resolving, setResolving] = useState(null)
  const [success, setSuccess]   = useState('')
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilter] = useState('all')

  const groupMatches = matches.filter(m => m.homeTeam && m.awayTeam)

  const filtered = groupMatches.filter(m => {
    if (filterStatus === 'finished' && m.status !== 'finished') return false
    if (filterStatus === 'upcoming' && m.status !== 'upcoming') return false
    if (filterStatus === 'live'     && m.status !== 'live')     return false
    if (search) {
      const q = search.toLowerCase()
      return m.homeTeam?.toLowerCase().includes(q) || m.awayTeam?.toLowerCase().includes(q)
    }
    return true
  })

  const setScore = (matchId, key, val) => {
    setScores(s => ({ ...s, [matchId]: { ...(s[matchId] || {}), [key]: val } }))
  }

  async function resolveMatch(match) {
    const sc = scores[match.id]
    if (sc?.home === undefined || sc?.home === '' || sc?.away === undefined || sc?.away === '') {
      alert('Enter both scores before resolving.')
      return
    }
    const fh = parseInt(sc.home)
    const fa = parseInt(sc.away)
    if (isNaN(fh) || isNaN(fa)) { alert('Scores must be numbers.'); return }

    setResolving(match.id)
    try {
      // 1. Update the match doc
      await updateMatchResult(match.id, fh, fa)

      // 2. Fetch all predictions for this match
      const predSnap = await getDocs(
        query(collection(db, 'predictions'), where('matchId', '==', match.id))
      )

      // Determine actual result
      const actualResult = fh > fa ? 'home' : fa > fh ? 'away' : 'draw'

      // 3. Award points in a batch
      const batch = writeBatch(db)
      predSnap.forEach(predDoc => {
        const pred = predDoc.data()
        const predResult = pred.predictedHome > pred.predictedAway ? 'home'
          : pred.predictedAway > pred.predictedHome ? 'away' : 'draw'

        let pts = 0
        if (predResult === actualResult) pts += 1                                // correct result
        if (pred.predictedHome === fh && pred.predictedAway === fa) pts += 5    // exact score bonus

        batch.update(doc(db, 'predictions', predDoc.id), { pointsEarned: pts })
        if (pts > 0) {
          batch.update(doc(db, 'users', pred.userId), { totalPoints: increment(pts) })
        }
      })
      await batch.commit()

      setSuccess(`✅ ${match.homeTeam} ${fh}–${fa} ${match.awayTeam} resolved! Points awarded.`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setResolving(null)
    }
  }

  const stats = {
    total:    groupMatches.length,
    finished: groupMatches.filter(m => m.status === 'finished').length,
    live:     groupMatches.filter(m => m.status === 'live').length,
    upcoming: groupMatches.filter(m => m.status === 'upcoming').length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-wc-gold flex items-center justify-center">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Admin Panel</h1>
          <p className="text-wc-muted text-sm">Enter match results to resolve predictions and award points</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="mb-6 mt-4 flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-800/50 rounded-xl">
        <span className="text-amber-400 text-xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-amber-300 text-sm font-semibold">Admin-only area</p>
          <p className="text-amber-400/70 text-xs mt-0.5">
            Resolving a match is permanent and immediately awards points to all users who made predictions.
            Double-check the scores before confirming.
          </p>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-5 p-4 bg-green-950/50 border border-green-700/50 rounded-xl text-green-300 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Matches', value: stats.total,    color: 'text-wc-light' },
          { label: 'Resolved',      value: stats.finished, color: 'text-green-400' },
          { label: 'Live',          value: stats.live,     color: 'text-red-400' },
          { label: 'Upcoming',      value: stats.upcoming, color: 'text-wc-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`font-display text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-wc-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">Search Team</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input" placeholder="e.g. Brazil…" />
        </div>
        <div>
          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">Status</label>
          <select value={filterStatus} onChange={e => setFilter(e.target.value)} className="input min-w-[130px]">
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filtered.map(match => {
          const homeTeam = TEAMS[match.homeTeam]
          const awayTeam = TEAMS[match.awayTeam]
          const sc       = scores[match.id] || {}
          const isFinished = match.status === 'finished'
          const isLive     = match.status === 'live'
          let dateStr = ''
          try { dateStr = format(parseISO(match.date), 'dd MMM · HH:mm') } catch {}

          return (
            <div key={match.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${
              isFinished ? 'opacity-70' : isLive ? 'border-green-700/50' : ''
            }`}>
              {/* Team info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`fi fi-${homeTeam?.flag} rounded`} style={{ width:'2rem', height:'1.5rem' }} />
                  <span className="font-display text-base font-bold uppercase text-white">{match.homeTeam}</span>
                </div>
                <span className="text-wc-muted font-bold">vs</span>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold uppercase text-white">{match.awayTeam}</span>
                  <span className={`fi fi-${awayTeam?.flag} rounded`} style={{ width:'2rem', height:'1.5rem' }} />
                </div>
                <div className="ml-auto sm:ml-0 flex items-center gap-2">
                  <span className={`badge border text-xs ${
                    isFinished ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                    isLive     ? 'bg-red-900/30 text-red-400 border-red-800/50 animate-pulse' :
                                 'bg-wc-border/40 text-wc-muted border-wc-border'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-xs text-wc-muted hidden sm:inline">{dateStr}</span>
                </div>
              </div>

              {/* Current result */}
              {isFinished && (
                <div className="font-display text-xl font-black text-wc-gold text-center">
                  {match.finalHome} – {match.finalAway}
                  <div className="text-xs text-green-400 font-normal font-body mt-0.5">Resolved ✓</div>
                </div>
              )}

              {/* Score entry (non-finished) */}
              {!isFinished && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number" min="0" max="20"
                    value={sc.home ?? ''}
                    onChange={e => setScore(match.id, 'home', e.target.value)}
                    className="w-14 input text-center font-display text-lg font-bold p-1.5"
                    placeholder="–"
                  />
                  <span className="text-wc-muted font-bold text-lg">–</span>
                  <input
                    type="number" min="0" max="20"
                    value={sc.away ?? ''}
                    onChange={e => setScore(match.id, 'away', e.target.value)}
                    className="w-14 input text-center font-display text-lg font-bold p-1.5"
                    placeholder="–"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {!isFinished && (
                  <>
                    {!isLive && (
                      <button
                        onClick={() => setMatchLive(match.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-800/40 transition-colors"
                      >
                        🔴 Go Live
                      </button>
                    )}
                    <button
                      onClick={() => resolveMatch(match)}
                      disabled={resolving === match.id}
                      className="btn-gold py-1.5 text-sm disabled:opacity-60"
                    >
                      {resolving === match.id ? '⏳' : '✓ Resolve'}
                    </button>
                  </>
                )}
                {isFinished && (
                  <button
                    onClick={() => resetMatch(match.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors"
                  >
                    ↩ Reset
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}