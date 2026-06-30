import { TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'

const phaseColors = {
  'Group Stage':   'bg-blue-900/40 text-blue-300 border-blue-800/50',
  'Round of 32':   'bg-purple-900/40 text-purple-300 border-purple-800/50',
  'Round of 16':   'bg-indigo-900/40 text-indigo-300 border-indigo-800/50',
  'Quarter-Final': 'bg-amber-900/40 text-amber-300 border-amber-800/50',
  'Semi-Final':    'bg-orange-900/40 text-orange-300 border-orange-800/50',
  'Third Place':   'bg-zinc-800/60 text-zinc-300 border-zinc-700',
  'Final':         'bg-wc-red/20 text-wc-gold border-wc-red/40',
}

function FlagImg({ code, size = 40 }) {
  const team = TEAMS[code]
  if (!team) return null
  return (
    <img
      src={`https://flagcdn.com/w${size}/${team.flag}.png`}
      alt={code}
      style={{ width: size === 40 ? '2.5rem' : '2rem', height: size === 40 ? '1.875rem' : '1.5rem', objectFit: 'cover' }}
      className="rounded shadow-sm flex-shrink-0"
    />
  )
}

export default function MatchCard({ match, prediction, onClick }) {
  const homeTeam   = match.homeTeam ? TEAMS[match.homeTeam] : null
  const awayTeam   = match.awayTeam ? TEAMS[match.awayTeam] : null
  const isKnockout = !match.group
  // A knockout match may have real teams assigned or still be TBD
  const hasTeams   = !!(match.homeTeam && match.awayTeam)
  const isFinished = match.status === 'finished'
  const isLive     = match.status === 'live'

  let dateStr = '—'
  try { dateStr = format(parseISO(match.date), 'EEE, dd MMM') } catch {}

  return (
    <div
      onClick={onClick}
      className={`card hover:border-wc-gold/40 transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-wc-gold/10' : ''}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge border ${phaseColors[match.phase] || 'bg-wc-border/40 text-wc-muted border-wc-border'}`}>
            {match.group ? `Group ${match.group}` : match.phase}
          </span>
          {match.matchLabel && (
            <span className="badge bg-wc-red/15 text-wc-red border border-wc-red/25 text-[10px]">{match.matchLabel}</span>
          )}
          {isLive && (
            <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">🔴 LIVE</span>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-xs text-wc-muted">{dateStr}</div>
          <div className="text-xs font-semibold text-wc-light">{match.kickoff}</div>
        </div>
      </div>

      {/* Teams section */}
      {/* Case 1: Knockout with no teams assigned yet */}
      {isKnockout && !hasTeams && (
        <div className="text-center py-4">
          <div className="font-display text-sm font-bold text-wc-muted uppercase tracking-wider leading-snug px-2">
            {match.label || 'TBD vs TBD'}
          </div>
        </div>
      )}

      {/* Case 2: Has both teams (group stage always, knockout once assigned) */}
      {hasTeams && (
        <div className="flex items-center justify-between gap-2">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <FlagImg code={match.homeTeam} size={40} />
            <span className="font-display text-base font-bold uppercase tracking-wide text-white">
              {match.homeTeam}
            </span>
            <span className="text-[10px] text-wc-muted text-center leading-tight hidden sm:block">
              {homeTeam?.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            {isFinished ? (
              <div className="flex flex-col items-center gap-0.5">
                {/* Main score */}
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-black text-wc-gold">{match.finalHome}</span>
                  <span className="text-wc-muted font-bold">–</span>
                  <span className="font-display text-2xl font-black text-wc-gold">{match.finalAway}</span>
                </div>
                {/* Penalty score — shown only when match went to pens */}
                {match.penHome !== null && match.penHome !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-wc-muted uppercase tracking-widest font-semibold">Pens</span>
                    <span className="font-display text-sm font-black text-wc-gold">
                      ({match.penHome}–{match.penAway})
                    </span>
                  </div>
                )}
                {/* AET label */}
                {match.finalHome === match.finalAway && match.penHome !== null && match.penHome !== undefined && (
                  <span className="text-[9px] text-wc-muted uppercase tracking-widest">AET</span>
                )}
              </div>
            ) : (
              <div className="font-display text-xl font-bold text-wc-muted">VS</div>
            )}
            {prediction && (
              <div className="text-center">
                <div className="text-xs text-wc-muted">Your pick</div>
                <div className="text-xs font-semibold text-wc-gold">
                  {prediction.predictedHome}–{prediction.predictedAway}
                </div>
                {prediction.pointsEarned !== null && (
                  <div className={`text-xs font-bold mt-0.5 ${prediction.pointsEarned > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {prediction.pointsEarned > 0 ? `+${prediction.pointsEarned} pts` : '0 pts'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <FlagImg code={match.awayTeam} size={40} />
            <span className="font-display text-base font-bold uppercase tracking-wide text-white">
              {match.awayTeam}
            </span>
            <span className="text-[10px] text-wc-muted text-center leading-tight hidden sm:block">
              {awayTeam?.name}
            </span>
          </div>
        </div>
      )}

      {/* Case 3: Knockout with only one team assigned */}
      {isKnockout && match.homeTeam && !match.awayTeam && (
        <div className="flex items-center justify-between gap-2 py-2">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <FlagImg code={match.homeTeam} size={40} />
            <span className="font-display text-base font-bold uppercase tracking-wide text-white">{match.homeTeam}</span>
          </div>
          <div className="font-display text-xl font-bold text-wc-muted">VS</div>
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-10 h-7 rounded bg-wc-border/30 border border-wc-border/50 flex items-center justify-center">
              <span className="text-xs text-wc-muted">?</span>
            </div>
            <span className="font-display text-xs font-bold text-wc-muted uppercase tracking-wide">TBD</span>
          </div>
        </div>
      )}

      {isKnockout && !match.homeTeam && match.awayTeam && (
        <div className="flex items-center justify-between gap-2 py-2">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-10 h-7 rounded bg-wc-border/30 border border-wc-border/50 flex items-center justify-center">
              <span className="text-xs text-wc-muted">?</span>
            </div>
            <span className="font-display text-xs font-bold text-wc-muted uppercase tracking-wide">TBD</span>
          </div>
          <div className="font-display text-xl font-bold text-wc-muted">VS</div>
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <FlagImg code={match.awayTeam} size={40} />
            <span className="font-display text-base font-bold uppercase tracking-wide text-white">{match.awayTeam}</span>
          </div>
        </div>
      )}

      {/* Venue */}
      <div className="mt-3 pt-3 border-t border-wc-border flex items-center gap-1.5 text-xs text-wc-muted">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {match.venue} · {match.city}
      </div>
    </div>
  )
}