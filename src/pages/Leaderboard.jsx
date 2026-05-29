import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const MEDALS = ['🥇','🥈','🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'))
      const snap = await getDocs(q)
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-wc-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const myRank = users.findIndex(u => u.uid === user?.uid) + 1

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Leaderboard</h1>
        <p className="text-wc-muted">Who's the best pundit in the squad?</p>
      </div>

      {/* Scoring guide */}
      <div className="card mb-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 text-wc-light">
          <span className="text-wc-gold font-bold">1 pt</span>
          <span className="text-wc-muted">Correct result (win / draw)</span>
        </div>
        <div className="text-wc-border">·</div>
        <div className="flex items-center gap-2 text-wc-light">
          <span className="text-wc-gold font-bold">+5 pts</span>
          <span className="text-wc-muted">Exact score bonus</span>
        </div>
        <div className="text-wc-border">·</div>
        <div className="flex items-center gap-2 text-wc-light">
          <span className="text-wc-gold font-bold">6 pts</span>
          <span className="text-wc-muted">Max per match</span>
        </div>
      </div>

      {/* My rank callout */}
      {user && myRank > 0 && (
        <div className="card mb-6 border-wc-gold/30 bg-wc-gold/5 flex items-center gap-3">
          <div className="font-display text-3xl font-black text-wc-gold">#{myRank}</div>
          <div>
            <div className="text-sm font-semibold text-wc-light">Your current rank</div>
            <div className="text-xs text-wc-muted">
              {users.find(u => u.uid === user.uid)?.totalPoints || 0} points
            </div>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-20 text-wc-muted">
          <div className="text-5xl mb-3">🏆</div>
          <p>No scores yet — predictions haven't been resolved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => {
            const isMe = u.uid === user?.uid
            const rank = i + 1
            return (
              <div
                key={u.id}
                className={`card flex items-center gap-4 transition-all ${
                  isMe ? 'border-wc-gold/50 bg-wc-gold/5' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  {rank <= 3
                    ? <span className="text-2xl">{MEDALS[rank-1]}</span>
                    : <span className="font-display text-xl font-black text-wc-muted">#{rank}</span>
                  }
                </div>

                {/* Avatar */}
                <img
                  src={u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.displayName || u.email)}`}
                  alt={u.displayName}
                  className="w-10 h-10 rounded-full border-2 border-wc-border"
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isMe ? 'text-wc-gold' : 'text-wc-light'}`}>
                      {u.displayName || u.email}
                    </span>
                    {isMe && <span className="badge bg-wc-gold/20 text-wc-gold border border-wc-gold/30 text-[10px]">YOU</span>}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="font-display text-2xl font-black text-wc-gold">
                    {u.totalPoints || 0}
                  </div>
                  <div className="text-xs text-wc-muted">points</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}