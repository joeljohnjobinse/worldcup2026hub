import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { MATCHES as STATIC_MATCHES, TEAMS, GROUPS } from '../firebase/matchData'

// ── Compute standings from match results ──────────────────────────────────────
function computeGroup(groupLetter, matches) {
  // All teams in this group
  const teamCodes = new Set()
  matches.forEach(m => {
    if (m.group === groupLetter && m.homeTeam && m.awayTeam) {
      teamCodes.add(m.homeTeam)
      teamCodes.add(m.awayTeam)
    }
  })

  // Init table
  const table = {}
  teamCodes.forEach(code => {
    table[code] = { code, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
  })

  // Process finished matches in this group
  matches.forEach(m => {
    if (m.group !== groupLetter) return
    if (m.status !== 'finished') return
    if (m.finalHome === null || m.finalAway === null) return
    const { homeTeam: h, awayTeam: a, finalHome: fh, finalAway: fa } = m
    if (!table[h] || !table[a]) return

    table[h].p++;  table[a].p++
    table[h].gf += fh; table[h].ga += fa
    table[a].gf += fa; table[a].ga += fh
    table[h].gd = table[h].gf - table[h].ga
    table[a].gd = table[a].gf - table[a].ga

    if (fh > fa) {
      table[h].w++; table[h].pts += 3
      table[a].l++
    } else if (fa > fh) {
      table[a].w++; table[a].pts += 3
      table[h].l++
    } else {
      table[h].d++; table[h].pts++
      table[a].d++; table[a].pts++
    }
  })

  // Sort: pts → gd → gf → alpha
  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
  )
}

const QUAL_POSITIONS = [0, 1, 2] // top 3 qualify from each group (WC2026 format)

// Position highlight colours
function rowStyle(pos, total) {
  if (pos === 0) return { bg: 'rgba(240,165,0,0.12)',   border: 'rgba(240,165,0,0.3)',    label: 'Q1',  labelColor: '#F0A500' }
  if (pos === 1) return { bg: 'rgba(200,16,46,0.10)',   border: 'rgba(200,16,46,0.3)',    label: 'Q2',  labelColor: '#C8102E' }
  if (pos === 2) return { bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.3)',   label: 'Q3',  labelColor: '#818CF8' }
  return              { bg: 'transparent',              border: 'transparent',            label: '',    labelColor: 'transparent' }
}

function GroupTable({ groupLetter, rows, activeGroup, setActiveGroup }) {
  const isActive = activeGroup === groupLetter || activeGroup === 'All'

  return (
    <div className={`card transition-all duration-200 ${isActive ? '' : 'opacity-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-wc-red flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm font-black text-white">{groupLetter}</span>
          </div>
          <span className="font-display text-xl font-bold uppercase text-white tracking-wide">Group {groupLetter}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-wc-gold" title="Qualified position 1" />
          <span className="w-2 h-2 rounded-full bg-wc-red"  title="Qualified position 2" />
          <span className="w-2 h-2 rounded-full bg-indigo-400" title="Qualified position 3" />
        </div>
      </div>

      {/* Column headers */}
      <div className="grid text-[10px] font-bold uppercase tracking-widest text-wc-muted pb-2 border-b border-wc-border mb-1"
        style={{ gridTemplateColumns: '20px 1fr 28px 28px 28px 28px 28px 28px 36px' }}>
        <span></span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">GF</span>
        <span className="text-center font-black text-wc-gold">PTS</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {rows.map((row, i) => {
          const team = TEAMS[row.code]
          const style = rowStyle(i, rows.length)
          const hasPlayed = row.p > 0
          return (
            <div key={row.code}
              className="grid items-center rounded-lg py-2 px-1 transition-colors hover:bg-white/5"
              style={{
                gridTemplateColumns: '20px 1fr 28px 28px 28px 28px 28px 28px 36px',
                background: style.bg,
                borderLeft: style.label ? `2px solid ${style.border}` : '2px solid transparent',
              }}
            >
              {/* Rank */}
              <span className="font-display text-sm font-bold text-wc-muted text-center">{i + 1}</span>

              {/* Team */}
              <div className="flex items-center gap-2 min-w-0">
                <span className={`fi fi-${team?.flag} rounded flex-shrink-0`} style={{ width: '1.4rem', height: '1.05rem' }} />
                <span className="font-display text-sm font-bold text-white uppercase truncate">{row.code}</span>
                {style.label && (
                  <span className="text-[9px] font-black px-1 py-0.5 rounded" style={{ background: `${style.border}`, color: style.labelColor, opacity: 0.9 }}>
                    {style.label}
                  </span>
                )}
              </div>

              {/* Stats */}
              {[row.p, row.w, row.d, row.l].map((v, j) => (
                <span key={j} className="text-center text-sm font-medium text-wc-muted">{hasPlayed ? v : '—'}</span>
              ))}
              <span className={`text-center text-sm font-semibold ${!hasPlayed ? 'text-wc-muted' : row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-wc-muted'}`}>
                {!hasPlayed ? '—' : row.gd > 0 ? `+${row.gd}` : row.gd}
              </span>
              <span className="text-center text-sm font-medium text-wc-muted">{hasPlayed ? row.gf : '—'}</span>
              <span className="text-center font-display text-base font-black text-wc-gold">{hasPlayed ? row.pts : '—'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Standings() {
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading]     = useState(true)
  const [activeGroup, setActiveGroup] = useState('All')

  // Listen for Firestore match updates (same pattern as useMatches)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snap => {
      const map = {}
      snap.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  // Merge static + Firestore overrides
  const matches = STATIC_MATCHES.map(m => ({ ...m, ...(overrides[m.id] || {}) }))

  // Compute standings for every group
  const groupStandings = GROUPS.map(g => ({
    group: g,
    rows: computeGroup(g, matches),
  }))

  // Summary stats
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
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">
          Standings
        </h1>
        <p className="text-wc-muted">Group stage tables — updated live after each match is resolved.</p>
      </div>

      {/* Live stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Groups',            value: 12,            icon: '🔢' },
          { label: 'Matches Played',    value: totalFinished, icon: '⚽' },
          { label: 'Goals Scored',      value: totalGoals,    icon: '🥅' },
          { label: 'Teams Competing',   value: 48,            icon: '🏳️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-display text-3xl font-black text-wc-gold">{value}</div>
            <div className="text-xs text-wc-muted mt-1 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Qualification legend */}
      <div className="card mb-6 flex flex-wrap gap-4 items-center text-sm">
        <span className="text-xs text-wc-muted uppercase tracking-widest font-semibold flex-shrink-0">Legend:</span>
        {[
          { color: 'bg-wc-gold/60',     label: '1st place — Qualifies' },
          { color: 'bg-wc-red/60',      label: '2nd place — Qualifies' },
          { color: 'bg-indigo-500/60',  label: '3rd place — Qualifies' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-wc-muted text-xs">{label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-wc-muted hidden sm:block">
          {totalFinished === 0 ? '⏳ Waiting for results…' : `🔴 Live — ${totalFinished} matches resolved`}
        </div>
      </div>

      {/* Group filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveGroup('All')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeGroup === 'All'
              ? 'bg-wc-red text-white shadow-lg shadow-red-900/30'
              : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
          }`}
        >
          All Groups
        </button>
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(activeGroup === g ? 'All' : g)}
            className={`w-10 h-8 rounded-lg text-sm font-bold transition-all ${
              activeGroup === g
                ? 'bg-wc-gold text-black shadow-lg shadow-yellow-900/30'
                : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* No results played yet banner */}
      {totalFinished === 0 && (
        <div className="card border-dashed border-wc-gold/30 text-center py-8 mb-6">
          <div className="text-4xl mb-3">⏳</div>
          <p className="font-display text-2xl font-bold text-white uppercase mb-1">Tables Not Started</p>
          <p className="text-wc-muted text-sm">Standings update automatically once match results are entered in the admin panel.</p>
        </div>
      )}

      {/* Group tables grid */}
      <div className={`grid gap-5 ${
        activeGroup === 'All'
          ? 'sm:grid-cols-2 xl:grid-cols-3'
          : 'max-w-2xl'
      }`}>
        {filteredGroups.map(({ group, rows }) => (
          <GroupTable
            key={group}
            groupLetter={group}
            rows={rows}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
          />
        ))}
      </div>

      {/* Top scorers placeholder */}
      <div className="mt-12 card border-dashed border-wc-border/50 text-center py-8">
        <div className="text-3xl mb-2">🥇</div>
        <p className="font-display text-xl font-bold text-white uppercase mb-1">Top Scorers</p>
        <p className="text-wc-muted text-sm">Coming soon — individual goalscorer tracking will be added.</p>
      </div>
    </div>
  )
}