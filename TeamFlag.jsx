import { TEAMS } from '../firebase/matchData'

export default function TeamFlag({ code, size = 'md', showName = false, nameClass = '' }) {
  const team = TEAMS[code]
  if (!team) return <span className="text-wc-muted text-sm">TBD</span>

  const sizeMap = {
    sm:  'w-6 h-4 text-xs',
    md:  'w-8 h-6 text-sm',
    lg:  'w-12 h-9 text-base',
    xl:  'w-16 h-12 text-lg',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`fi fi-${team.flag} rounded shadow-sm ${sizeMap[size]}`}
        title={team.name}
      />
      {showName && (
        <span className={`font-display font-bold text-wc-light uppercase tracking-wide ${nameClass}`}>
          {code}
        </span>
      )}
    </div>
  )
}