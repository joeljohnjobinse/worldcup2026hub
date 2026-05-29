// FIFA World Cup 2026 — Correct match data
// All times as listed (local display times from the schedule)

export const TEAMS = {
  MEX:  { name: 'Mexico',               flag: 'mx' },
  RSA:  { name: 'South Africa',         flag: 'za' },
  KOR:  { name: 'South Korea',          flag: 'kr' },
  CZE:  { name: 'Czechia',              flag: 'cz' },
  CAN:  { name: 'Canada',               flag: 'ca' },
  BIH:  { name: 'Bosnia & Herzegovina', flag: 'ba' },
  USA:  { name: 'USA',                  flag: 'us' },
  PAR:  { name: 'Paraguay',             flag: 'py' },
  QAT:  { name: 'Qatar',                flag: 'qa' },
  SUI:  { name: 'Switzerland',          flag: 'ch' },
  BRA:  { name: 'Brazil',               flag: 'br' },
  MAR:  { name: 'Morocco',              flag: 'ma' },
  HAI:  { name: 'Haiti',                flag: 'ht' },
  SCO:  { name: 'Scotland',             flag: 'gb-sct' },
  AUS:  { name: 'Australia',            flag: 'au' },
  TUR:  { name: 'Türkiye',              flag: 'tr' },
  GER:  { name: 'Germany',              flag: 'de' },
  CUW:  { name: 'Curaçao',              flag: 'cw' },
  NED:  { name: 'Netherlands',          flag: 'nl' },
  JPN:  { name: 'Japan',                flag: 'jp' },
  CIV:  { name: 'Ivory Coast',          flag: 'ci' },
  ECU:  { name: 'Ecuador',              flag: 'ec' },
  SWE:  { name: 'Sweden',               flag: 'se' },
  TUN:  { name: 'Tunisia',              flag: 'tn' },
  ESP:  { name: 'Spain',                flag: 'es' },
  CPV:  { name: 'Cape Verde',           flag: 'cv' },
  BEL:  { name: 'Belgium',              flag: 'be' },
  EGY:  { name: 'Egypt',                flag: 'eg' },
  KSA:  { name: 'Saudi Arabia',         flag: 'sa' },
  URU:  { name: 'Uruguay',              flag: 'uy' },
  IRN:  { name: 'Iran',                 flag: 'ir' },
  NZL:  { name: 'New Zealand',          flag: 'nz' },
  FRA:  { name: 'France',               flag: 'fr' },
  SEN:  { name: 'Senegal',              flag: 'sn' },
  IRQ:  { name: 'Iraq',                 flag: 'iq' },
  NOR:  { name: 'Norway',               flag: 'no' },
  ARG:  { name: 'Argentina',            flag: 'ar' },
  ALG:  { name: 'Algeria',              flag: 'dz' },
  AUT:  { name: 'Austria',              flag: 'at' },
  JOR:  { name: 'Jordan',               flag: 'jo' },
  POR:  { name: 'Portugal',             flag: 'pt' },
  COD:  { name: 'DR Congo',             flag: 'cd' },
  ENG:  { name: 'England',              flag: 'gb-eng' },
  CRO:  { name: 'Croatia',              flag: 'hr' },
  GHA:  { name: 'Ghana',                flag: 'gh' },
  PAN:  { name: 'Panama',               flag: 'pa' },
  UZB:  { name: 'Uzbekistan',           flag: 'uz' },
  COL:  { name: 'Colombia',             flag: 'co' },
}

export const VENUES = [
  { name: 'MetLife Stadium',         city: 'New York/New Jersey', country: 'USA' },
  { name: 'AT&T Stadium',            city: 'Dallas',              country: 'USA' },
  { name: 'SoFi Stadium',            city: 'Los Angeles',         country: 'USA' },
  { name: "Levi's Stadium",          city: 'San Francisco',       country: 'USA' },
  { name: 'Hard Rock Stadium',       city: 'Miami',               country: 'USA' },
  { name: 'Lincoln Financial Field', city: 'Philadelphia',        country: 'USA' },
  { name: 'Empower Field',           city: 'Denver',              country: 'USA' },
  { name: 'Gillette Stadium',        city: 'Boston',              country: 'USA' },
  { name: 'Arrowhead Stadium',       city: 'Kansas City',         country: 'USA' },
  { name: 'NRG Stadium',             city: 'Houston',             country: 'USA' },
  { name: 'Estadio Azteca',          city: 'Mexico City',         country: 'Mexico' },
  { name: 'Estadio BBVA',            city: 'Guadalajara',         country: 'Mexico' },
  { name: 'BC Place',                city: 'Vancouver',           country: 'Canada' },
  { name: 'BMO Field',               city: 'Toronto',             country: 'Canada' },
]

// Rotating venues across group stage
const V = VENUES
const vr = (i) => V[i % V.length]

export const MATCHES = [
  // ── GROUP STAGE · 12 Jun ─────────────────────────────────────────────────
  { id: 'A1', homeTeam: 'MEX', awayTeam: 'RSA', group: 'A', phase: 'Group Stage', matchday: 1, date: '2026-06-12', kickoff: '00:30', venue: V[10].name, city: V[10].city, country: V[10].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'A2', homeTeam: 'KOR', awayTeam: 'CZE', group: 'A', phase: 'Group Stage', matchday: 1, date: '2026-06-12', kickoff: '07:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 13 Jun ─────────────────────────────────────────────────
  { id: 'B1', homeTeam: 'CAN', awayTeam: 'BIH', group: 'B', phase: 'Group Stage', matchday: 1, date: '2026-06-13', kickoff: '00:30', venue: V[12].name, city: V[12].city, country: V[12].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'D1', homeTeam: 'USA', awayTeam: 'PAR', group: 'D', phase: 'Group Stage', matchday: 1, date: '2026-06-13', kickoff: '06:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 14 Jun ─────────────────────────────────────────────────
  { id: 'B2', homeTeam: 'QAT', awayTeam: 'SUI', group: 'B', phase: 'Group Stage', matchday: 1, date: '2026-06-14', kickoff: '00:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C1', homeTeam: 'BRA', awayTeam: 'MAR', group: 'C', phase: 'Group Stage', matchday: 1, date: '2026-06-14', kickoff: '03:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C2', homeTeam: 'HAI', awayTeam: 'SCO', group: 'C', phase: 'Group Stage', matchday: 1, date: '2026-06-14', kickoff: '06:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'D2', homeTeam: 'AUS', awayTeam: 'TUR', group: 'D', phase: 'Group Stage', matchday: 1, date: '2026-06-14', kickoff: '09:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'E1', homeTeam: 'GER', awayTeam: 'CUW', group: 'E', phase: 'Group Stage', matchday: 1, date: '2026-06-14', kickoff: '22:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 15 Jun ─────────────────────────────────────────────────
  { id: 'F1', homeTeam: 'NED', awayTeam: 'JPN', group: 'F', phase: 'Group Stage', matchday: 1, date: '2026-06-15', kickoff: '01:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'E2', homeTeam: 'CIV', awayTeam: 'ECU', group: 'E', phase: 'Group Stage', matchday: 1, date: '2026-06-15', kickoff: '04:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'F2', homeTeam: 'SWE', awayTeam: 'TUN', group: 'F', phase: 'Group Stage', matchday: 1, date: '2026-06-15', kickoff: '07:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H1', homeTeam: 'ESP', awayTeam: 'CPV', group: 'H', phase: 'Group Stage', matchday: 1, date: '2026-06-15', kickoff: '21:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 16 Jun ─────────────────────────────────────────────────
  { id: 'G1', homeTeam: 'BEL', awayTeam: 'EGY', group: 'G', phase: 'Group Stage', matchday: 1, date: '2026-06-16', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H2', homeTeam: 'KSA', awayTeam: 'URU', group: 'H', phase: 'Group Stage', matchday: 1, date: '2026-06-16', kickoff: '03:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'G2', homeTeam: 'IRN', awayTeam: 'NZL', group: 'G', phase: 'Group Stage', matchday: 1, date: '2026-06-16', kickoff: '06:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 17 Jun ─────────────────────────────────────────────────
  { id: 'I1', homeTeam: 'FRA', awayTeam: 'SEN', group: 'I', phase: 'Group Stage', matchday: 1, date: '2026-06-17', kickoff: '00:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'I2', homeTeam: 'IRQ', awayTeam: 'NOR', group: 'I', phase: 'Group Stage', matchday: 1, date: '2026-06-17', kickoff: '03:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J1', homeTeam: 'ARG', awayTeam: 'ALG', group: 'J', phase: 'Group Stage', matchday: 1, date: '2026-06-17', kickoff: '06:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J2', homeTeam: 'AUT', awayTeam: 'JOR', group: 'J', phase: 'Group Stage', matchday: 1, date: '2026-06-17', kickoff: '09:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K1', homeTeam: 'POR', awayTeam: 'COD', group: 'K', phase: 'Group Stage', matchday: 1, date: '2026-06-17', kickoff: '22:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 18 Jun ─────────────────────────────────────────────────
  { id: 'L1', homeTeam: 'ENG', awayTeam: 'CRO', group: 'L', phase: 'Group Stage', matchday: 1, date: '2026-06-18', kickoff: '01:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'L2', homeTeam: 'GHA', awayTeam: 'PAN', group: 'L', phase: 'Group Stage', matchday: 1, date: '2026-06-18', kickoff: '04:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K2', homeTeam: 'UZB', awayTeam: 'COL', group: 'K', phase: 'Group Stage', matchday: 1, date: '2026-06-18', kickoff: '07:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'A3', homeTeam: 'CZE', awayTeam: 'RSA', group: 'A', phase: 'Group Stage', matchday: 2, date: '2026-06-18', kickoff: '21:30', venue: V[10].name, city: V[10].city, country: V[10].country, finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 19 Jun ─────────────────────────────────────────────────
  { id: 'B3', homeTeam: 'SUI', awayTeam: 'BIH', group: 'B', phase: 'Group Stage', matchday: 2, date: '2026-06-19', kickoff: '00:30', venue: V[11].name, city: V[11].city, country: V[11].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'B4', homeTeam: 'CAN', awayTeam: 'QAT', group: 'B', phase: 'Group Stage', matchday: 2, date: '2026-06-19', kickoff: '03:30', venue: V[12].name, city: V[12].city, country: V[12].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'A4', homeTeam: 'MEX', awayTeam: 'KOR', group: 'A', phase: 'Group Stage', matchday: 2, date: '2026-06-19', kickoff: '06:30', venue: V[10].name, city: V[10].city, country: V[10].country, finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 20 Jun ─────────────────────────────────────────────────
  { id: 'D3', homeTeam: 'USA', awayTeam: 'AUS', group: 'D', phase: 'Group Stage', matchday: 2, date: '2026-06-20', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C3', homeTeam: 'SCO', awayTeam: 'MAR', group: 'C', phase: 'Group Stage', matchday: 2, date: '2026-06-20', kickoff: '03:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C4', homeTeam: 'BRA', awayTeam: 'HAI', group: 'C', phase: 'Group Stage', matchday: 2, date: '2026-06-20', kickoff: '06:00', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'D4', homeTeam: 'TUR', awayTeam: 'PAR', group: 'D', phase: 'Group Stage', matchday: 2, date: '2026-06-20', kickoff: '08:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'F3', homeTeam: 'NED', awayTeam: 'SWE', group: 'F', phase: 'Group Stage', matchday: 2, date: '2026-06-20', kickoff: '22:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 21 Jun ─────────────────────────────────────────────────
  { id: 'E3', homeTeam: 'GER', awayTeam: 'CIV', group: 'E', phase: 'Group Stage', matchday: 2, date: '2026-06-21', kickoff: '01:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'E4', homeTeam: 'ECU', awayTeam: 'CUW', group: 'E', phase: 'Group Stage', matchday: 2, date: '2026-06-21', kickoff: '05:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'F4', homeTeam: 'TUN', awayTeam: 'JPN', group: 'F', phase: 'Group Stage', matchday: 2, date: '2026-06-21', kickoff: '09:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H3', homeTeam: 'ESP', awayTeam: 'KSA', group: 'H', phase: 'Group Stage', matchday: 2, date: '2026-06-21', kickoff: '21:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 22 Jun ─────────────────────────────────────────────────
  { id: 'G3', homeTeam: 'BEL', awayTeam: 'IRN', group: 'G', phase: 'Group Stage', matchday: 2, date: '2026-06-22', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H4', homeTeam: 'URU', awayTeam: 'CPV', group: 'H', phase: 'Group Stage', matchday: 2, date: '2026-06-22', kickoff: '03:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'G4', homeTeam: 'NZL', awayTeam: 'EGY', group: 'G', phase: 'Group Stage', matchday: 2, date: '2026-06-22', kickoff: '06:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J3', homeTeam: 'ARG', awayTeam: 'AUT', group: 'J', phase: 'Group Stage', matchday: 2, date: '2026-06-22', kickoff: '22:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 23 Jun ─────────────────────────────────────────────────
  { id: 'I3', homeTeam: 'FRA', awayTeam: 'IRQ', group: 'I', phase: 'Group Stage', matchday: 2, date: '2026-06-23', kickoff: '02:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'I4', homeTeam: 'NOR', awayTeam: 'SEN', group: 'I', phase: 'Group Stage', matchday: 2, date: '2026-06-23', kickoff: '05:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J4', homeTeam: 'JOR', awayTeam: 'ALG', group: 'J', phase: 'Group Stage', matchday: 2, date: '2026-06-23', kickoff: '08:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K3', homeTeam: 'POR', awayTeam: 'UZB', group: 'K', phase: 'Group Stage', matchday: 2, date: '2026-06-23', kickoff: '22:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 24 Jun ─────────────────────────────────────────────────
  { id: 'L3', homeTeam: 'ENG', awayTeam: 'GHA', group: 'L', phase: 'Group Stage', matchday: 2, date: '2026-06-24', kickoff: '01:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'L4', homeTeam: 'PAN', awayTeam: 'CRO', group: 'L', phase: 'Group Stage', matchday: 2, date: '2026-06-24', kickoff: '04:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K4', homeTeam: 'COL', awayTeam: 'COD', group: 'K', phase: 'Group Stage', matchday: 2, date: '2026-06-24', kickoff: '07:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 25 Jun ─────────────────────────────────────────────────
  { id: 'B5', homeTeam: 'SUI', awayTeam: 'CAN', group: 'B', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '00:30', venue: V[11].name, city: V[11].city, country: V[11].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'B6', homeTeam: 'BIH', awayTeam: 'QAT', group: 'B', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '00:30', venue: V[12].name, city: V[12].city, country: V[12].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C5', homeTeam: 'MAR', awayTeam: 'HAI', group: 'C', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '03:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'C6', homeTeam: 'SCO', awayTeam: 'BRA', group: 'C', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '03:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'A5', homeTeam: 'RSA', awayTeam: 'KOR', group: 'A', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '06:30', venue: V[10].name, city: V[10].city, country: V[10].country, finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'A6', homeTeam: 'CZE', awayTeam: 'MEX', group: 'A', phase: 'Group Stage', matchday: 3, date: '2026-06-25', kickoff: '06:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 26 Jun ─────────────────────────────────────────────────
  { id: 'E5', homeTeam: 'CUW', awayTeam: 'CIV', group: 'E', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '01:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'E6', homeTeam: 'ECU', awayTeam: 'GER', group: 'E', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '01:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'F5', homeTeam: 'TUN', awayTeam: 'NED', group: 'F', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '04:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'F6', homeTeam: 'JPN', awayTeam: 'SWE', group: 'F', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '04:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'D5', homeTeam: 'TUR', awayTeam: 'USA', group: 'D', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '07:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'D6', homeTeam: 'PAR', awayTeam: 'AUS', group: 'D', phase: 'Group Stage', matchday: 3, date: '2026-06-26', kickoff: '07:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 27 Jun ─────────────────────────────────────────────────
  { id: 'I5', homeTeam: 'NOR', awayTeam: 'FRA', group: 'I', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '00:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'I6', homeTeam: 'SEN', awayTeam: 'IRQ', group: 'I', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '00:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H5', homeTeam: 'CPV', awayTeam: 'KSA', group: 'H', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '05:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'H6', homeTeam: 'URU', awayTeam: 'ESP', group: 'H', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '05:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'G5', homeTeam: 'NZL', awayTeam: 'BEL', group: 'G', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '08:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'G6', homeTeam: 'EGY', awayTeam: 'IRN', group: 'G', phase: 'Group Stage', matchday: 3, date: '2026-06-27', kickoff: '08:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── GROUP STAGE · 28 Jun ─────────────────────────────────────────────────
  { id: 'L5', homeTeam: 'PAN', awayTeam: 'ENG', group: 'L', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '02:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'L6', homeTeam: 'CRO', awayTeam: 'GHA', group: 'L', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '02:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K5', homeTeam: 'COL', awayTeam: 'POR', group: 'K', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '05:00', venue: V[0].name,  city: V[0].city,  country: V[0].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'K6', homeTeam: 'COD', awayTeam: 'UZB', group: 'K', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '05:00', venue: V[6].name,  city: V[6].city,  country: V[6].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J5', homeTeam: 'ALG', awayTeam: 'AUT', group: 'J', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '07:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'J6', homeTeam: 'JOR', awayTeam: 'ARG', group: 'J', phase: 'Group Stage', matchday: 3, date: '2026-06-28', kickoff: '07:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  finalHome: null, finalAway: null, status: 'upcoming' },

  // ── ROUND OF 32 ──────────────────────────────────────────────────────────
  { id: 'R32-1',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-06-29', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-2',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-06-29', kickoff: '22:30', venue: V[1].name,  city: V[1].city,  country: V[1].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-3',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-06-30', kickoff: '02:00', venue: V[2].name,  city: V[2].city,  country: V[2].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-4',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-06-30', kickoff: '06:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-5',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-06-30', kickoff: '22:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-6',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-01', kickoff: '02:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-7',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-01', kickoff: '06:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-8',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-01', kickoff: '21:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-9',  homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-02', kickoff: '01:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-10', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-02', kickoff: '05:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-11', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-03', kickoff: '00:30', venue: V[10].name, city: V[10].city, country: V[10].country, label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-12', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-03', kickoff: '04:30', venue: V[11].name, city: V[11].city, country: V[11].country, label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-13', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-03', kickoff: '08:30', venue: V[12].name, city: V[12].city, country: V[12].country, label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-14', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-03', kickoff: '23:30', venue: V[13].name, city: V[13].city, country: V[13].country, label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-15', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-04', kickoff: '03:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R32-16', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 32', matchday: null, date: '2026-07-04', kickoff: '07:00', venue: V[1].name,  city: V[1].city,  country: V[1].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },

  // ── ROUND OF 16 ───────────────────────────────────────────────────────────
  { id: 'R16-1', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-04', kickoff: '22:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-2', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-05', kickoff: '02:30', venue: V[3].name,  city: V[3].city,  country: V[3].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-3', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-06', kickoff: '01:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-4', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-06', kickoff: '05:30', venue: V[5].name,  city: V[5].city,  country: V[5].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-5', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-07', kickoff: '00:30', venue: V[6].name,  city: V[6].city,  country: V[6].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-6', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-07', kickoff: '05:30', venue: V[7].name,  city: V[7].city,  country: V[7].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-7', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-07', kickoff: '21:30', venue: V[8].name,  city: V[8].city,  country: V[8].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'R16-8', homeTeam: null, awayTeam: null, group: null, phase: 'Round of 16', matchday: null, date: '2026-07-08', kickoff: '01:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },

  // ── QUARTER-FINALS ────────────────────────────────────────────────────────
  { id: 'QF-1', homeTeam: null, awayTeam: null, group: null, phase: 'Quarter-Final', matchday: null, date: '2026-07-10', kickoff: '01:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'QF-2', homeTeam: null, awayTeam: null, group: null, phase: 'Quarter-Final', matchday: null, date: '2026-07-11', kickoff: '00:30', venue: V[2].name,  city: V[2].city,  country: V[2].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'QF-3', homeTeam: null, awayTeam: null, group: null, phase: 'Quarter-Final', matchday: null, date: '2026-07-12', kickoff: '02:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'QF-4', homeTeam: null, awayTeam: null, group: null, phase: 'Quarter-Final', matchday: null, date: '2026-07-12', kickoff: '06:30', venue: V[9].name,  city: V[9].city,  country: V[9].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },

  // ── SEMI-FINALS ───────────────────────────────────────────────────────────
  { id: 'SF-1', homeTeam: null, awayTeam: null, group: null, phase: 'Semi-Final', matchday: null, date: '2026-07-15', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
  { id: 'SF-2', homeTeam: null, awayTeam: null, group: null, phase: 'Semi-Final', matchday: null, date: '2026-07-16', kickoff: '00:30', venue: V[10].name, city: V[10].city, country: V[10].country, label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },

  // ── THIRD PLACE ───────────────────────────────────────────────────────────
  { id: '3RD', homeTeam: null, awayTeam: null, group: null, phase: 'Third Place', matchday: null, date: '2026-07-19', kickoff: '02:30', venue: V[4].name,  city: V[4].city,  country: V[4].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },

  // ── FINAL ─────────────────────────────────────────────────────────────────
  { id: 'FIN', homeTeam: null, awayTeam: null, group: null, phase: 'Final', matchday: null, date: '2026-07-20', kickoff: '00:30', venue: V[0].name,  city: V[0].city,  country: V[0].country,  label: 'TBD vs TBD', finalHome: null, finalAway: null, status: 'upcoming' },
]

export const PHASES = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Third Place', 'Final']
export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']