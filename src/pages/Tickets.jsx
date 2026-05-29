import { useState, useRef } from 'react'
import { MATCHES, TEAMS } from '../firebase/matchData'
import { format, parseISO } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const GROUP_MATCHES = MATCHES.filter(m => m.homeTeam && m.awayTeam)

export default function Tickets() {
  const [selectedId, setSelectedId] = useState(GROUP_MATCHES[0]?.id || '')
  const [holderName, setHolderName] = useState('')
  const [seat, setSeat]             = useState('')
  const [section, setSection]       = useState('')
  const [generating, setGenerating] = useState(false)
  const ticketRef = useRef(null)

  const match = MATCHES.find(m => m.id === selectedId)
  const homeTeam = match ? TEAMS[match.homeTeam] : null
  const awayTeam = match ? TEAMS[match.awayTeam] : null

  let dateStr = ''
  try { dateStr = format(parseISO(match?.date || ''), 'EEEE, MMMM d, yyyy') } catch {}

  // Random seat/section if blank
  const displaySeat    = seat    || `${Math.floor(Math.random() * 50) + 1}`
  const displaySection = section || `${['North Stand','South Stand','East Wing','West Wing','VIP Terrace'][Math.floor(Math.random()*5)]}`

  async function handleDownload(type) {
    if (!ticketRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      if (type === 'png') {
        const link = document.createElement('a')
        link.download = `WC2026-Ticket-${match.homeTeam}-vs-${match.awayTeam}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [100, 220] })
        pdf.addImage(imgData, 'PNG', 0, 0, 220, 100)
        pdf.save(`WC2026-Ticket-${match.homeTeam}-vs-${match.awayTeam}.pdf`)
      }
    } catch (err) {
      console.error('Ticket gen error:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black uppercase text-white tracking-wide mb-2">Ticket Generator</h1>
        <p className="text-wc-muted">Generate a custom match ticket for any game in the tournament.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Controls */}
        <div className="card space-y-5">
          <h2 className="font-display text-2xl font-bold uppercase text-white">Customise Ticket</h2>

          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Match</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="input">
              {GROUP_MATCHES.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} — {m.group ? `Group ${m.group}` : m.phase} · {m.date}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">
              Ticket Holder Name <span className="text-wc-muted font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={holderName}
              onChange={e => setHolderName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Section</label>
              <input type="text" value={section} onChange={e => setSection(e.target.value)} className="input" placeholder="Auto-assigned" />
            </div>
            <div>
              <label className="block text-xs text-wc-muted font-semibold uppercase tracking-widest mb-1.5">Seat No.</label>
              <input type="text" value={seat} onChange={e => setSeat(e.target.value)} className="input" placeholder="Auto-assigned" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => handleDownload('png')} disabled={generating} className="btn-gold flex-1 py-3">
              {generating ? '⏳ Generating…' : '⬇ Download PNG'}
            </button>
            <button onClick={() => handleDownload('pdf')} disabled={generating} className="btn-ghost flex-1 py-3">
              ⬇ Download PDF
            </button>
          </div>

          <p className="text-xs text-wc-muted">
            * This is a fan-made ticket for fun. Not an official FIFA product.
          </p>
        </div>

        {/* Ticket preview */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-wc-muted uppercase tracking-widest font-semibold">Preview</p>

          {match && homeTeam && awayTeam && (
            <div
              ref={ticketRef}
              style={{
                width: '660px',
                height: '300px',
                fontFamily: "'Barlow Condensed', sans-serif",
                background: 'linear-gradient(135deg, #0D0D18 0%, #1A0812 50%, #0D0D18 100%)',
                border: '2px solid #C8102E',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                flexShrink: 0,
              }}
            >
              {/* Left stub */}
              <div style={{
                width: '180px',
                background: 'linear-gradient(180deg, #C8102E 0%, #8B0000 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 12px',
                position: 'relative',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚽</div>
                <div style={{
                  color: '#FFD060',
                  fontSize: '22px',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}>
                  FIFA<br />WORLD<br />CUP<br />2026™
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  USA · CAN · MEX
                </div>
                {/* Perforated edge */}
                <div style={{
                  position: 'absolute',
                  right: '-1px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, #0D0D18 8px, #0D0D18 16px)',
                }} />
              </div>

              {/* Main body */}
              <div style={{
                flex: 1,
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                {/* Phase label */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    color: '#F0A500',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #C8102E',
                    paddingBottom: '2px',
                  }}>
                    {match.group ? `GROUP ${match.group}` : match.phase.toUpperCase()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '1px' }}>
                    MATCHDAY {match.matchday || '—'}
                  </span>
                </div>

                {/* Teams */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '4px 0',
                }}>
                  {/* Home */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span
                      className={`fi fi-${homeTeam.flag} rounded`}
                      style={{ width: '52px', height: '39px', display: 'inline-block' }}
                    />
                    <span style={{
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}>{match.homeTeam}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
                      {homeTeam.name}
                    </span>
                  </div>

                  {/* VS */}
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    color: '#F0A500',
                    fontSize: '36px',
                    fontWeight: 900,
                    letterSpacing: '-1px',
                  }}>VS</div>

                  {/* Away */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span
                      className={`fi fi-${awayTeam.flag} rounded`}
                      style={{ width: '52px', height: '39px', display: 'inline-block' }}
                    />
                    <span style={{
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}>{match.awayTeam}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
                      {awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Venue + date */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                }}>
                  {[
                    { label: 'VENUE',    val: match.venue },
                    { label: 'DATE',     val: dateStr },
                    { label: 'KICK OFF', val: `${match.kickoff} LOCAL` },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div style={{ color: '#F0A500', fontSize: '9px', letterSpacing: '2px', fontWeight: 700, marginBottom: '2px' }}>
                        {label}
                      </div>
                      <div style={{ color: 'white', fontSize: '11px', fontWeight: 600, lineHeight: 1.3 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right stub */}
              <div style={{
                width: '130px',
                borderLeft: '2px dashed rgba(255,255,255,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 14px',
                background: 'rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F0A500', fontSize: '9px', letterSpacing: '2px', fontWeight: 700, marginBottom: '4px' }}>SECTION</div>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 900 }}>{displaySection.split(' ')[0]}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{displaySection.split(' ').slice(1).join(' ')}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F0A500', fontSize: '9px', letterSpacing: '2px', fontWeight: 700, marginBottom: '4px' }}>SEAT</div>
                  <div style={{ color: 'white', fontSize: '28px', fontWeight: 900 }}>{displaySeat}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F0A500', fontSize: '9px', letterSpacing: '2px', fontWeight: 700, marginBottom: '4px' }}>HOLDER</div>
                  <div style={{ color: 'white', fontSize: '11px', fontWeight: 700, wordBreak: 'break-word', textAlign: 'center' }}>
                    {holderName || 'GENERAL ADMISSION'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-wc-muted text-center max-w-sm">
            Scale may appear small in preview — download for full resolution.
          </p>
        </div>
      </div>
    </div>
  )
}