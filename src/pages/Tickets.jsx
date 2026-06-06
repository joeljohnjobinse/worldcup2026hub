import { useState, useRef } from 'react'
import { MATCHES, TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const GROUP_MATCHES = MATCHES.filter(m => m.homeTeam && m.awayTeam)

// ── SVG Logos (inline data URIs — no external deps) ──────────────────────────

const WC_TROPHY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="50%" stop-color="#F0A500"/>
      <stop offset="100%" stop-color="#C87800"/>
    </linearGradient>
    <linearGradient id="goldV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="100%" stop-color="#A06000"/>
    </linearGradient>
  </defs>
  <!-- Cup body -->
  <path d="M32 8 L68 8 L64 46 Q50 56 36 46 Z" fill="url(#gold)" />
  <!-- Inner shadow -->
  <path d="M38 10 L62 10 L59 42 Q50 50 41 42 Z" fill="rgba(0,0,0,0.15)" />
  <!-- Handles -->
  <path d="M32 12 Q16 12 16 26 Q16 40 32 42" fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round"/>
  <path d="M68 12 Q84 12 84 26 Q84 40 68 42" fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round"/>
  <!-- Stem -->
  <rect x="46" y="56" width="8" height="18" fill="url(#goldV)" rx="2"/>
  <!-- Base plate -->
  <rect x="30" y="74" width="40" height="8" fill="url(#gold)" rx="3"/>
  <rect x="26" y="82" width="48" height="5" fill="url(#goldV)" rx="2"/>
  <!-- Stars -->
  <path d="M50 14 L51.5 18.5 L56 18.5 L52.5 21.2 L53.8 25.8 L50 23 L46.2 25.8 L47.5 21.2 L44 18.5 L48.5 18.5 Z" fill="white" opacity="0.9"/>
  <!-- Shine -->
  <path d="M38 14 Q42 22 40 32" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Globe lines on cup -->
  <ellipse cx="50" cy="30" rx="14" ry="18" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <line x1="36" y1="30" x2="64" y2="30" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
  <line x1="38" y1="20" x2="62" y2="20" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
  <line x1="38" y1="40" x2="62" y2="40" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
</svg>`

const FIFA_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 36">
  <defs>
    <linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cccccc"/>
    </linearGradient>
  </defs>
  <!-- F -->
  <rect x="2" y="2" width="3.5" height="22" fill="url(#fg)"/>
  <rect x="2" y="2" width="13" height="3.5" fill="url(#fg)" rx="0.5"/>
  <rect x="2" y="12" width="9" height="3" fill="url(#fg)" rx="0.5"/>
  <!-- I -->
  <rect x="20" y="2" width="3.5" height="22" fill="url(#fg)" rx="0.5"/>
  <!-- F -->
  <rect x="29" y="2" width="3.5" height="22" fill="url(#fg)"/>
  <rect x="29" y="2" width="13" height="3.5" fill="url(#fg)" rx="0.5"/>
  <rect x="29" y="12" width="9" height="3" fill="url(#fg)" rx="0.5"/>
  <!-- A -->
  <path d="M47 24 L52 2 L57 2 L62 24 Z" fill="url(#fg)"/>
  <rect x="47" y="24" width="15" height="3.5" fill="#1a0010" rx="0.5"/>
  <path d="M49 16 L54.5 2 L55.5 2 L61 16 Z" fill="#1a0010"/>
  <rect x="49.5" y="13.5" width="11" height="3" fill="url(#fg)" rx="0.5"/>
  <!-- Underline -->
  <rect x="0" y="28" width="62" height="1.5" fill="#F0A500" rx="0.5"/>
  <!-- WORLD CUP 2026 -->
  <text x="31" y="36" text-anchor="middle" fill="#F0A500" font-size="6.5" font-family="Arial" font-weight="700" letter-spacing="1.5">WORLD CUP 2026</text>
</svg>`

const WC_URI   = `data:image/svg+xml;base64,${btoa(WC_TROPHY_SVG)}`
const FIFA_URI = `data:image/svg+xml;base64,${btoa(FIFA_BADGE_SVG)}`

// ── Ticket themes ─────────────────────────────────────────────────────────────
const THEMES = {
  classic: {
    label: '🏆 Classic Dark',
    bg:     'linear-gradient(145deg, #06060F 0%, #180610 40%, #06060F 100%)',
    stub:   'linear-gradient(170deg, #C8102E 0%, #7A0018 100%)',
    accent: '#C8102E',
    gold:   '#F0A500',
    text:   '#FFFFFF',
    dim:    'rgba(255,255,255,0.45)',
    border: '#C8102E',
  },
  midnight: {
    label: '🌙 Midnight Blue',
    bg:     'linear-gradient(145deg, #020818 0%, #040E2A 50%, #020818 100%)',
    stub:   'linear-gradient(170deg, #1A3A8F 0%, #0A1A5F 100%)',
    accent: '#2563EB',
    gold:   '#60A5FA',
    text:   '#FFFFFF',
    dim:    'rgba(255,255,255,0.45)',
    border: '#2563EB',
  },
  emerald: {
    label: '💚 Emerald Pitch',
    bg:     'linear-gradient(145deg, #020F06 0%, #051A0C 50%, #020F06 100%)',
    stub:   'linear-gradient(170deg, #166534 0%, #052E16 100%)',
    accent: '#16A34A',
    gold:   '#4ADE80',
    text:   '#FFFFFF',
    dim:    'rgba(255,255,255,0.45)',
    border: '#16A34A',
  },
  gold: {
    label: '✨ Gold Edition',
    bg:     'linear-gradient(145deg, #0C0800 0%, #1A1000 50%, #0C0800 100%)',
    stub:   'linear-gradient(170deg, #92400E 0%, #451A03 100%)',
    accent: '#D97706',
    gold:   '#FCD34D',
    text:   '#FFFFFF',
    dim:    'rgba(255,255,255,0.45)',
    border: '#D97706',
  },
  platinum: {
    label: '🤍 Platinum VIP',
    bg:     'linear-gradient(145deg, #0E0E12 0%, #1A1A22 50%, #0E0E12 100%)',
    stub:   'linear-gradient(170deg, #374151 0%, #111827 100%)',
    accent: '#6B7280',
    gold:   '#E5E7EB',
    text:   '#FFFFFF',
    dim:    'rgba(255,255,255,0.45)',
    border: '#4B5563',
  },
}

// ── Barcode component ─────────────────────────────────────────────────────────
function Barcode({ matchId, color }) {
  const bars = Array.from(matchId + 'WC2026').map((c, i) => ({
    w: (c.charCodeAt(0) % 3) + 1,
    gap: (i % 4 === 0) ? 2 : 1,
  }))
  let x = 0
  return (
    <svg viewBox={`0 0 120 36`} style={{ width: '110px', height: '32px' }}>
      {bars.map((b, i) => {
        const rect = <rect key={i} x={x} y="0" width={b.w} height="28" fill={color} rx="0.3" opacity="0.85" />
        x += b.w + b.gap
        return rect
      })}
      <text x="60" y="36" textAnchor="middle" fill={color} fontSize="5" fontFamily="monospace" opacity="0.7">
        {matchId}-WC2026
      </text>
    </svg>
  )
}

// ── Holographic shimmer strip ─────────────────────────────────────────────────
function HoloStrip() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
      background: 'linear-gradient(90deg, #C8102E, #F0A500, #ffffff, #F0A500, #C8102E, #8B5CF6, #C8102E)',
      opacity: 0.7,
    }} />
  )
}

// ── Main Ticket Component ─────────────────────────────────────────────────────
function TicketCanvas({ match, homeTeam, awayTeam, holderName, displaySeat, displaySection, dateStr, theme }) {
  const T = THEMES[theme] || THEMES.classic

  return (
    <div style={{
      width: '740px',
      height: '318px',
      fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
      background: T.bg,
      border: `2px solid ${T.border}`,
      borderRadius: '14px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexShrink: 0,
      boxShadow: `0 28px 80px rgba(0,0,0,0.95), 0 0 40px ${T.accent}22`,
    }}>

      {/* Holographic top strip */}
      <HoloStrip />

      {/* Dot texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Diagonal glow */}
      <div style={{
        position: 'absolute', top: '-60px', right: '220px', width: '300px', height: '300px',
        background: `radial-gradient(circle, ${T.accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── LEFT STUB ── */}
      <div style={{
        width: '186px',
        background: T.stub,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 16px 14px',
        position: 'relative',
        flexShrink: 0,
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
      }}>

        {/* FIFA badge */}
        <img src={FIFA_URI} alt="FIFA" style={{ width: '76px', height: '34px', objectFit: 'contain' }} />

        {/* Trophy */}
        <div style={{ textAlign: 'center' }}>
          <img src={WC_URI} alt="WC Trophy" style={{ width: '76px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }} />
        </div>

        {/* Host text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', letterSpacing: '2.5px', textTransform: 'uppercase', lineHeight: 2 }}>
            USA · CANADA · MEXICO
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.25)', fontSize: '7px', letterSpacing: '1.5px',
            textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '4px', marginTop: '2px'
          }}>
            OFFICIAL MATCH TICKET
          </div>
        </div>

        {/* Perforation */}
        <div style={{
          position: 'absolute', right: '-1px', top: '10px', bottom: '10px', width: '3px',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(0,0,0,0.5) 6px, rgba(0,0,0,0.5) 12px)',
        }} />
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{
        flex: 1, padding: '18px 20px 14px 20px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── TOP ROW: phase + match id ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: `${T.accent}30`, border: `1px solid ${T.accent}60`,
              borderRadius: '5px', padding: '2px 10px',
              color: T.gold, fontSize: '10px', fontWeight: 800,
              letterSpacing: '3px', textTransform: 'uppercase',
            }}>
              {match.group ? `GROUP ${match.group}` : match.phase.toUpperCase()}
            </div>
            {match.matchday && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                MATCHDAY {match.matchday}
              </div>
            )}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.2)', fontSize: '9px', letterSpacing: '1.5px',
            fontFamily: 'monospace', textTransform: 'uppercase',
          }}>
            #{match.id}
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${T.gold}, transparent)`, marginBottom: '10px', opacity: 0.5 }} />

        {/* ── TEAMS ROW ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>

          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px' }}>
            <div style={{
              width: '68px', height: '51px', borderRadius: '6px',
              overflow: 'hidden', boxShadow: '0 3px 14px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span className={`fi fi-${homeTeam.flag}`} style={{ width: '68px', height: '51px', display: 'block' }} />
            </div>
            <span style={{ color: T.text, fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1 }}>
              {match.homeTeam}
            </span>
            <span style={{ color: T.dim, fontSize: '10px', textAlign: 'center', letterSpacing: '0.5px', lineHeight: 1.2, maxWidth: '110px' }}>
              {homeTeam.name}
            </span>
          </div>

          {/* VS centre */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{
                color: T.gold, fontSize: '30px', fontWeight: 900,
                letterSpacing: '-1px', lineHeight: 1,
                textShadow: `0 0 20px ${T.gold}60`,
              }}>VS</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>
            {/* Decorative ball icon */}
            <div style={{ fontSize: '18px', opacity: 0.4 }}>⚽</div>
          </div>

          {/* Away */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px' }}>
            <div style={{
              width: '68px', height: '51px', borderRadius: '6px',
              overflow: 'hidden', boxShadow: '0 3px 14px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span className={`fi fi-${awayTeam.flag}`} style={{ width: '68px', height: '51px', display: 'block' }} />
            </div>
            <span style={{ color: T.text, fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1 }}>
              {match.awayTeam}
            </span>
            <span style={{ color: T.dim, fontSize: '10px', textAlign: 'center', letterSpacing: '0.5px', lineHeight: 1.2, maxWidth: '110px' }}>
              {awayTeam.name}
            </span>
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${T.gold}60, transparent)`, marginBottom: '10px' }} />

        {/* ── BOTTOM INFO ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {[
            { icon: '📍', label: 'VENUE', val: match.venue },
            { icon: '📅', label: 'DATE',  val: dateStr },
            { icon: '⏰', label: 'KICK OFF', val: `${match.kickoff} · ${match.city}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '7px', padding: '6px 8px',
            }}>
              <div style={{ color: T.gold, fontSize: '8px', letterSpacing: '2px', fontWeight: 800, marginBottom: '2px', textTransform: 'uppercase' }}>
                {icon} {label}
              </div>
              <div style={{ color: T.text, fontSize: '10px', fontWeight: 600, lineHeight: 1.3 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT STUB ── */}
      <div style={{
        width: '136px',
        borderLeft: `2px dashed ${T.accent}35`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '16px 12px',
        background: 'rgba(0,0,0,0.35)', flexShrink: 0,
        position: 'relative', zIndex: 1,
      }}>

        {/* Section */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ color: T.gold, fontSize: '8px', letterSpacing: '2px', fontWeight: 800, marginBottom: '3px', textTransform: 'uppercase' }}>
            SECTION
          </div>
          <div style={{
            color: T.text, fontSize: '16px', fontWeight: 900, lineHeight: 1.1,
            background: `${T.accent}18`, borderRadius: '6px', padding: '4px 6px',
            border: `1px solid ${T.accent}30`,
          }}>
            {displaySection}
          </div>
        </div>

        {/* Seat */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: T.gold, fontSize: '8px', letterSpacing: '2px', fontWeight: 800, marginBottom: '3px', textTransform: 'uppercase' }}>
            SEAT
          </div>
          <div style={{
            color: T.gold, fontSize: '38px', fontWeight: 900, lineHeight: 1,
            textShadow: `0 0 20px ${T.gold}80`,
          }}>
            {displaySeat}
          </div>
        </div>

        {/* Holder name */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ color: T.gold, fontSize: '8px', letterSpacing: '2px', fontWeight: 800, marginBottom: '3px', textTransform: 'uppercase' }}>
            HOLDER
          </div>
          <div style={{ color: T.text, fontSize: '11px', fontWeight: 700, lineHeight: 1.3, wordBreak: 'break-word' }}>
            {holderName || 'GENERAL\nADMISSION'}
          </div>
        </div>

        {/* Barcode */}
        <div style={{ opacity: 0.6 }}>
          <Barcode matchId={match.id} color={T.gold} />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Tickets() {
  const [selectedId,  setSelectedId]  = useState(GROUP_MATCHES[0]?.id || '')
  const [holderName,  setHolderName]  = useState('')
  const [seat,        setSeat]        = useState('')
  const [section,     setSection]     = useState('')
  const [theme,       setTheme]       = useState('classic')
  const [generating,  setGenerating]  = useState(false)
  const ticketRef = useRef(null)

  const match    = MATCHES.find(m => m.id === selectedId)
  const homeTeam = match ? TEAMS[match.homeTeam] : null
  const awayTeam = match ? TEAMS[match.awayTeam] : null

  let dateStr = ''
  try { dateStr = format(parseISO(match?.date || ''), 'EEE, MMM d, yyyy') } catch {}

  const SECTIONS = ['North Stand A','South Stand B','East Wing C','West Wing D','VIP Terrace','Press Level']
  const [autoSeat]    = useState(String(Math.floor(Math.random() * 99) + 1).padStart(2, '0'))
  const [autoSection] = useState(SECTIONS[Math.floor(Math.random() * SECTIONS.length)])
  const displaySeat    = seat    || autoSeat
  const displaySection = section || autoSection

  async function handleDownload(type) {
    if (!ticketRef.current) return
    setGenerating(true)
    try {
      await new Promise(r => setTimeout(r, 200))
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      const filename = `WC2026-${match.homeTeam}-vs-${match.awayTeam}-${theme}`
      if (type === 'png') {
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [110, 250] })
        pdf.addImage(imgData, 'PNG', 0, 0, 250, 110)
        pdf.save(`${filename}.pdf`)
      }
    } catch (err) {
      console.error(err)
      alert('Generation failed — try PNG.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Ticket Generator</h1>
        <p className="text-wc-muted">Design and download a custom match ticket — complete with WC2026 branding, flags and barcode.</p>
      </div>

      <div className="grid xl:grid-cols-[360px_1fr] gap-10 items-start">

        {/* ── Controls ── */}
        <div className="card space-y-5 sticky top-24">
          <h2 className="font-display text-2xl font-bold uppercase text-white">Customise</h2>

          {/* Match */}
          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Match</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="input text-sm">
              {GROUP_MATCHES.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} — {m.group ? `Grp ${m.group}` : m.phase} · {m.date}
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-2">Ticket Theme</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                    theme === key
                      ? 'border-wc-gold bg-wc-gold/10 text-wc-gold'
                      : 'border-wc-border text-wc-muted hover:border-wc-muted hover:text-wc-light'
                  }`}
                >
                  <span>{t.label}</span>
                  {theme === key && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Holder */}
          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">
              Holder Name <span className="normal-case font-normal text-wc-muted/60">(optional)</span>
            </label>
            <input type="text" value={holderName} onChange={e => setHolderName(e.target.value.toUpperCase())}
              className="input" placeholder="YOUR NAME" maxLength={20} />
          </div>

          {/* Section + Seat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Section</label>
              <input type="text" value={section} onChange={e => setSection(e.target.value.toUpperCase())}
                className="input" placeholder={autoSection} />
            </div>
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Seat</label>
              <input type="text" value={seat} onChange={e => setSeat(e.target.value)}
                className="input" placeholder={autoSeat} />
            </div>
          </div>

          {/* Download buttons */}
          <div className="space-y-2 pt-1">
            <button onClick={() => handleDownload('png')} disabled={generating}
              className="btn-gold w-full py-3 text-base disabled:opacity-60">
              {generating
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Generating…
                  </span>
                : '⬇ Download PNG'}
            </button>
            <button onClick={() => handleDownload('pdf')} disabled={generating}
              className="btn-ghost w-full py-3 text-base disabled:opacity-60">
              ⬇ Download PDF
            </button>
          </div>

          <p className="text-xs text-wc-muted border-t border-wc-border pt-3">
            🎟 Fan-made · Not affiliated with FIFA · Personal use only
          </p>
        </div>

        {/* ── Preview ── */}
        <div className="flex flex-col items-start gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-wc-muted uppercase tracking-widest font-semibold">Live Preview</span>
            <span className="badge bg-green-900/30 text-green-400 border border-green-800/40 text-[10px]">
              Updates instantly
            </span>
          </div>

          {/* Ticket with overflow scroll on small screens */}
          <div className="w-full overflow-x-auto pb-2 rounded-xl">
            {match && homeTeam && awayTeam && (
              <div ref={ticketRef} style={{ display: 'inline-block' }}>
                <TicketCanvas
                  match={match}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  holderName={holderName}
                  displaySeat={displaySeat}
                  displaySection={displaySection}
                  dateStr={dateStr}
                  theme={theme}
                />
              </div>
            )}
          </div>

          <p className="text-xs text-wc-muted">
            ↑ Downloaded image is 3× this resolution — crisp and print-ready at full size.
          </p>

          {/* Match info strip */}
          {match && (
            <div className="card w-full max-w-[740px]">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {[
                  { label: 'Phase',    val: match.group ? `Group ${match.group}` : match.phase },
                  { label: 'Date',     val: dateStr },
                  { label: 'Kick Off', val: match.kickoff },
                  { label: 'Venue',    val: match.venue },
                  { label: 'City',     val: `${match.city}, ${match.country}` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <span className="text-wc-muted text-xs uppercase tracking-widest font-semibold">{label} </span>
                    <span className="text-wc-light font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}