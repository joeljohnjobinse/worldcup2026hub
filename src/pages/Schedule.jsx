import { useState } from 'react'
import { MATCHES as STATIC_MATCHES, PHASES, GROUPS } from '../firebase/matchData'
import { useMatches } from '../hooks/useMatches'
import MatchCard from '../components/MatchCard'
import { format, parseISO } from 'date-fns'

export default function Schedule() {
  const [phase, setPhase]   = useState('All')
  const [group, setGroup]   = useState('All')
  const [search, setSearch] = useState('')
  const { matches: MATCHES } = useMatches() // live data — knockout teams show when assigned

  const filtered = MATCHES.filter(m => {
    if (phase !== 'All' && m.phase !== phase) return false
    if (group !== 'All' && m.group !== group) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (m.homeTeam?.toLowerCase().includes(q)) ||
        (m.awayTeam?.toLowerCase().includes(q)) ||
        m.venue.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        (m.label?.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Group by date
  const byDate = {}
  filtered.forEach(m => {
    if (!byDate[m.date]) byDate[m.date] = []
    byDate[m.date].push(m)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">
          Match Schedule
        </h1>
        <p className="text-wc-muted">All 104 matches · June 11 – July 19, 2026</p>
      </div>

      {/* Filters */}
      <div className="card mb-8 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Team, venue, city…"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Phase</label>
          <select
            value={phase}
            onChange={e => setPhase(e.target.value)}
            className="input min-w-[160px]"
          >
            <option>All</option>
            {PHASES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Group</label>
          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="input min-w-[120px]"
          >
            <option>All</option>
            {GROUPS.map(g => <option key={g}>Group {g}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setPhase('All'); setGroup('All'); setSearch('') }}
            className="btn-ghost text-sm py-2.5"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-wc-muted text-sm">{filtered.length} matches</span>
      </div>

      {/* Matches by date */}
      {Object.keys(byDate).sort().length === 0 ? (
        <div className="text-center py-20 text-wc-muted">No matches found.</div>
      ) : (
        Object.keys(byDate).sort().map(date => {
          let dateLabel = date
          try { dateLabel = format(parseISO(date), 'EEEE, MMMM d, yyyy') } catch {}
          return (
            <div key={date} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-wc-border" />
                <span className="text-sm font-semibold text-wc-muted uppercase tracking-widest px-3">{dateLabel}</span>
                <div className="h-px flex-1 bg-wc-border" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...byDate[date]].sort((a,b) => (a.kickoff||'').localeCompare(b.kickoff||'')).map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}