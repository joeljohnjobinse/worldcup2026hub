import { useState, useRef } from 'react'
import { MATCHES, TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const GROUP_MATCHES = MATCHES.filter(m => m.homeTeam && m.awayTeam)

// ── Flag URL via flagcdn (img tag, renders in html2canvas) ───────────────────
function flagUrl(code) {
  // flagcdn uses 2-letter ISO codes, lowercase
  // Special cases for gb-eng, gb-sct
  if (code === 'gb-eng') return 'https://flagcdn.com/w80/gb-eng.png'
  if (code === 'gb-sct') return 'https://flagcdn.com/w80/gb-sct.png'
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
}

// ── Themes ───────────────────────────────────────────────────────────────────
const THEMES = {
  inferno: {
    label: '🔥 Inferno',
    bg1: '#0A0005', bg2: '#1F0010', bg3: '#0A0005',
    stubBg1: '#8B0000', stubBg2: '#C8102E',
    accentLine: '#FF3355',
    gold: '#F0A500',
    goldGlow: 'rgba(240,165,0,0.6)',
    dimText: 'rgba(255,255,255,0.5)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    borderColor: '#C8102E',
    holoBg: 'linear-gradient(90deg,#C8102E,#F0A500,#fff,#F0A500,#C8102E)',
  },
  abyss: {
    label: '🌊 Abyss',
    bg1: '#00050F', bg2: '#001530', bg3: '#00050F',
    stubBg1: '#0A2A6E', stubBg2: '#1A4ABE',
    accentLine: '#3B82F6',
    gold: '#60A5FA',
    goldGlow: 'rgba(96,165,250,0.6)',
    dimText: 'rgba(255,255,255,0.5)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    borderColor: '#1D4ED8',
    holoBg: 'linear-gradient(90deg,#1D4ED8,#60A5FA,#fff,#60A5FA,#1D4ED8)',
  },
  forest: {
    label: '🌿 Forest',
    bg1: '#010A03', bg2: '#021A07', bg3: '#010A03',
    stubBg1: '#052E16', stubBg2: '#166534',
    accentLine: '#22C55E',
    gold: '#4ADE80',
    goldGlow: 'rgba(74,222,128,0.6)',
    dimText: 'rgba(255,255,255,0.5)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    borderColor: '#15803D',
    holoBg: 'linear-gradient(90deg,#15803D,#4ADE80,#fff,#4ADE80,#15803D)',
  },
  velvet: {
    label: '💜 Velvet',
    bg1: '#06000F', bg2: '#120025', bg3: '#06000F',
    stubBg1: '#3B0764', stubBg2: '#7C3AED',
    accentLine: '#A855F7',
    gold: '#C084FC',
    goldGlow: 'rgba(192,132,252,0.6)',
    dimText: 'rgba(255,255,255,0.5)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    borderColor: '#7C3AED',
    holoBg: 'linear-gradient(90deg,#7C3AED,#C084FC,#fff,#C084FC,#7C3AED)',
  },
  onyx: {
    label: '🖤 Onyx',
    bg1: '#050505', bg2: '#111111', bg3: '#050505',
    stubBg1: '#1C1C1C', stubBg2: '#3A3A3A',
    accentLine: '#888888',
    gold: '#E5E7EB',
    goldGlow: 'rgba(229,231,235,0.5)',
    dimText: 'rgba(255,255,255,0.4)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    borderColor: '#444444',
    holoBg: 'linear-gradient(90deg,#444,#aaa,#fff,#aaa,#444)',
  },
}

// ── Inline SVGs (base64 encoded so html2canvas picks them up) ────────────────
const TROPHY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
<defs>
  <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#FFE566"/>
    <stop offset="45%" stop-color="#F0A500"/>
    <stop offset="100%" stop-color="#B87800"/>
  </linearGradient>
  <linearGradient id="tv" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#FFE566"/>
    <stop offset="100%" stop-color="#9A6000"/>
  </linearGradient>
</defs>
<path d="M22 6 L58 6 L54 42 Q40 54 26 42 Z" fill="url(#tg)"/>
<path d="M28 8 L52 8 L49 38 Q40 48 31 38 Z" fill="rgba(0,0,0,0.12)"/>
<path d="M22 10 Q8 10 8 22 Q8 36 22 38" fill="none" stroke="url(#tg)" stroke-width="3.5" stroke-linecap="round"/>
<path d="M58 10 Q72 10 72 22 Q72 36 58 38" fill="none" stroke="url(#tg)" stroke-width="3.5" stroke-linecap="round"/>
<rect x="37" y="54" width="6" height="16" fill="url(#tv)" rx="1.5"/>
<rect x="24" y="70" width="32" height="6" fill="url(#tg)" rx="2.5"/>
<rect x="20" y="76" width="40" height="4" fill="url(#tv)" rx="2"/>
<path d="M40 11 L41.8 16.4 L47.5 16.4 L43 19.6 L44.6 25 L40 21.8 L35.4 25 L37 19.6 L32.5 16.4 L38.2 16.4 Z" fill="rgba(255,255,255,0.92)"/>
<path d="M30 12 Q34 20 32 30" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="40" cy="26" rx="12" ry="16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
<line x1="28" y1="26" x2="52" y2="26" stroke="rgba(255,255,255,0.15)" stroke-width="0.7"/>
<line x1="30" y1="17" x2="50" y2="17" stroke="rgba(255,255,255,0.1)" stroke-width="0.7"/>
<line x1="30" y1="35" x2="50" y2="35" stroke="rgba(255,255,255,0.1)" stroke-width="0.7"/>
</svg>`

const FIFA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 42">
<defs>
  <linearGradient id="wg" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#dddddd"/>
  </linearGradient>
</defs>
<rect x="2" y="2" width="3.5" height="20" fill="url(#wg)"/>
<rect x="2" y="2" width="12" height="3.5" fill="url(#wg)" rx="0.5"/>
<rect x="2" y="11.5" width="8" height="3" fill="url(#wg)" rx="0.5"/>
<rect x="19" y="2" width="3.5" height="20" fill="url(#wg)" rx="0.5"/>
<rect x="27" y="2" width="3.5" height="20" fill="url(#wg)"/>
<rect x="27" y="2" width="12" height="3.5" fill="url(#wg)" rx="0.5"/>
<rect x="27" y="11.5" width="8" height="3" fill="url(#wg)" rx="0.5"/>
<path d="M45 22 L50.5 2 L56 2 L57 2 L62.5 22 Z" fill="url(#wg)"/>
<rect x="47" y="13.5" width="11" height="2.8" fill="rgba(20,0,10,0.95)" rx="0.5"/>
<rect x="2" y="25.5" width="61" height="1.5" fill="#F0A500" rx="0.5"/>
<text x="32" y="35" text-anchor="middle" fill="#F0A500" font-size="6" font-family="Arial" font-weight="800" letter-spacing="2">WORLD CUP 2026™</text>
</svg>`

const TROPHY_URL = `data:image/svg+xml;base64,${btoa(TROPHY_SVG)}`
const FIFA_URL   = `data:image/svg+xml;base64,${btoa(FIFA_SVG)}`

// ── Barcode SVG ───────────────────────────────────────────────────────────────
function BarcodeImg({ matchId, color }) {
  const seed = (matchId + 'FIFAWC2026XZ').split('').map(c => c.charCodeAt(0))
  const bars = []
  let x = 0
  for (let i = 0; i < 38; i++) {
    const w = (seed[i % seed.length] % 3) + 1
    bars.push({ x, w })
    x += w + (i % 5 === 0 ? 2 : 1)
  }
  return (
    <svg viewBox={`0 0 ${x} 30`} style={{ width: '108px', height: '26px' }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="22" fill={color} rx="0.3" opacity="0.9" />
      ))}
      <text x={x / 2} y="30" textAnchor="middle" fill={color} fontSize="4.5" fontFamily="monospace" opacity="0.65">
        {matchId}-FIFA-{seed[0]}{seed[2]}{seed[4]}{seed[6]}{seed[8]}{seed[10]}{seed[12]}{seed[14]}
      </text>
    </svg>
  )
}

// ── Ticket Canvas (rendered into DOM, captured by html2canvas) ────────────────
function TicketCanvas({ match, homeFlag, awayFlag, holderName, seat, section, dateStr, theme: tk }) {
  const T = THEMES[tk] || THEMES.inferno

  return (
    <div style={{
      width: '780px', height: '300px',
      fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
      background: `linear-gradient(140deg, ${T.bg1} 0%, ${T.bg2} 50%, ${T.bg3} 100%)`,
      border: `1.5px solid ${T.borderColor}`,
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      position: 'relative',
      flexShrink: 0,
      boxShadow: `0 32px 80px rgba(0,0,0,0.95), 0 0 60px ${T.borderColor}18`,
    }}>

      {/* Top holo strip */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: T.holoBg, opacity:0.75, zIndex:10 }} />

      {/* Subtle dot grid */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', opacity:0.018,
        backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize:'18px 18px',
      }} />

      {/* BG glow blob */}
      <div style={{
        position:'absolute', top:'-40px', left:'260px', width:'360px', height:'360px',
        background:`radial-gradient(circle, ${T.borderColor}14 0%, transparent 65%)`,
        pointerEvents:'none',
      }} />

      {/* ── LEFT STUB ── */}
      <div style={{
        width:'180px', flexShrink:0,
        background:`linear-gradient(170deg, ${T.stubBg2} 0%, ${T.stubBg1} 100%)`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between',
        padding:'18px 14px',
        position:'relative',
        clipPath:'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
      }}>
        {/* Glow inside stub */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none',
          background:'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.07) 0%, transparent 70%)',
        }} />

        {/* FIFA logo */}
        <img src={FIFA_URL} alt="FIFA WC 2026" style={{ width:'82px', height:'38px', objectFit:'contain', position:'relative', zIndex:1 }} />

        {/* Trophy */}
        <img src={TROPHY_URL} alt="Trophy" style={{
          width:'72px', height:'90px', objectFit:'contain', position:'relative', zIndex:1,
          filter:'drop-shadow(0 6px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 12px rgba(240,165,0,0.4))',
        }} />

        {/* Host nations */}
        <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'7.5px', letterSpacing:'2.5px', textTransform:'uppercase', lineHeight:1.9 }}>
            USA · CANADA · MEXICO
          </div>
          <div style={{
            marginTop:'4px', paddingTop:'4px',
            borderTop:`1px solid rgba(255,255,255,0.15)`,
            color:'rgba(255,255,255,0.28)', fontSize:'7px', letterSpacing:'1.5px', textTransform:'uppercase',
          }}>OFFICIAL MATCH TICKET</div>
        </div>

        {/* Perforated edge */}
        <div style={{
          position:'absolute', right:0, top:'8px', bottom:'8px', width:'2px',
          backgroundImage:'repeating-linear-gradient(to bottom, transparent 0, transparent 5px, rgba(0,0,0,0.55) 5px, rgba(0,0,0,0.55) 10px)',
        }} />
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{
        flex:1, padding:'16px 22px 14px 18px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        position:'relative', zIndex:1, minWidth:0,
      }}>

        {/* Row 1: phase badge + match ref */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              background:`${T.borderColor}28`, border:`1px solid ${T.borderColor}55`,
              borderRadius:'5px', padding:'2px 12px',
              color: T.gold, fontSize:'10px', fontWeight:900,
              letterSpacing:'3px', textTransform:'uppercase',
            }}>
              {match.group ? `GROUP ${match.group}` : match.phase.toUpperCase()}
            </div>
            {match.matchday && (
              <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase' }}>
                MATCHDAY {match.matchday}
              </span>
            )}
          </div>
          <span style={{ color:'rgba(255,255,255,0.18)', fontSize:'9px', fontFamily:'monospace', letterSpacing:'1px' }}>
            REF #{match.id.toUpperCase()}
          </span>
        </div>

        {/* Accent line */}
        <div style={{ height:'1px', background:`linear-gradient(90deg, ${T.accentLine}80, transparent)`, marginBottom:'12px' }} />

        {/* ── TEAMS ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1, marginBottom:'12px' }}>

          {/* Home team */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', width:'130px', flexShrink:0 }}>
            <div style={{
              width:'80px', height:'60px', borderRadius:'8px',
              overflow:'hidden', flexShrink:0,
              boxShadow:'0 4px 20px rgba(0,0,0,0.7)',
              border:'1.5px solid rgba(255,255,255,0.14)',
              background:'rgba(0,0,0,0.3)',
            }}>
              <img
                src={homeFlag}
                alt={match.homeTeam}
                style={{ width:'80px', height:'60px', objectFit:'cover', display:'block' }}
                crossOrigin="anonymous"
              />
            </div>
            <span style={{
              color:'#ffffff', fontSize:'28px', fontWeight:900,
              textTransform:'uppercase', letterSpacing:'2px', lineHeight:1,
            }}>{match.homeTeam}</span>
            <span style={{ color:T.dimText, fontSize:'10px', textAlign:'center', lineHeight:1.2, maxWidth:'120px' }}>
              {TEAMS[match.homeTeam]?.name}
            </span>
          </div>

          {/* Centre VS */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.06)' }} />
            <span style={{
              color: T.gold, fontSize:'36px', fontWeight:900, letterSpacing:'-1px', lineHeight:1,
              textShadow:`0 0 30px ${T.goldGlow}`,
            }}>VS</span>
            <span style={{ fontSize:'20px', opacity:0.3 }}>⚽</span>
            <div style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Away team */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', width:'130px', flexShrink:0 }}>
            <div style={{
              width:'80px', height:'60px', borderRadius:'8px',
              overflow:'hidden', flexShrink:0,
              boxShadow:'0 4px 20px rgba(0,0,0,0.7)',
              border:'1.5px solid rgba(255,255,255,0.14)',
              background:'rgba(0,0,0,0.3)',
            }}>
              <img
                src={awayFlag}
                alt={match.awayTeam}
                style={{ width:'80px', height:'60px', objectFit:'cover', display:'block' }}
                crossOrigin="anonymous"
              />
            </div>
            <span style={{
              color:'#ffffff', fontSize:'28px', fontWeight:900,
              textTransform:'uppercase', letterSpacing:'2px', lineHeight:1,
            }}>{match.awayTeam}</span>
            <span style={{ color:T.dimText, fontSize:'10px', textAlign:'center', lineHeight:1.2, maxWidth:'120px' }}>
              {TEAMS[match.awayTeam]?.name}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'10px' }} />

        {/* ── INFO GRID ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
          {[
            { icon:'📍', label:'VENUE',   val: match.venue },
            { icon:'📅', label:'DATE',    val: dateStr },
            { icon:'⏰', label:'KICK OFF',val: `${match.kickoff} · ${match.city}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{
              background: T.cardBg, border:`1px solid ${T.cardBorder}`,
              borderRadius:'7px', padding:'6px 8px',
            }}>
              <div style={{ color: T.gold, fontSize:'8px', letterSpacing:'2px', fontWeight:800, marginBottom:'2px', textTransform:'uppercase' }}>
                {icon} {label}
              </div>
              <div style={{ color:'#ffffff', fontSize:'10px', fontWeight:600, lineHeight:1.35 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT STUB ── */}
      <div style={{
        width:'140px', flexShrink:0,
        borderLeft:`2px dashed ${T.borderColor}30`,
        background:'rgba(0,0,0,0.38)',
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'space-between', padding:'16px 12px',
        position:'relative', zIndex:1,
      }}>
        {/* Section */}
        <div style={{ textAlign:'center', width:'100%' }}>
          <div style={{ color:T.gold, fontSize:'8px', letterSpacing:'2px', fontWeight:800, marginBottom:'3px', textTransform:'uppercase' }}>SECTION</div>
          <div style={{
            color:'#ffffff', fontSize:'13px', fontWeight:900, lineHeight:1.1,
            background:`${T.borderColor}18`, borderRadius:'6px', padding:'4px 6px',
            border:`1px solid ${T.borderColor}30`,
          }}>{section}</div>
        </div>

        {/* Seat */}
        <div style={{ textAlign:'center' }}>
          <div style={{ color:T.gold, fontSize:'8px', letterSpacing:'2px', fontWeight:800, marginBottom:'4px', textTransform:'uppercase' }}>SEAT</div>
          <div style={{
            color: T.gold, fontSize:'44px', fontWeight:900, lineHeight:1,
            textShadow:`0 0 24px ${T.goldGlow}`,
          }}>{seat}</div>
        </div>

        {/* Holder */}
        <div style={{ textAlign:'center', width:'100%' }}>
          <div style={{ color:T.gold, fontSize:'8px', letterSpacing:'2px', fontWeight:800, marginBottom:'3px', textTransform:'uppercase' }}>HOLDER</div>
          <div style={{ color:'#ffffff', fontSize:'11px', fontWeight:700, lineHeight:1.3, wordBreak:'break-word' }}>
            {holderName || 'GENERAL ADMISSION'}
          </div>
        </div>

        {/* Barcode */}
        <div style={{ opacity:0.7 }}>
          <BarcodeImg matchId={match.id} color={T.gold} />
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
  const [theme,       setTheme]       = useState('inferno')
  const [generating,  setGenerating]  = useState(false)
  const [imgError,    setImgError]    = useState({})
  const ticketRef = useRef(null)

  const match    = MATCHES.find(m => m.id === selectedId)
  const homeTeam = match ? TEAMS[match.homeTeam] : null
  const awayTeam = match ? TEAMS[match.awayTeam] : null

  let dateStr = ''
  try { dateStr = format(parseISO(match?.date || ''), 'EEE, MMM d, yyyy') } catch {}

  const AUTO_SECTIONS = ['North Stand A', 'South Stand B', 'East Wing C', 'West Wing D', 'VIP Terrace', 'Press Level']
  const [autoSeat]    = useState(String(Math.floor(Math.random() * 99) + 1).padStart(2,'0'))
  const [autoSection] = useState(AUTO_SECTIONS[Math.floor(Math.random() * AUTO_SECTIONS.length)])

  const displaySeat    = seat    || autoSeat
  const displaySection = section || autoSection

  const homeFlag = homeTeam ? flagUrl(homeTeam.flag) : ''
  const awayFlag = awayTeam ? flagUrl(awayTeam.flag) : ''

  async function handleDownload(type) {
    if (!ticketRef.current || !match) return
    setGenerating(true)
    try {
      // Give images a moment to fully load
      await new Promise(r => setTimeout(r, 400))

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 8000,
        onclone: (clonedDoc) => {
          // Ensure all images in the clone are loaded
          const imgs = clonedDoc.querySelectorAll('img')
          return Promise.all(Array.from(imgs).map(img =>
            img.complete ? Promise.resolve() : new Promise(res => {
              img.onload = res; img.onerror = res
            })
          ))
        }
      })

      const filename = `WC2026-${match.homeTeam}-vs-${match.awayTeam}-${theme}`

      if (type === 'png') {
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        const imgData = canvas.toDataURL('image/png')
        // Landscape, match ticket proportions
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [106, 275] })
        pdf.addImage(imgData, 'PNG', 0, 0, 275, 106)
        pdf.save(`${filename}.pdf`)
      }
    } catch (err) {
      console.error('Ticket generation error:', err)
      alert('Generation failed. Make sure you have an internet connection for flags to load, then try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Ticket Generator</h1>
        <p className="text-wc-muted">Design a custom match ticket — WC2026 branding, country flags and a unique barcode.</p>
      </div>

      <div className="grid xl:grid-cols-[340px_1fr] gap-10 items-start">

        {/* ── Controls panel ── */}
        <div className="card space-y-5 sticky top-24">
          <h2 className="font-display text-2xl font-bold uppercase text-white">Customise</h2>

          {/* Match selector */}
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

          {/* Theme picker */}
          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-2">Theme</label>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setTheme(key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                    theme === key
                      ? 'border-wc-gold bg-wc-gold/10 text-wc-gold'
                      : 'border-wc-border text-wc-muted hover:border-wc-muted hover:text-wc-light'
                  }`}
                >
                  <span>{t.label}</span>
                  {theme === key && <span className="text-xs opacity-70">✓ selected</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Holder name */}
          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">
              Holder Name <span className="normal-case font-normal text-wc-muted/60">(optional)</span>
            </label>
            <input type="text" value={holderName}
              onChange={e => setHolderName(e.target.value.toUpperCase())}
              className="input" placeholder="YOUR NAME" maxLength={22} />
          </div>

          {/* Section + Seat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Section</label>
              <input type="text" value={section}
                onChange={e => setSection(e.target.value.toUpperCase())}
                className="input" placeholder={autoSection.split(' ').slice(0,2).join(' ')} />
            </div>
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Seat</label>
              <input type="text" value={seat}
                onChange={e => setSeat(e.target.value)}
                className="input" placeholder={autoSeat} maxLength={4} />
            </div>
          </div>

          {/* Download buttons */}
          <div className="space-y-2 pt-1">
            <button onClick={() => handleDownload('png')} disabled={generating}
              className="btn-gold w-full py-3 text-base disabled:opacity-60">
              {generating
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Generating…
                  </span>
                : '⬇ Download PNG'}
            </button>
            <button onClick={() => handleDownload('pdf')} disabled={generating}
              className="btn-ghost w-full py-3 text-base disabled:opacity-60">
              ⬇ Download PDF
            </button>
          </div>

          <p className="text-xs text-wc-muted border-t border-wc-border pt-3">
            🎟 Fan-made · Not affiliated with FIFA · For personal use
          </p>
        </div>

        {/* ── Ticket preview ── */}
        <div className="flex flex-col items-start gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-wc-muted uppercase tracking-widest font-semibold">Live Preview</span>
            <span className="badge bg-green-900/30 text-green-400 border border-green-800/40 text-[10px]">
              Updates instantly
            </span>
          </div>

          <div className="w-full overflow-x-auto pb-2">
            {match && homeTeam && awayTeam && (
              <div ref={ticketRef} style={{ display:'inline-block' }}>
                <TicketCanvas
                  match={match}
                  homeFlag={homeFlag}
                  awayFlag={awayFlag}
                  holderName={holderName}
                  seat={displaySeat}
                  section={displaySection}
                  dateStr={dateStr}
                  theme={theme}
                />
              </div>
            )}
          </div>

          <p className="text-xs text-wc-muted">
            Downloaded image is 3× this size — print-ready resolution. Make sure you're online so flags load correctly before downloading.
          </p>

          {/* Match details */}
          {match && (
            <div className="card w-full max-w-[780px]">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {[
                  { label:'Phase',   val: match.group ? `Group ${match.group}` : match.phase },
                  { label:'Date',    val: dateStr },
                  { label:'Kick Off',val: match.kickoff },
                  { label:'Venue',   val: match.venue },
                  { label:'City',    val: `${match.city}, ${match.country}` },
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