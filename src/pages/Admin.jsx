import { useState } from 'react'
import { collection, query, where, getDocs, writeBatch, doc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useMatches } from '../hooks/useMatches'
import { MATCHES, TEAMS, GROUPS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'

// ── All team codes for the dropdown ──────────────────────────────────────────
const TEAM_CODES = Object.keys(TEAMS).sort()

// ── Knockout match phases ─────────────────────────────────────────────────────
const KNOCKOUT_PHASES = ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Third Place', 'Final']

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: Group Stage Results
// ─────────────────────────────────────────────────────────────────────────────
function GroupResultsTab({ matches, updateMatchResult, setMatchLive, resetMatch }) {
  const [scores,    setScores]    = useState({})
  const [resolving, setResolving] = useState(null)
  const [success,   setSuccess]   = useState('')
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')

  const groupMatches = matches.filter(m => m.group && m.homeTeam && m.awayTeam)

  const filtered = groupMatches.filter(m => {
    if (filter === 'finished' && m.status !== 'finished') return false
    if (filter === 'upcoming' && m.status !== 'upcoming') return false
    if (filter === 'live'     && m.status !== 'live')     return false
    if (search) {
      const q = search.toLowerCase()
      return m.homeTeam?.toLowerCase().includes(q) || m.awayTeam?.toLowerCase().includes(q)
    }
    return true
  })

  const setScore = (matchId, key, val) =>
    setScores(s => ({ ...s, [matchId]: { ...(s[matchId] || {}), [key]: val } }))

  async function resolveMatch(match) {
    const sc = scores[match.id]
    if (!sc || sc.home === '' || sc.home === undefined || sc.away === '' || sc.away === undefined)
      return alert('Enter both scores first.')
    const fh = parseInt(sc.home), fa = parseInt(sc.away)
    if (isNaN(fh) || isNaN(fa)) return alert('Scores must be numbers.')

    setResolving(match.id)
    try {
      await updateMatchResult(match.id, fh, fa)
      const predSnap = await getDocs(query(collection(db, 'predictions'), where('matchId', '==', match.id)))
      const actual   = fh > fa ? 'home' : fa > fh ? 'away' : 'draw'
      const batch    = writeBatch(db)
      predSnap.forEach(predDoc => {
        const pred   = predDoc.data()
        const predicted = pred.predictedHome > pred.predictedAway ? 'home'
          : pred.predictedAway > pred.predictedHome ? 'away' : 'draw'
        let pts = 0
        if (predicted === actual) pts += 1
        if (pred.predictedHome === fh && pred.predictedAway === fa) pts += 5
        batch.update(doc(db, 'predictions', predDoc.id), { pointsEarned: pts })
        if (pts > 0) batch.update(doc(db, 'users', pred.userId), { totalPoints: increment(pts) })
      })
      await batch.commit()
      setSuccess(`✅ ${match.homeTeam} ${fh}–${fa} ${match.awayTeam} resolved! Points awarded.`)
      setTimeout(() => setSuccess(''), 5000)
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
    <div>
      {success && (
        <div className="mb-5 p-4 bg-green-950/50 border border-green-700/50 rounded-xl text-green-300 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Total',    value: stats.total,    color:'text-wc-light' },
          { label:'Resolved', value: stats.finished, color:'text-green-400' },
          { label:'Live',     value: stats.live,     color:'text-red-400'   },
          { label:'Upcoming', value: stats.upcoming, color:'text-wc-muted'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`font-display text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-wc-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input" placeholder="Team name…" />
        </div>
        <div>
          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">Status</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input min-w-[130px]">
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
          const sc = scores[match.id] || {}
          const isFinished = match.status === 'finished'
          const isLive     = match.status === 'live'
          let dateStr = ''
          try { dateStr = format(parseISO(match.date), 'dd MMM · HH:mm') } catch {}

          return (
            <div key={match.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${
              isFinished ? 'opacity-70' : isLive ? 'border-green-700/50' : ''
            }`}>
              {/* Teams + status */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <img src={`https://flagcdn.com/w40/${TEAMS[match.homeTeam]?.flag}.png`}
                    className="rounded-sm w-7 h-[21px] object-cover flex-shrink-0" alt={match.homeTeam} />
                  <span className="font-display text-base font-bold uppercase text-white">{match.homeTeam}</span>
                </div>
                <span className="text-wc-muted font-bold text-sm">vs</span>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold uppercase text-white">{match.awayTeam}</span>
                  <img src={`https://flagcdn.com/w40/${TEAMS[match.awayTeam]?.flag}.png`}
                    className="rounded-sm w-7 h-[21px] object-cover flex-shrink-0" alt={match.awayTeam} />
                </div>
                <div className="ml-auto sm:ml-0 flex items-center gap-2 flex-shrink-0">
                  <span className={`badge border text-xs ${
                    isFinished ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                    isLive     ? 'bg-red-900/30 text-red-400 border-red-800/50 animate-pulse' :
                                 'bg-wc-border/40 text-wc-muted border-wc-border'
                  }`}>{match.status}</span>
                  <span className="text-xs text-wc-muted hidden sm:inline">{dateStr}</span>
                </div>
              </div>

              {/* Finished score */}
              {isFinished && (
                <div className="font-display text-xl font-black text-wc-gold text-center flex-shrink-0">
                  {match.finalHome} – {match.finalAway}
                  <div className="text-xs text-green-400 font-normal font-body mt-0.5">Resolved ✓</div>
                </div>
              )}

              {/* Score entry */}
              {!isFinished && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input type="number" min="0" max="20" value={sc.home ?? ''}
                    onChange={e => setScore(match.id, 'home', e.target.value)}
                    className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                  <span className="text-wc-muted font-bold">–</span>
                  <input type="number" min="0" max="20" value={sc.away ?? ''}
                    onChange={e => setScore(match.id, 'away', e.target.value)}
                    className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {!isFinished && (
                  <>
                    {!isLive && (
                      <button onClick={() => setMatchLive(match.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-800/40 transition-colors">
                        🔴 Live
                      </button>
                    )}
                    <button onClick={() => resolveMatch(match)} disabled={resolving === match.id}
                      className="btn-gold py-1.5 text-sm disabled:opacity-60">
                      {resolving === match.id ? '⏳' : '✓ Resolve'}
                    </button>
                  </>
                )}
                {isFinished && (
                  <button onClick={() => resetMatch(match.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors">
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

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: Knockout Team Assignment
// ─────────────────────────────────────────────────────────────────────────────
function KnockoutTab({ matches, updateKnockoutTeam, clearKnockoutTeams }) {
  const [saving,  setSaving]  = useState(null) // matchId_side
  const [success, setSuccess] = useState('')
  const [phase,   setPhase]   = useState('Round of 32')

  const knockoutMatches = matches.filter(m => KNOCKOUT_PHASES.includes(m.phase))
  const phaseMatches    = knockoutMatches.filter(m => m.phase === phase)

  async function handleTeamSet(matchId, side, teamCode) {
    const key = `${matchId}_${side}`
    setSaving(key)
    try {
      await updateKnockoutTeam(matchId, side, teamCode)
      setSuccess(`✅ Updated!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  async function handleClear(matchId) {
    setSaving(`${matchId}_clear`)
    try {
      await clearKnockoutTeams(matchId)
      setSuccess('↩ Cleared both teams.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  const qualified = knockoutMatches.reduce((acc, m) => {
    if (m.homeTeam) acc.add(m.homeTeam)
    if (m.awayTeam) acc.add(m.awayTeam)
    return acc
  }, new Set())

  return (
    <div>
      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 p-4 bg-blue-950/40 border border-blue-800/50 rounded-xl">
        <span className="text-blue-400 text-xl flex-shrink-0">ℹ️</span>
        <div>
          <p className="text-blue-200 text-sm font-semibold">How this works</p>
          <p className="text-blue-300/70 text-xs mt-0.5 leading-relaxed">
            As teams qualify from the group stage, assign them to knockout slots here.
            The schedule, predictions page, and ticket generator will all reflect the real team names immediately.
            Leave a slot blank to keep showing the placeholder (e.g. "Winner Group A").
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-950/50 border border-green-700/50 rounded-xl text-green-300 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Summary of assigned teams */}
      {qualified.size > 0 && (
        <div className="card mb-5">
          <p className="text-xs text-wc-muted uppercase tracking-widest font-semibold mb-3">
            Teams Assigned to Knockout Rounds ({qualified.size})
          </p>
          <div className="flex flex-wrap gap-2">
            {[...qualified].sort().map(code => {
              const team = TEAMS[code]
              return (
                <div key={code} className="flex items-center gap-1.5 bg-wc-gold/10 border border-wc-gold/25 rounded-lg px-2.5 py-1.5">
                  <img src={`https://flagcdn.com/w40/${team?.flag}.png`}
                    className="rounded-sm w-5 h-[15px] object-cover" alt={code} />
                  <span className="text-xs font-bold text-wc-gold uppercase">{code}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {KNOCKOUT_PHASES.map(p => (
          <button key={p} onClick={() => setPhase(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              phase === p
                ? 'bg-wc-red text-white shadow-lg shadow-red-900/30'
                : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
            }`}>{p}</button>
        ))}
      </div>

      {/* Match cards */}
      <div className="space-y-4">
        {phaseMatches.map(match => {
          const hasBoth  = match.homeTeam && match.awayTeam
          const hasEither = match.homeTeam || match.awayTeam

          return (
            <div key={match.id} className={`card ${hasBoth ? 'border-wc-gold/30' : hasEither ? 'border-wc-red/20' : ''}`}>
              {/* Match header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {match.matchLabel && (
                    <span className="badge bg-wc-red/20 text-wc-red border border-wc-red/30 text-[10px]">
                      {match.matchLabel}
                    </span>
                  )}
                  <span className="text-xs text-wc-muted">{match.phase} · {match.date} · {match.kickoff}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasBoth && <span className="text-xs text-wc-gold font-semibold">✓ Both set</span>}
                  {hasEither && !hasBoth && <span className="text-xs text-amber-400 font-semibold">½ Partial</span>}
                  {hasEither && (
                    <button
                      onClick={() => handleClear(match.id)}
                      disabled={saving === `${match.id}_clear`}
                      className="text-xs px-2 py-1 rounded bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors"
                    >
                      {saving === `${match.id}_clear` ? '…' : '↩ Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Original label */}
              <p className="text-xs text-wc-muted mb-4 leading-relaxed border-l-2 border-wc-border pl-3">
                {match.label}
              </p>

              {/* Team selectors */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(['homeTeam', 'awayTeam']).map(side => {
                  const current   = match[side]
                  const sideLabel = side === 'homeTeam' ? 'Home Team' : 'Away Team'
                  const key       = `${match.id}_${side}`
                  const currentTeam = current ? TEAMS[current] : null

                  return (
                    <div key={side}>
                      <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-2">
                        {sideLabel}
                      </label>

                      {/* Current value display */}
                      {current && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-wc-gold/10 border border-wc-gold/25 rounded-lg">
                          <img src={`https://flagcdn.com/w40/${currentTeam?.flag}.png`}
                            className="rounded-sm w-7 h-[21px] object-cover flex-shrink-0" alt={current} />
                          <span className="font-display text-base font-bold text-wc-gold uppercase">{current}</span>
                          <span className="text-xs text-wc-muted ml-1">{currentTeam?.name}</span>
                        </div>
                      )}

                      {/* Selector */}
                      <div className="flex gap-2">
                        <select
                          defaultValue={current || ''}
                          onChange={async e => {
                            if (e.target.value) await handleTeamSet(match.id, side, e.target.value)
                          }}
                          className="input flex-1 text-sm"
                          disabled={saving === key}
                        >
                          <option value="">— Select team —</option>
                          <optgroup label="All 48 Teams">
                            {TEAM_CODES.map(code => (
                              <option key={code} value={code}>
                                {code} — {TEAMS[code]?.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        {saving === key && (
                          <div className="flex items-center px-2">
                            <div className="w-4 h-4 border-2 border-wc-gold/40 border-t-wc-gold rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Venue reminder */}
              <div className="mt-3 pt-3 border-t border-wc-border text-xs text-wc-muted flex items-center gap-1.5">
                <span>📍</span>
                <span>{match.venue} · {match.city}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { matches, updateMatchResult, setMatchLive, resetMatch, updateKnockoutTeam, clearKnockoutTeams } = useMatches()
  const [tab, setTab] = useState('results')

  const finishedCount  = matches.filter(m => m.status === 'finished').length
  const knockoutFilled = matches
    .filter(m => KNOCKOUT_PHASES.includes(m.phase))
    .filter(m => m.homeTeam && m.awayTeam).length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-wc-gold flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Admin Panel</h1>
          <p className="text-wc-muted text-sm">Manage match results, resolve predictions, and assign qualified teams</p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 mt-4 flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-800/50 rounded-xl">
        <span className="text-amber-400 text-xl flex-shrink-0">⚠️</span>
        <p className="text-amber-300/80 text-xs leading-relaxed">
          <span className="font-semibold text-amber-300">Admin-only area.</span> Resolving a match is permanent and immediately
          awards points to all users. Assigning knockout teams updates the schedule and predictions pages for all users instantly.
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex gap-2 mb-7 border-b border-wc-border pb-4">
        <button onClick={() => setTab('results')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'results'
              ? 'bg-wc-red text-white shadow-lg shadow-red-900/30'
              : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
          }`}>
          ⚽ Group Results
          {finishedCount > 0 && (
            <span className="ml-1 bg-white/15 text-white text-xs px-1.5 py-0.5 rounded-full">{finishedCount}</span>
          )}
        </button>
        <button onClick={() => setTab('knockout')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'knockout'
              ? 'bg-wc-gold text-black shadow-lg shadow-yellow-900/30'
              : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
          }`}>
          🏆 Knockout Teams
          {knockoutFilled > 0 && (
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === 'knockout' ? 'bg-black/20' : 'bg-wc-gold/20 text-wc-gold'}`}>
              {knockoutFilled} set
            </span>
          )}
        </button>
      </div>

      {tab === 'results' && (
        <GroupResultsTab
          matches={matches}
          updateMatchResult={updateMatchResult}
          setMatchLive={setMatchLive}
          resetMatch={resetMatch}
        />
      )}

      {tab === 'knockout' && (
        <KnockoutTab
          matches={matches}
          updateKnockoutTeam={updateKnockoutTeam}
          clearKnockoutTeams={clearKnockoutTeams}
        />
      )}
    </div>
  )
}