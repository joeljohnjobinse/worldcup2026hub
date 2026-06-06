import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Schedule',    path: '/schedule' },
  { label: 'Predict',     path: '/predict' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Tickets',     path: '/tickets' },
  { label: 'Auction',     path: '/auction' },
  { label: 'Standings',   path: '/standings' },
]

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-wc-dark/95 backdrop-blur border-b border-wc-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-wc-red flex items-center justify-center shadow-lg shadow-red-900/40">
              <span className="text-xl">⚽</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold text-white tracking-wide">WC2026</div>
              <div className="text-[10px] text-wc-gold font-semibold tracking-widest uppercase -mt-0.5">Friends Hub</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 font-body ${
                  isActive(path)
                    ? 'bg-wc-red/20 text-wc-gold border border-wc-red/30'
                    : 'text-wc-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <img
                    src={profile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                    alt="avatar"
                    className="w-7 h-7 rounded-full border border-wc-border"
                  />
                  <span className="text-sm font-medium text-wc-light">{profile?.displayName || user.email}</span>
                  <svg className="w-4 h-4 text-wc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-wc-card border border-wc-border rounded-xl shadow-xl overflow-hidden z-50">
                    <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-wc-light hover:bg-white/5 transition-colors">
                      <span>👤</span> My Profile
                    </Link>
                    {profile?.isAdmin && (
                      <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-wc-gold hover:bg-white/5 transition-colors">
                        <span>🛡️</span> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors">
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Join</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-wc-muted hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-wc-border bg-wc-card px-4 py-3 space-y-1">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(path) ? 'bg-wc-red/20 text-wc-gold' : 'text-wc-light hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-wc-border">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-wc-light hover:bg-white/5">👤 Profile</Link>
                {profile?.isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-wc-gold hover:bg-white/5">🛡️ Admin</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5">🚪 Sign Out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-ghost text-sm text-center py-2">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-sm text-center py-2">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
