import { useState } from 'react'
import { collection, query, where, getDocs, writeBatch, doc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useMatches } from '../hooks/useMatches'
import { MATCHES, TEAMS, GROUPS, PHASES } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'

const KNOCKOUT_PHASES = ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Third Place', 'Final']

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — GROUP RESULTS
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
        const pred      = predDoc.data()
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
    } catch (err) { alert('Error: ' + err.message) }
    finally { setResolving(null) }
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
        <div className="mb-5 p-4 bg-green-950/50 border border-green-700/50 rounded-xl text-green-300 text-sm font-semibold">{success}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Total',    value:stats.total,    color:'text-wc-light'  },
          { label:'Resolved', value:stats.finished, color:'text-green-400' },
          { label:'Live',     value:stats.live,     color:'text-red-400'   },
          { label:'Upcoming', value:stats.upcoming, color:'text-wc-muted'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`font-display text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-wc-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="card mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input" placeholder="Team…" />
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
      <div className="space-y-3">
        {filtered.map(match => {
          const sc = scores[match.id] || {}
          const isFinished = match.status === 'finished'
          const isLive     = match.status === 'live'
          let dateStr = ''
          try { dateStr = format(parseISO(match.date), 'dd MMM · HH:mm') } catch {}
          return (
            <div key={match.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${isFinished ? 'opacity-70' : isLive ? 'border-green-700/50' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <img src={`https://flagcdn.com/w40/${TEAMS[match.homeTeam]?.flag}.png`} className="rounded-sm w-7 h-[21px] object-cover" alt={match.homeTeam} />
                  <span className="font-display text-base font-bold uppercase text-white">{match.homeTeam}</span>
                </div>
                <span className="text-wc-muted font-bold text-sm">vs</span>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold uppercase text-white">{match.awayTeam}</span>
                  <img src={`https://flagcdn.com/w40/${TEAMS[match.awayTeam]?.flag}.png`} className="rounded-sm w-7 h-[21px] object-cover" alt={match.awayTeam} />
                </div>
                <div className="ml-auto sm:ml-0 flex items-center gap-2 flex-shrink-0">
                  <span className={`badge border text-xs ${isFinished ? 'bg-green-900/30 text-green-400 border-green-800/50' : isLive ? 'bg-red-900/30 text-red-400 border-red-800/50 animate-pulse' : 'bg-wc-border/40 text-wc-muted border-wc-border'}`}>{match.status}</span>
                  <span className="text-xs text-wc-muted hidden sm:inline">{dateStr}</span>
                </div>
              </div>
              {isFinished && (
                <div className="font-display text-xl font-black text-wc-gold text-center flex-shrink-0">
                  {match.finalHome} – {match.finalAway}
                  <div className="text-xs text-green-400 font-normal font-body mt-0.5">Resolved ✓</div>
                </div>
              )}
              {!isFinished && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input type="number" min="0" max="20" value={sc.home ?? ''} onChange={e => setScore(match.id,'home',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                  <span className="text-wc-muted font-bold">–</span>
                  <input type="number" min="0" max="20" value={sc.away ?? ''} onChange={e => setScore(match.id,'away',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                </div>
              )}
              <div className="flex gap-2 flex-shrink-0">
                {!isFinished && (
                  <>
                    {!isLive && (
                      <button onClick={() => setMatchLive(match.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-800/40 transition-colors">🔴 Live</button>
                    )}
                    <button onClick={() => resolveMatch(match)} disabled={resolving === match.id} className="btn-gold py-1.5 text-sm disabled:opacity-60">
                      {resolving === match.id ? '⏳' : '✓ Resolve'}
                    </button>
                  </>
                )}
                {isFinished && (
                  <button onClick={() => resetMatch(match.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors">↩ Reset</button>
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
// TAB 2 — KNOCKOUT TEAMS + FINALISE
// ─────────────────────────────────────────────────────────────────────────────
function KnockoutTab({ matches, updateKnockoutTeam, clearKnockoutTeams, finaliseRound, updateMatchResult, setMatchLive, resetMatch }) {
  const [saving,       setSaving]      = useState(null)
  const [resolving,    setResolving]   = useState(null)
  const [finalising,   setFinalising]  = useState(null)
  const [scores,       setScores]      = useState({})
  const [success,      setSuccess]     = useState('')
  const [phase,        setPhase]       = useState('Round of 32')
  const [subTab,       setSubTab]      = useState('assign') // 'assign' | 'results'

  const TEAM_CODES = Object.keys(TEAMS).sort()
  const phaseMatches = matches.filter(m => m.phase === phase)

  // Count how many of this phase's matches have both teams set
  const totalInPhase    = phaseMatches.length
  const bothTeamsSet    = phaseMatches.filter(m => m.homeTeam && m.awayTeam).length
  const allResolved     = phaseMatches.filter(m => m.status === 'finished').length
  const roundComplete   = bothTeamsSet === totalInPhase
  const alreadyFinalised = bothTeamsSet === totalInPhase

  async function handleTeamSet(matchId, side, teamCode) {
    const key = `${matchId}_${side}`
    setSaving(key)
    try {
      await updateKnockoutTeam(matchId, side, teamCode || null)
      setSuccess('✅ Team updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  async function handleClear(matchId) {
    setSaving(`${matchId}_clear`)
    try {
      await clearKnockoutTeams(matchId)
      setSuccess('↩ Cleared both slots.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  async function handleFinalise() {
    const missing = phaseMatches.filter(m => !m.homeTeam || !m.awayTeam)
    if (missing.length > 0) {
      alert(`${missing.length} match(es) still have TBD teams. Fill all slots before finalising.`)
      return
    }
    setFinalising(phase)
    try {
      await finaliseRound(phase, phaseMatches)
      setSuccess(`🏆 ${phase} finalised! All matches are now live in the Schedule and Predictions.`)
      setTimeout(() => setSuccess(''), 6000)
    } catch (err) { alert('Error: ' + err.message) }
    finally { setFinalising(null) }
  }

  const setScore = (matchId, key, val) =>
    setScores(s => ({ ...s, [matchId]: { ...(s[matchId] || {}), [key]: val } }))

  async function resolveKnockout(match) {
    const sc = scores[match.id] || {}
    if (sc.home === '' || sc.home === undefined || sc.away === '' || sc.away === undefined)
      return alert('Enter both scores first.')
    const fh = parseInt(sc.home), fa = parseInt(sc.away)
    if (isNaN(fh) || isNaN(fa)) return alert('Scores must be numbers.')

    // If draw, penalty scores are required to determine the winner
    const isPenalties = fh === fa
    if (isPenalties) {
      const ph = parseInt(sc.penHome), pa = parseInt(sc.penAway)
      if (isNaN(ph) || isNaN(pa)) return alert('Scores are level — enter the penalty shootout score to determine the winner.')
      if (ph === pa) return alert('Penalty scores cannot be equal — there must be a winner.')
    }

    const ph = parseInt(sc.penHome) || 0
    const pa = parseInt(sc.penAway) || 0

    // The actual winner: if level after 90+ET, decided by penalties
    const actualWinner = fh > fa ? 'home' : fa > fh ? 'away' : ph > pa ? 'home' : 'away'

    setResolving(match.id)
    try {
      await updateMatchResult(match.id, fh, fa, isPenalties ? ph : null, isPenalties ? pa : null)
      const predSnap = await getDocs(query(collection(db, 'predictions'), where('matchId', '==', match.id)))
      const batch    = writeBatch(db)
      predSnap.forEach(predDoc => {
        const pred      = predDoc.data()
        // For scoring: correct result = predicted the right winner
        // In knockout, a "draw" prediction means the user thought it would go to pens
        // We award 1pt for correct winner, +5 for exact 90-min score
        const predictedWinner = pred.predictedHome > pred.predictedAway ? 'home'
          : pred.predictedAway > pred.predictedHome ? 'away' : 'draw'
        let pts = 0
        if (predictedWinner === actualWinner) pts += 1
        if (pred.predictedHome === fh && pred.predictedAway === fa) pts += 5
        batch.update(doc(db, 'predictions', predDoc.id), { pointsEarned: pts })
        if (pts > 0) batch.update(doc(db, 'users', pred.userId), { totalPoints: increment(pts) })
      })
      await batch.commit()
      const scoreStr = isPenalties
        ? `${fh}–${fa} AET (${ph}–${pa} pens)`
        : `${fh}–${fa}`
      setSuccess(`✅ ${match.homeTeam} ${scoreStr} ${match.awayTeam} resolved!`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) { alert('Error: ' + err.message) }
    finally { setResolving(null) }
  }

  const qualifiedTeams = matches
    .filter(m => KNOCKOUT_PHASES.includes(m.phase) && (m.homeTeam || m.awayTeam))
    .reduce((acc, m) => { if (m.homeTeam) acc.add(m.homeTeam); if (m.awayTeam) acc.add(m.awayTeam); return acc }, new Set())

  return (
    <div>
      {/* Info */}
      <div className="mb-5 p-4 bg-blue-950/40 border border-blue-800/50 rounded-xl flex items-start gap-3">
        <span className="text-blue-400 text-xl flex-shrink-0">ℹ️</span>
        <div className="text-xs text-blue-300/80 leading-relaxed">
          <span className="font-semibold text-blue-200">Workflow:</span> Pick a phase → assign teams to each match slot → 
          click <span className="font-bold text-wc-gold">Finalise Round</span> to push all matches into the Schedule, 
          Predictions and Admin results at once. After finalising, switch to the <span className="font-bold">Results</span> sub-tab to enter scores.
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-950/50 border border-green-700/50 rounded-xl text-green-300 text-sm font-semibold">{success}</div>
      )}

      {/* Qualified teams strip */}
      {qualifiedTeams.size > 0 && (
        <div className="card mb-5">
          <p className="text-xs text-wc-muted uppercase tracking-widest font-semibold mb-3">Teams in Knockout Rounds ({qualifiedTeams.size})</p>
          <div className="flex flex-wrap gap-2">
            {[...qualifiedTeams].sort().map(code => (
              <div key={code} className="flex items-center gap-1.5 bg-wc-gold/10 border border-wc-gold/25 rounded-lg px-2.5 py-1.5">
                <img src={`https://flagcdn.com/w40/${TEAMS[code]?.flag}.png`} className="rounded-sm w-5 h-[15px] object-cover" alt={code} />
                <span className="text-xs font-bold text-wc-gold uppercase">{code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase picker */}
      <div className="flex flex-wrap gap-2 mb-4">
        {KNOCKOUT_PHASES.map(p => {
          const pm    = matches.filter(x => x.phase === p)
          const done  = pm.filter(x => x.homeTeam && x.awayTeam).length
          const total = pm.length
          return (
            <button key={p} onClick={() => setPhase(p)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                phase === p ? 'bg-wc-red text-white' : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
              }`}>
              {p}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                done === total ? 'bg-green-500/20 text-green-400' : 'bg-wc-border/60 text-wc-muted'
              }`}>{done}/{total}</span>
            </button>
          )
        })}
      </div>

      {/* Sub-tabs: Assign | Results */}
      <div className="flex gap-2 mb-5 border-b border-wc-border pb-3">
        {['assign','results'].map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              subTab === t ? 'bg-wc-card border border-wc-gold/40 text-wc-gold' : 'text-wc-muted hover:text-white'
            }`}>{t === 'assign' ? '🏷 Assign Teams' : '⚽ Enter Results'}</button>
        ))}
      </div>

      {/* ── ASSIGN SUB-TAB ── */}
      {subTab === 'assign' && (
        <>
          {/* Finalise button */}
          <div className={`card mb-5 flex items-center justify-between gap-4 ${roundComplete ? 'border-wc-gold/40 bg-wc-gold/5' : 'border-dashed'}`}>
            <div>
              <p className={`text-sm font-bold ${roundComplete ? 'text-wc-gold' : 'text-wc-muted'}`}>
                {roundComplete
                  ? `✅ All ${totalInPhase} teams assigned — ready to finalise!`
                  : `${bothTeamsSet}/${totalInPhase} matches have both teams assigned`}
              </p>
              <p className="text-xs text-wc-muted mt-0.5">
                Finalising pushes this round into Predictions and the Schedule for all users.
              </p>
            </div>
            <button
              onClick={handleFinalise}
              disabled={!roundComplete || finalising === phase}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-display text-base font-black uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                roundComplete
                  ? 'bg-wc-gold text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400'
                  : 'bg-wc-border text-wc-muted'
              }`}
            >
              {finalising === phase
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Finalising…</span>
                : '🏆 Finalise Round'}
            </button>
          </div>

          {/* Match assignment cards */}
          <div className="space-y-4">
            {phaseMatches.map(match => {
              const hasBoth = match.homeTeam && match.awayTeam
              return (
                <div key={match.id} className={`card ${hasBoth ? 'border-wc-gold/25' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {match.matchLabel && <span className="badge bg-wc-red/15 text-wc-red border border-wc-red/25 text-[10px]">{match.matchLabel}</span>}
                      <span className="text-xs text-wc-muted">{match.date} · {match.kickoff}</span>
                      {hasBoth && <span className="text-xs text-wc-gold font-semibold">✓ Set</span>}
                    </div>
                    {(match.homeTeam || match.awayTeam) && (
                      <button onClick={() => handleClear(match.id)} disabled={saving === `${match.id}_clear`}
                        className="text-xs px-2 py-1 rounded bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors">
                        ↩ Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-wc-muted mb-3 border-l-2 border-wc-border pl-3 leading-relaxed">{match.label}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {['homeTeam','awayTeam'].map(side => {
                      const current  = match[side]
                      const key      = `${match.id}_${side}`
                      const sideLabel = side === 'homeTeam' ? 'Home' : 'Away'
                      return (
                        <div key={side}>
                          <label className="block text-xs text-wc-muted uppercase tracking-widest font-semibold mb-1.5">{sideLabel} Team</label>
                          {current && (
                            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-wc-gold/10 border border-wc-gold/25 rounded-lg">
                              <img src={`https://flagcdn.com/w40/${TEAMS[current]?.flag}.png`} className="rounded-sm w-7 h-[21px] object-cover" alt={current} />
                              <span className="font-display text-base font-bold text-wc-gold uppercase">{current}</span>
                              <span className="text-xs text-wc-muted">{TEAMS[current]?.name}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <select
                              value={current || ''}
                              onChange={e => { if (e.target.value !== (current || '')) handleTeamSet(match.id, side, e.target.value) }}
                              className="input flex-1 text-sm"
                              disabled={saving === key}
                            >
                              <option value="">— Select team —</option>
                              {TEAM_CODES.map(code => (
                                <option key={code} value={code}>{code} — {TEAMS[code]?.name}</option>
                              ))}
                            </select>
                            {saving === key && <div className="flex items-center px-2"><div className="w-4 h-4 border-2 border-wc-gold/40 border-t-wc-gold rounded-full animate-spin"/></div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-wc-border text-xs text-wc-muted">
                    📍 {match.venue} · {match.city}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── RESULTS SUB-TAB ── */}
      {subTab === 'results' && (
        <div className="space-y-3">
          {phaseMatches.filter(m => m.homeTeam && m.awayTeam).length === 0 ? (
            <div className="card border-dashed text-center py-12 text-wc-muted">
              <div className="text-4xl mb-3">🏷</div>
              <p className="font-display text-xl font-bold uppercase mb-1">No Teams Assigned Yet</p>
              <p className="text-sm">Switch to the Assign Teams tab and finalise this round first.</p>
            </div>
          ) : (
            [...phaseMatches].filter(m => m.homeTeam && m.awayTeam).map(match => {
              const sc = scores[match.id] || {}
              const isFinished = match.status === 'finished'
              const isLive     = match.status === 'live'
              let dateStr = ''
              try { dateStr = format(parseISO(match.date), 'dd MMM · HH:mm') } catch {}
              return (
                <div key={match.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${isFinished ? 'opacity-70' : isLive ? 'border-green-700/50' : ''}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img src={`https://flagcdn.com/w40/${TEAMS[match.homeTeam]?.flag}.png`} className="rounded-sm w-7 h-[21px] object-cover" alt={match.homeTeam} />
                      <span className="font-display text-base font-bold uppercase text-white">{match.homeTeam}</span>
                    </div>
                    <span className="text-wc-muted font-bold text-sm">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold uppercase text-white">{match.awayTeam}</span>
                      <img src={`https://flagcdn.com/w40/${TEAMS[match.awayTeam]?.flag}.png`} className="rounded-sm w-7 h-[21px] object-cover" alt={match.awayTeam} />
                    </div>
                    <div className="ml-auto sm:ml-0 flex items-center gap-2 flex-shrink-0">
                      <span className={`badge border text-xs ${isFinished ? 'bg-green-900/30 text-green-400 border-green-800/50' : isLive ? 'bg-red-900/30 text-red-400 border-red-800/50 animate-pulse' : 'bg-wc-border/40 text-wc-muted border-wc-border'}`}>{match.status}</span>
                      <span className="text-xs text-wc-muted hidden sm:inline">{dateStr}</span>
                    </div>
                  </div>
                  {isFinished && (
                    <div className="font-display text-xl font-black text-wc-gold text-center flex-shrink-0">
                      {match.finalHome} – {match.finalAway}
                      <div className="text-xs text-green-400 font-normal font-body mt-0.5">Resolved ✓</div>
                    </div>
                  )}
                  {!isFinished && (
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {/* 90-min / AET score */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-wc-muted uppercase tracking-widest hidden sm:block">Score</span>
                        <input type="number" min="0" max="20" value={sc.home ?? ''} onChange={e => setScore(match.id,'home',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                        <span className="text-wc-muted font-bold">–</span>
                        <input type="number" min="0" max="20" value={sc.away ?? ''} onChange={e => setScore(match.id,'away',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5" placeholder="–" />
                      </div>
                      {/* Penalty row — only show when scores are equal */}
                      {sc.home !== '' && sc.away !== '' && sc.home !== undefined && sc.away !== undefined && parseInt(sc.home) === parseInt(sc.away) && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-wc-gold uppercase tracking-widest font-bold hidden sm:block">Pens</span>
                          <input type="number" min="0" max="30" value={sc.penHome ?? ''} onChange={e => setScore(match.id,'penHome',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5 border-wc-gold/50 text-wc-gold" placeholder="–" />
                          <span className="text-wc-gold font-bold">–</span>
                          <input type="number" min="0" max="30" value={sc.penAway ?? ''} onChange={e => setScore(match.id,'penAway',e.target.value)} className="w-14 input text-center font-display text-lg font-bold p-1.5 border-wc-gold/50 text-wc-gold" placeholder="–" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 flex-shrink-0">
                    {!isFinished && (
                      <>
                        {!isLive && (
                          <button onClick={() => setMatchLive(match.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-800/40 transition-colors">🔴 Live</button>
                        )}
                        <button onClick={() => resolveKnockout(match)} disabled={resolving === match.id} className="btn-gold py-1.5 text-sm disabled:opacity-60">
                          {resolving === match.id ? '⏳' : '✓ Resolve'}
                        </button>
                      </>
                    )}
                    {isFinished && (
                      <button onClick={() => resetMatch(match.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors">↩ Reset</button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { matches, updateMatchResult, setMatchLive, resetMatch, updateKnockoutTeam, clearKnockoutTeams } = useMatches()
  const [tab, setTab] = useState('results')

  // Finalise a knockout round — marks all matches as 'scheduled' so they appear
  // in Schedule + Predictions. The status transitions from 'pending' → 'upcoming'.
  async function finaliseRound(phase, phaseMatches) {
    // For each match in this phase that has both teams, ensure it's in Firestore
    // with status 'upcoming' so the predict page picks them up
    const { setDoc, doc } = await import('firebase/firestore')
    const promises = phaseMatches
      .filter(m => m.homeTeam && m.awayTeam)
      .map(m =>
        setDoc(doc(db, 'matches', m.id), {
          homeTeam:  m.homeTeam,
          awayTeam:  m.awayTeam,
          status:    m.status === 'upcoming' ? 'upcoming' : m.status,
          finalised: true,
        }, { merge: true })
      )
    await Promise.all(promises)
  }

  const finishedCount  = matches.filter(m => m.status === 'finished').length
  const knockoutFilled = matches
    .filter(m => KNOCKOUT_PHASES.includes(m.phase) && m.homeTeam && m.awayTeam).length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-wc-gold flex items-center justify-center">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Admin Panel</h1>
          <p className="text-wc-muted text-sm">Results · Knockout brackets · Predictions</p>
        </div>
      </div>

      <div className="mb-6 mt-4 flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-800/50 rounded-xl">
        <span className="text-amber-400 text-xl flex-shrink-0">⚠️</span>
        <p className="text-amber-300/80 text-xs leading-relaxed">
          <strong className="text-amber-200">Admin only.</strong> Resolving a match permanently awards prediction points to all users.
          Finalising a knockout round makes those matches visible to all users immediately.
        </p>
      </div>

      <div className="flex gap-2 mb-7 border-b border-wc-border pb-4">
        <button onClick={() => setTab('results')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'results' ? 'bg-wc-red text-white shadow-lg shadow-red-900/30' : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'}`}>
          ⚽ Group Results
          {finishedCount > 0 && <span className="ml-1 bg-white/15 text-white text-xs px-1.5 py-0.5 rounded-full">{finishedCount}</span>}
        </button>
        <button onClick={() => setTab('knockout')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'knockout' ? 'bg-wc-gold text-black shadow-lg shadow-yellow-900/30' : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'}`}>
          🏆 Knockout Rounds
          {knockoutFilled > 0 && <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === 'knockout' ? 'bg-black/20' : 'bg-wc-gold/20 text-wc-gold'}`}>{knockoutFilled} set</span>}
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
          finaliseRound={finaliseRound}
          updateMatchResult={updateMatchResult}
          setMatchLive={setMatchLive}
          resetMatch={resetMatch}
        />
      )}
    </div>
  )
}