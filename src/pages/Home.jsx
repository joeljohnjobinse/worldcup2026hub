import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TARGET = new Date('2026-06-12T00:30:00') // Opening match: MEX vs RSA

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

const CountBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-wc-card border border-wc-border rounded-xl w-20 h-20 flex items-center justify-center shadow-lg">
      <span className="font-display text-4xl font-black text-wc-gold tabular-nums">{String(value).padStart(2,'0')}</span>
    </div>
    <span className="text-xs text-wc-muted font-semibold uppercase tracking-widest mt-2">{label}</span>
  </div>
)

const GROUPS_PREVIEW = [
  { group: 'A', teams: ['MEX','RSA','KOR','CZE'] },
  { group: 'B', teams: ['CAN','BIH','QAT','SUI'] },
  { group: 'C', teams: ['BRA','MAR','HAI','SCO'] },
  { group: 'D', teams: ['USA','PAR','AUS','TUR'] },
  { group: 'E', teams: ['GER','CUW','CIV','ECU'] },
  { group: 'F', teams: ['NED','JPN','SWE','TUN'] },
  { group: 'G', teams: ['BEL','EGY','IRN','NZL'] },
  { group: 'H', teams: ['ESP','CPV','KSA','URU'] },
  { group: 'I', teams: ['FRA','SEN','IRQ','NOR'] },
  { group: 'J', teams: ['ARG','ALG','AUT','JOR'] },
  { group: 'K', teams: ['POR','COD','UZB','COL'] },
  { group: 'L', teams: ['ENG','CRO','GHA','PAN'] },
]

const FLAG_MAP = {
  MEX:'mx', RSA:'za', KOR:'kr', CZE:'cz',
  CAN:'ca', BIH:'ba', QAT:'qa', SUI:'ch',
  BRA:'br', MAR:'ma', HAI:'ht', SCO:'gb-sct',
  USA:'us', PAR:'py', AUS:'au', TUR:'tr',
  GER:'de', CUW:'cw', CIV:'ci', ECU:'ec',
  NED:'nl', JPN:'jp', SWE:'se', TUN:'tn',
  BEL:'be', EGY:'eg', IRN:'ir', NZL:'nz',
  ESP:'es', CPV:'cv', KSA:'sa', URU:'uy',
  FRA:'fr', SEN:'sn', IRQ:'iq', NOR:'no',
  ARG:'ar', ALG:'dz', AUT:'at', JOR:'jo',
  POR:'pt', COD:'cd', UZB:'uz', COL:'co',
  ENG:'gb-eng', CRO:'hr', GHA:'gh', PAN:'pa',
}

export default function Home() {
  const { user, profile } = useAuth()
  const countdown = useCountdown(TARGET)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C8102E 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F0A500 0%, transparent 40%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-wc-red/20 border border-wc-red/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm text-wc-gold font-semibold tracking-wide">🏆 FIFA WORLD CUP 2026</span>
          </div>
          <h1 className="font-display text-6xl sm:text-8xl font-black text-white uppercase tracking-tight mb-3">
            Friends<br />
            <span className="text-transparent bg-clip-text bg-gold-gradient">Hub</span>
          </h1>
          <p className="text-wc-muted text-lg max-w-lg mx-auto mb-10 font-body">
            Predict matches, climb the leaderboard, generate your own tickets — all with your crew.
          </p>

          {/* Countdown */}
          <div className="flex items-end justify-center gap-4 mb-10">
            <CountBox value={countdown.days}    label="Days" />
            <div className="font-display text-3xl font-black text-wc-red mb-5">:</div>
            <CountBox value={countdown.hours}   label="Hours" />
            <div className="font-display text-3xl font-black text-wc-red mb-5">:</div>
            <CountBox value={countdown.minutes} label="Mins" />
            <div className="font-display text-3xl font-black text-wc-red mb-5">:</div>
            <CountBox value={countdown.seconds} label="Secs" />
          </div>
          <p className="text-xs text-wc-muted mb-10">Until kick-off · MEX vs RSA · Estadio Azteca, Mexico City</p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/schedule" className="btn-gold text-base px-8 py-3">View Schedule</Link>
            {user
              ? <Link to="/predict" className="btn-primary text-base px-8 py-3">Make Predictions</Link>
              : <Link to="/register" className="btn-ghost text-base px-8 py-3">Join the Hub</Link>
            }
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-wc-card border-y border-wc-border">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Teams',   value: '48' },
            { label: 'Matches', value: '104' },
            { label: 'Venues',  value: '16' },
            { label: 'Days',    value: '39' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-display text-3xl font-black text-wc-gold">{value}</div>
              <div className="text-xs text-wc-muted font-semibold uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Groups Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display text-4xl font-black uppercase tracking-wide text-white mb-2">
          Group Stage
        </h2>
        <p className="text-wc-muted mb-8">12 groups · 48 teams · 3 advance per group</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GROUPS_PREVIEW.map(({ group, teams }) => (
            <div key={group} className="card hover:border-wc-gold/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-wc-red flex items-center justify-center">
                  <span className="font-display text-sm font-black text-white">{group}</span>
                </div>
                <span className="font-display text-sm font-bold text-wc-muted uppercase tracking-widest">Group {group}</span>
              </div>
              <div className="space-y-2">
                {[...new Set(teams)].slice(0,4).map(code => (
                  <div key={code} className="flex items-center gap-2">
                    <span className={`fi fi-${FLAG_MAP[code] || 'un'} rounded`} style={{ width: '1.25rem', height: '0.9rem' }} />
                    <span className="text-sm font-medium text-wc-light">{code}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-wc-card border-t border-wc-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display text-4xl font-black uppercase text-white text-center mb-12">
            What's in the Hub
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon:'📅', title:'Live Schedule', desc:'All 104 matches with venues, dates, and live status.', link:'/schedule' },
              { icon:'🎯', title:'Predictions', desc:'Predict results & scores. Earn up to 6 pts per match.', link:'/predict' },
              { icon:'🏅', title:'Leaderboard', desc:'Compete with your friends. May the best pundit win.', link:'/leaderboard' },
              { icon:'🎟️', title:'Ticket Generator', desc:'Create a custom printable ticket for any match.', link:'/tickets' },
            ].map(({ icon, title, desc, link }) => (
              <Link key={title} to={link} className="card hover:border-wc-gold/30 hover:-translate-y-1 transition-all duration-200 text-center group">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide mb-2">{title}</h3>
                <p className="text-sm text-wc-muted leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wc-border py-8 text-center text-wc-muted text-sm">
        <p>WC2026 Friends Hub · Made with ⚽ for the beautiful game · Not affiliated with FIFA</p>
      </footer>
    </div>
  )
}