import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MATCHES, TEAMS, PHASES } from '../firebase/matchData'
import { useMatches } from '../hooks/useMatches'
import { format, parseISO, isPast } from 'date-fns'

const SCORE_OPTIONS = ['0','1','2','3','4','5','6','7','8']

function PredictModal({ match, existing, onSave, onClose }) {
  const [home, setHome] = useState(existing?.predictedHome ?? '')
  const [away, setAway] = useState(existing?.predictedAway ?? '')
  const [saving, setSaving] = useState(false)

  const homeTeam = TEAMS[match.homeTeam]
  const awayTeam = TEAMS[match.awayTeam]

  const resultLabel = () => {
    if (home === '' || away === '') return null
    const h = parseInt(home), a = parseInt(away)
    if (h > a) return `${match.homeTeam} Win`
    if (a > h) return `${match.awayTeam} Win`
    return 'Draw'
  }

  async function handleSave() {
    if (home === '' || away === '') return
    setSaving(true)
    await onSave(match.id, parseInt(home), parseInt(away))
    setSaving(false)
    onClose()
  }

  const kickoffDT = new Date(`${match.date}T${match.kickoff}`)
  const locked = isPast(kickoffDT)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-wc-card border border-wc-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-black uppercase text-white">Your Prediction</h2>
          <button onClick={onClose} className="text-wc-muted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center gap-1.5">
            <span className={`fi fi-${homeTeam?.flag} rounded`} style={{ width:'3rem', height:'2.25rem' }} />
            <span className="font-display text-lg font-bold text-white uppercase">{match.homeTeam}</span>
          </div>
          <div className="font-display text-3xl font-black text-wc-muted">VS</div>
          <div className="flex flex-col items-center gap-1.5">
            <span className={`fi fi-${awayTeam?.flag} rounded`} style={{ width:'3rem', height:'2.25rem' }} />
            <span className="font-display text-lg font-bold text-white uppercase">{match.awayTeam}</span>
          </div>
        </div>

        {locked ? (
          <div className="text-center py-4 text-wc-muted text-sm">
            ⏰ Predictions locked — match has kicked off.
          </div>
        ) : (
          <>
            {/* Score selectors */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-wc-muted mb-1 text-center uppercase tracking-widest">{match.homeTeam}</label>
                <select value={home} onChange={e => setHome(e.target.value)} className="input text-center text-xl font-display font-bold">
                  <option value="">?</option>
                  {SCORE_OPTIONS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="font-display text-2xl font-black text-wc-muted pt-5">–</div>
              <div className="flex-1">
                <label className="block text-xs text-wc-muted mb-1 text-center uppercase tracking-widest">{match.awayTeam}</label>
                <select value={away} onChange={e => setAway(e.target.value)} className="input text-center text-xl font-display font-bold">
                  <option value="">?</option>
                  {SCORE_OPTIONS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {resultLabel() && (
              <div className="text-center mb-4">
                <span className="badge bg-wc-gold/20 text-wc-gold border border-wc-gold/30">
                  Predicting: {resultLabel()}
                </span>
              </div>
            )}

            <div className="text-xs text-wc-muted bg-wc-border/30 rounded-lg p-2.5 mb-4 text-center">
              Correct result → 1 pt · Exact score → 6 pts total
            </div>

            <button
              onClick={handleSave}
              disabled={home === '' || away === '' || saving}
              className="btn-gold w-full py-3 disabled:opacity-50"
            >
              {saving ? 'Saving…' : existing ? 'Update Prediction' : 'Save Prediction'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Predict() {
  const { user } = useAuth()
  const { matches } = useMatches()
  const [predictions, setPredictions] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [phase, setPhase] = useState('Group Stage')
  const [loading, setLoading] = useState(true)

  const loadPredictions = useCallback(async () => {
    if (!user) return
    const q = query(collection(db, 'predictions'), where('userId', '==', user.uid))
    const snap = await getDocs(q)
    const map = {}
    snap.forEach(d => { map[d.data().matchId] = d.data() })
    setPredictions(map)
    setLoading(false)
  }, [user])

  useEffect(() => { loadPredictions() }, [loadPredictions])

  async function savePrediction(matchId, predictedHome, predictedAway) {
    const id = `${user.uid}_${matchId}`
    await setDoc(doc(db, 'predictions', id), {
      id,
      userId: user.uid,
      matchId,
      predictedHome,
      predictedAway,
      pointsEarned: null,
      createdAt: serverTimestamp(),
    }, { merge: true })
    setPredictions(p => ({ ...p, [matchId]: { matchId, predictedHome, predictedAway, pointsEarned: null } }))
  }

  // Show group stage always; show knockout matches only once both teams are assigned and finalised
  // matches already sorted date+kickoff from useMatches; filter preserves that order
  const phaseMatches = [...matches]
    .filter(m => m.phase === phase && m.homeTeam && m.awayTeam)
    .sort((a, b) => {
      const dtA = (a.date || '') + 'T' + (a.kickoff || '00:00')
      const dtB = (b.date || '') + 'T' + (b.kickoff || '00:00')
      return dtA.localeCompare(dtB)
    })

  const stats = {
    total: phaseMatches.length,
    done:  phaseMatches.filter(m => predictions[m.id]).length,
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-wc-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Predictions</h1>
        <p className="text-wc-muted">Pick scores for each match before kick-off. Predictions lock at kick-off time.</p>
      </div>

      {/* Progress */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-wc-muted">{phase} predictions</span>
            <span className="text-sm font-bold text-wc-gold">{stats.done} / {stats.total}</span>
          </div>
          <div className="h-2 bg-wc-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-gradient rounded-full transition-all duration-500"
              style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              phase === p
                ? 'bg-wc-red text-white shadow-lg shadow-red-900/30'
                : 'bg-wc-card border border-wc-border text-wc-muted hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {phaseMatches.length === 0 ? (
        <div className="text-center py-16 text-wc-muted">
          <div className="text-5xl mb-3">🔒</div>
          <p>Knockout predictions open once group stage teams are known.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phaseMatches.map(m => {
            const pred = predictions[m.id]
            const kickoffDT = new Date(`${m.date}T${m.kickoff}`)
            const locked = isPast(kickoffDT)
            return (
              <div
                key={m.id}
                onClick={() => setActiveModal(m)}
                className={`card transition-all duration-200 cursor-pointer ${
                  locked
                    ? 'opacity-60 cursor-default'
                    : pred
                    ? 'border-wc-gold/40 hover:border-wc-gold/70 hover:-translate-y-0.5'
                    : 'border-dashed hover:border-wc-gold/40 hover:-translate-y-0.5'
                }`}
              >
                {/* Match header */}
                <div className="flex items-center justify-between mb-3 text-xs text-wc-muted">
                  <span className="font-semibold uppercase tracking-widest">
                    {m.group ? `Group ${m.group}` : m.phase}
                  </span>
                  <span>{format(parseISO(m.date), 'dd MMM')} · {m.kickoff}</span>
                </div>

                {/* Teams */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <span className={`fi fi-${TEAMS[m.homeTeam]?.flag} rounded`} style={{ width:'2.5rem', height:'1.875rem' }} />
                    <span className="font-display text-sm font-bold uppercase text-white">{m.homeTeam}</span>
                  </div>

                  <div className="text-center min-w-[70px]">
                    {pred ? (
                      <>
                        <div className="font-display text-xl font-black text-wc-gold">
                          {pred.predictedHome}–{pred.predictedAway}
                        </div>
                        {pred.pointsEarned !== null && (
                          <div className={`text-xs font-bold mt-0.5 ${pred.pointsEarned > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pred.pointsEarned > 0 ? `+${pred.pointsEarned}` : '0'} pts
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="font-display text-base font-bold text-wc-muted">
                        {locked ? '🔒' : 'PICK'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <span className={`fi fi-${TEAMS[m.awayTeam]?.flag} rounded`} style={{ width:'2.5rem', height:'1.875rem' }} />
                    <span className="font-display text-sm font-bold uppercase text-white">{m.awayTeam}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-wc-border text-xs text-wc-muted text-center">
                  {locked ? '⏰ Locked' : pred ? '✏️ Tap to edit' : '+ Add prediction'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeModal && (
        <PredictModal
          match={activeModal}
          existing={predictions[activeModal.id]}
          onSave={savePrediction}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}