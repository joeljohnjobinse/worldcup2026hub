import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { MATCHES as STATIC_MATCHES } from '../firebase/matchData'

export function useMatches() {
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), (snap) => {
      const map = {}
      snap.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  // Merge static data with Firestore overrides.
  // Knockout matches can have homeTeam/awayTeam set via overrides.
  const matches = STATIC_MATCHES.map(m => ({
    ...m,
    ...(overrides[m.id] || {}),
  }))

  async function updateMatchResult(matchId, finalHome, finalAway) {
    await setDoc(doc(db, 'matches', matchId), {
      finalHome, finalAway, status: 'finished'
    }, { merge: true })
  }

  async function setMatchLive(matchId) {
    await setDoc(doc(db, 'matches', matchId), { status: 'live' }, { merge: true })
  }

  async function resetMatch(matchId) {
    await setDoc(doc(db, 'matches', matchId), {
      finalHome: null, finalAway: null, status: 'upcoming'
    }, { merge: true })
  }

  // Set one or both team slots on a knockout match
  async function updateKnockoutTeam(matchId, side, teamCode) {
    // side = 'homeTeam' | 'awayTeam'
    await setDoc(doc(db, 'matches', matchId), {
      [side]: teamCode || null,
    }, { merge: true })
  }

  // Clear both team slots (e.g. if group stage result changes)
  async function clearKnockoutTeams(matchId) {
    await setDoc(doc(db, 'matches', matchId), {
      homeTeam: null, awayTeam: null,
    }, { merge: true })
  }

  return { matches, loading, updateMatchResult, setMatchLive, resetMatch, updateKnockoutTeam, clearKnockoutTeams }
}