import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { MATCHES as STATIC_MATCHES, TEAMS, GROUPS } from '../firebase/matchData'

// ── Compute full standings for a single group ─────────────────────────────────
function computeGroup(groupLetter, matches) {
  const teamCodes = new Set()
  matches.forEach(m => {
    if (m.group === groupLetter && m.homeTeam && m.awayTeam) {
      teamCodes.add(m.homeTeam)
      teamCodes.add(m.awayTeam)
    }
  })

  const table = {}
  teamCodes.forEach(code => {
    table[code] = { code, group: groupLetter, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, yc: 0, rc: 0 }
  })

  matches.forEach(m => {
    if (m.group !== groupLetter || m.status !== 'finished') return
    if (m.finalHome === null || m.finalAway === null) return
    const { homeTeam: h, awayTeam: a, finalHome: fh, finalAway: fa } = m
    if (!table[h] || !table[a]) return

    table[h].p++; table[a].p++
    table[h].gf += fh; table[h].ga += fa
    table[a].gf += fa; table[a].ga += fh
    table[h].gd = table[h].gf - table[h].ga
    table[a].gd = table[a].gf - table[a].ga

    if (fh > fa)      { table[h].w++; table[h].pts += 3; table[a].l++ }
    else if (fa > fh) { table[a].w++; table[a].pts += 3; table[h].l++ }
    else              { table[h].d++; table[h].pts++;     table[a].d++; table[a].pts++ }

    // Yellow/red cards if stored
    if (m.homeYC !== undefined) table[h].yc += m.homeYC || 0
    if (m.awayYC !== undefined) table[a].yc += m.awayYC || 0
    if (m.homeRC !== undefined) table[h].rc += m.homeRC || 0
    if (m.awayRC !== undefined) table[a].rc += m.awayRC || 0
  })

  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
  )
}

// ── Fair play score: lower is better (1pt per YC, 3pt per RC, 10pt per YC+RC) ─
function fairPlay(row) {
  return (row.yc || 0) * 1 + (row.rc || 0) * 3
}

// ── Rank 12 third-place teams by official FIFA 5-step criteria ────────────────
function rankThirdPlaced(allGroupStandings) {
  const thirds = allGroupStandings
    .map(({ group, rows }) => rows[2] ? { ...rows[2], group } : null)
    .filter(Boolean)

  // Sort by: 1) pts, 2) gd, 3) gf, 4) fair play (asc), 5) FIFA ranking (proxy: alpha)
  return thirds.sort((a, b) => {
    if (b.pts !== a.pts)         return b.pts - a.pts
    if (b.gd  !== a.gd)         return b.gd  - a.gd
    if (b.gf  !== a.gf)         return b.gf  - a.gf
    if (fairPlay(a) !== fairPlay(b)) return fairPlay(a) - fairPlay(b) // lower FP = better
    return a.code.localeCompare(b.code) // FIFA ranking placeholder → alphabetical
  })
}

// ── Row highlight ─────────────────────────────────────────────────────────────
function posStyle(pos) {
  if (pos === 0) return { bg:'rgba(240,165,0,0.13)', border:'rgba(240,165,0,0.35)',   label:'1st', color:'#F0A500' }
  if (pos === 1) return { bg:'rgba(200,16,46,0.11)',  border:'rgba(200,16,46,0.35)',  label:'2nd', color:'#C8102E' }
  if (pos === 2) return { bg:'rgba(99,102,241,0.10)', border:'rgba(99,102,241,0.35)', label:'3rd', color:'#818CF8' }
  return           { bg:'transparent', border:'transparent', label:'', color:'transparent' }
}

// ── Group table component ─────────────────────────────────────────────────────
function GroupTable({ groupLetter, rows }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-wc-red flex items-center justify-center flex-shrink-0">
          <span className="font-display text-sm font-black text-white">{groupLetter}</span>
        </div>
        <span className="font-display text-xl font-bold uppercase text-white tracking-wide">Group {groupLetter}</span>
      </div>

      {/* Column headers */}
      <div className="grid text-[10px] font-bold uppercase tracking-widest text-wc-muted pb-2 border-b border-wc-border mb-1"
        style={{ gridTemplateColumns:'20px 1fr 26px 26px 26px 26px 28px 26px 34px' }}>
        <span />
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">GF</span>
        <span className="text-center text-wc-gold">PTS</span>
      </div>

      <div className="space-y-0.5">
        {rows.map((row, i) => {
          const team  = TEAMS[row.code]
          const style = posStyle(i)
          const hp    = row.p > 0
          return (
            <div key={row.code}
              className="grid items-center rounded-lg py-2 px-1 transition-colors hover:bg-white/5"
              style={{
                gridTemplateColumns:'20px 1fr 26px 26px 26px 26px 28px 26px 34px',
                background: style.bg,
                borderLeft: style.label ? `2.5px solid ${style.border}` : '2.5px solid transparent',
              }}
            >
              <span className="font-display text-sm font-bold text-wc-muted text-center">{i+1}</span>
              <div className="flex items-center gap-2 min-w-0">
                <img src={`https://flagcdn.com/w40/${team?.flag}.png`} alt={row.code}
                  className="rounded-sm flex-shrink-0" style={{ width:'1.5rem', height:'1.125rem', objectFit:'cover' }} />
                <span className="font-display text-sm font-bold text-white uppercase truncate">{row.code}</span>
                {i < 3 && (
                  <span className="text-[9px] font-black px-1 py-0.5 rounded hidden sm:inline"
                    style={{ background: style.border, color: style.color, opacity:0.9 }}>
                    {style.label}
                  </span>
                )}
              </div>
              {[row.p, row.w, row.d, row.l].map((v, j) => (
                <span key={j} className="text-center text-sm font-medium text-wc-muted">{hp ? v : '—'}</span>
              ))}
              <span className={`text-center text-sm font-semibold ${
                !hp ? 'text-wc-muted' : row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-wc-muted'
              }`}>{!hp ? '—' : row.gd > 0 ? `+${row.gd}` : row.gd}</span>
              <span className="text-center text-sm font-medium text-wc-muted">{hp ? row.gf : '—'}</span>
              <span className="text-center font-display text-base font-black text-wc-gold">{hp ? row.pts : '—'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Third-place ranking table ─────────────────────────────────────────────────
function ThirdPlaceTable({ rankedThirds }) {
  const anyPlayed = rankedThirds.some(r => r.p > 0)

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-wc-gold flex items-center justify-center flex-shrink-0">
              <span className="text-base">3️⃣</span>
            </div>
            <span className="font-display text-xl font-bold uppercase text-white tracking-wide">
              Best Third-Place Ranking
            </span>
          </div>
          <p className="text-xs text-wc-muted ml-10">
            Top 8 of 12 third-placed teams advance to the Round of 32
          </p>
        </div>
        <span className="badge bg-wc-gold/20 text-wc-gold border border-wc-gold/30 text-[10px] flex-shrink-0 mt-1">
          8 qualify
        </span>
      </div>

      {/* FIFA criteria explanation */}
      <div className="mt-3 mb-4 rounded-lg border border-wc-border/60 bg-white/[0.03] px-4 py-3">
        <p className="text-[10px] font-bold text-wc-muted uppercase tracking-widest mb-2">FIFA Ranking Criteria (in order)</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {[
            '① Points',
            '② Goal difference',
            '③ Goals scored',
            '④ Fair Play (cards)',
            '⑤ FIFA ranking',
          ].map(c => (
            <span key={c} className="text-xs text-wc-muted">{c}</span>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid text-[10px] font-bold uppercase tracking-widest text-wc-muted pb-2 border-b border-wc-border mb-1"
        style={{ gridTemplateColumns:'28px 1fr 36px 26px 26px 26px 26px 28px 26px 28px 34px' }}>
        <span className="text-center">#</span>
        <span>Team</span>
        <span className="text-center">Grp</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">GF</span>
        <span className="text-center">FP</span>
        <span className="text-center text-wc-gold">PTS</span>
      </div>

      <div className="space-y-0.5">
        {rankedThirds.map((row, i) => {
          const team      = TEAMS[row.code]
          const qualifies = i < 8
          const hp        = row.p > 0
          const fp        = fairPlay(row)
          return (
            <div key={row.code}
              className="grid items-center rounded-lg py-2 px-1 transition-colors hover:bg-white/5"
              style={{
                gridTemplateColumns:'28px 1fr 36px 26px 26px 26px 26px 28px 26px 28px 34px',
                background: qualifies
                  ? i < 4  ? 'rgba(240,165,0,0.08)'
                  : i < 8  ? 'rgba(200,16,46,0.07)'
                  : 'transparent'
                  : 'transparent',
                borderLeft: qualifies
                  ? i < 4 ? '2.5px solid rgba(240,165,0,0.4)' : '2.5px solid rgba(200,16,46,0.3)'
                  : '2.5px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {qualifies
                  ? <span className={`font-display text-base font-black ${i < 4 ? 'text-wc-gold' : 'text-wc-red'}`}>{i+1}</span>
                  : <span className="font-display text-sm font-bold text-wc-muted">{i+1}</span>
                }
              </div>

              {/* Team */}
              <div className="flex items-center gap-2 min-w-0">
                <img src={`https://flagcdn.com/w40/${team?.flag}.png`} alt={row.code}
                  className="rounded-sm flex-shrink-0" style={{ width:'1.5rem', height:'1.125rem', objectFit:'cover' }} />
                <span className="font-display text-sm font-bold text-white uppercase truncate">{row.code}</span>
                {qualifies && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full hidden sm:inline ${
                    i < 4 ? 'bg-wc-gold/20 text-wc-gold' : 'bg-wc-red/20 text-wc-red'
                  }`}>Q</span>
                )}
                {!qualifies && anyPlayed && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline bg-wc-border/40 text-wc-muted">OUT</span>
                )}
              </div>

              {/* Group */}
              <div className="flex items-center justify-center">
                <span className="w-5 h-5 rounded bg-wc-border/50 flex items-center justify-center font-display text-xs font-black text-wc-muted">
                  {row.group}
                </span>
              </div>

              {/* P W D L */}
              {[row.p, row.w, row.d, row.l].map((v, j) => (
                <span key={j} className="text-center text-sm font-medium text-wc-muted">{hp ? v : '—'}</span>
              ))}

              {/* GD */}
              <span className={`text-center text-sm font-semibold ${
                !hp ? 'text-wc-muted' : row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-wc-muted'
              }`}>{!hp ? '—' : row.gd > 0 ? `+${row.gd}` : row.gd}</span>

              {/* GF */}
              <span className="text-center text-sm font-medium text-wc-muted">{hp ? row.gf : '—'}</span>

              {/* Fair Play */}
              <span className={`text-center text-sm font-medium ${fp > 0 ? 'text-yellow-400' : 'text-wc-muted'}`}>
                {hp ? (fp > 0 ? `-${fp}` : '0') : '—'}
              </span>

              {/* PTS */}
              <span className={`text-center font-display text-base font-black ${qualifies ? 'text-wc-gold' : 'text-wc-muted'}`}>
                {hp ? row.pts : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-wc-border flex flex-wrap gap-4 text-xs text-wc-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-wc-gold/40" />
          <span>Rank 1–4 — Qualify</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-wc-red/40" />
          <span>Rank 5–8 — Qualify</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-wc-border/40" />
          <span>Rank 9–12 — Eliminated</span>
        </div>
        <span className="ml-auto hidden sm:block">FP = Fair Play penalty (YC×1 + RC×3, lower is better)</span>
      </div>
    </div>
  )
}

// ── Round of 32 bracket preview ───────────────────────────────────────────────
function R32Preview({ matches }) {
  const r32 = matches.filter(m => m.phase === 'Round of 32')
  if (!r32.length) return null
  return (
    <div className="card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-sm font-black text-white">32</span>
        </div>
        <span className="font-display text-xl font-bold uppercase text-white tracking-wide">Round of 32 — Matchups</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {r32.map(m => (
          <div key={m.id} className="flex items-center gap-2 bg-white/[0.03] border border-wc-border/50 rounded-lg px-3 py-2.5">
            <span className="text-[10px] font-black text-wc-red tracking-widest flex-shrink-0 w-8">{m.matchLabel}</span>
            <span className="text-sm font-semibold text-wc-light leading-snug">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Standings() {
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading]     = useState(true)
  const [activeGroup, setActiveGroup] = useState('All')
  const [activeTab, setActiveTab] = useState('groups') // 'groups' | 'thirds' | 'bracket'

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snap => {
      const map = {}
      snap.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const matches = STATIC_MATCHES.map(m => ({ ...m, ...(overrides[m.id] || {}) }))

  const groupStandings = GROUPS.map(g => ({ group: g, rows: computeGroup(g, matches) }))
  const rankedThirds   = rankThirdPlaced(groupStandings)

  const totalFinished = matches.filter(m => m.status === 'finished').length
  const totalGoals    = matches
    .filter(m => m.status === 'finished' && m.finalHome !== null)
    .reduce((s, m) => s + (m.finalHome || 0) + (m.finalAway || 0), 0)

  const filteredGroups = activeGroup === 'All'
    ? groupStandings
    : groupStandings.filter(g => g.group === activeGroup)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-wc-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Standings</h1>
        <p className="text-wc-muted">Group tables · Third-place ranking · Round of 32 bracket — all updated live.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Groups',          value:12,            icon:'🔢' },
          { label:'Matches Played',  value:totalFinished, icon:'⚽' },
          { label:'Goals Scored',    value:totalGoals,    icon:'🥅' },
          { label:'Teams',           value:48,            icon:'🏳️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-display text-3xl font-black text-wc-gold">{value}</div>
            <div className="text-xs text-wc-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Main tab switcher */}
      <div className="flex gap-2 mb-6 border-b border-wc-border pb-4">
        {[
          { key:'groups',  label:'📊 Group Tables' },
          { key:'thirds',  label:'3️⃣  Best Third Places' },
          { key:'bracket', label:'🏆 R32 Bracket' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-wc-red text-white shadow-lg shadow-red-900/30'
                : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
            }`}
          >{label}</button>
        ))}
      </div>

      {/* ── GROUP TABLES TAB ── */}
      {activeTab === 'groups' && (
        <>
          {/* Legend */}
          <div className="card mb-5 flex flex-wrap gap-4 items-center text-sm">
            <span className="text-xs text-wc-muted uppercase tracking-widest font-semibold flex-shrink-0">Legend:</span>
            {[
              { color:'bg-wc-gold/60',    label:'1st — Qualifies directly' },
              { color:'bg-wc-red/50',     label:'2nd — Qualifies directly' },
              { color:'bg-indigo-500/50', label:'3rd — May qualify (best of 12)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${color}`} />
                <span className="text-wc-muted text-xs">{label}</span>
              </div>
            ))}
            <div className="ml-auto text-xs text-wc-muted hidden sm:block">
              {totalFinished === 0 ? '⏳ Awaiting results…' : `🔴 ${totalFinished} matches resolved`}
            </div>
          </div>

          {/* Group filter tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setActiveGroup('All')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeGroup === 'All' ? 'bg-wc-red text-white' : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
              }`}>All Groups</button>
            {GROUPS.map(g => (
              <button key={g} onClick={() => setActiveGroup(activeGroup === g ? 'All' : g)}
                className={`w-10 h-8 rounded-lg text-sm font-bold transition-all ${
                  activeGroup === g ? 'bg-wc-gold text-black' : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
                }`}>{g}</button>
            ))}
          </div>

          {totalFinished === 0 && (
            <div className="card border-dashed border-wc-gold/30 text-center py-8 mb-5">
              <div className="text-4xl mb-3">⏳</div>
              <p className="font-display text-2xl font-bold text-white uppercase mb-1">Tables Not Started</p>
              <p className="text-wc-muted text-sm">Standings update automatically once match results are entered in the Admin panel.</p>
            </div>
          )}

          <div className={`grid gap-5 ${activeGroup === 'All' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'max-w-2xl'}`}>
            {filteredGroups.map(({ group, rows }) => (
              <GroupTable key={group} groupLetter={group} rows={rows} />
            ))}
          </div>
        </>
      )}

      {/* ── THIRD PLACE TAB ── */}
      {activeTab === 'thirds' && (
        <ThirdPlaceTable rankedThirds={rankedThirds} />
      )}

      {/* ── R32 BRACKET TAB ── */}
      {activeTab === 'bracket' && (
        <R32Preview matches={matches} />
      )}
    </div>
  )
}