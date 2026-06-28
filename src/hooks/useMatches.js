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
  // Merge overrides then re-sort by date + kickoff to preserve schedule order
  // (Firestore snapshots return docs in unpredictable order, so we always sort)
  const matches = STATIC_MATCHES
    .map(m => ({ ...m, ...(overrides[m.id] || {}) }))
    .sort((a, b) => {
      const dtA = (a.date || '') + 'T' + (a.kickoff || '00:00')
      const dtB = (b.date || '') + 'T' + (b.kickoff || '00:00')
      if (dtA < dtB) return -1
      if (dtA > dtB) return 1
      return 0
    })

  async function lockPredictions(matchId) {
    // Called when a match goes live or is resolved.
    // Writes lockedAt timestamp to every prediction for this match.
    // Once lockedAt is set, Firestore rules block any user edits.
    const { collection, query, where, getDocs, writeBatch, serverTimestamp } = await import('firebase/firestore')
    const snap = await getDocs(query(collection(db, 'predictions'), where('matchId', '==', matchId)))
    if (snap.empty) return
    const batch = writeBatch(db)
    snap.forEach(predDoc => {
      // Only lock predictions that aren't already locked
      if (!predDoc.data().lockedAt) {
        batch.update(doc(db, 'predictions', predDoc.id), { lockedAt: serverTimestamp() })
      }
    })
    await batch.commit()
  }

  async function updateMatchResult(matchId, finalHome, finalAway) {
    await lockPredictions(matchId)
    await setDoc(doc(db, 'matches', matchId), {
      finalHome, finalAway, status: 'finished'
    }, { merge: true })
  }

  async function setMatchLive(matchId) {
    await lockPredictions(matchId)
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