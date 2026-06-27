// FIFA World Cup 2026 — Complete match data
// All times stored as UTC display strings matching the official schedule

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
  TUR:  { name: 'Turkiye',              flag: 'tr' },
  GER:  { name: 'Germany',              flag: 'de' },
  CUW:  { name: 'Curacao',              flag: 'cw' },
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
  { name: 'MetLife Stadium',         city: 'East Rutherford',  country: 'USA' },   // 0
  { name: 'AT&T Stadium',            city: 'Arlington',        country: 'USA' },   // 1
  { name: 'SoFi Stadium',            city: 'Inglewood',        country: 'USA' },   // 2
  { name: "Levi's Stadium",          city: 'Santa Clara',      country: 'USA' },   // 3
  { name: 'Hard Rock Stadium',       city: 'Miami Gardens',    country: 'USA' },   // 4
  { name: 'Lincoln Financial Field', city: 'Philadelphia',     country: 'USA' },   // 5
  { name: 'Empower Field',           city: 'Denver',           country: 'USA' },   // 6
  { name: 'Gillette Stadium',        city: 'Foxborough',       country: 'USA' },   // 7
  { name: 'Arrowhead Stadium',       city: 'Kansas City',      country: 'USA' },   // 8
  { name: 'NRG Stadium',             city: 'Houston',          country: 'USA' },   // 9
  { name: 'Estadio Azteca',          city: 'Mexico City',      country: 'Mexico' },// 10
  { name: 'Estadio BBVA',            city: 'Guadalajara',      country: 'Mexico' },// 11
  { name: 'BC Place',                city: 'Vancouver',        country: 'Canada' },// 12
  { name: 'BMO Field',               city: 'Toronto',          country: 'Canada' },// 13
  { name: 'Lumen Field',             city: 'Seattle',          country: 'USA' },   // 14
  { name: 'Mercedes-Benz Stadium',   city: 'Atlanta',          country: 'USA' },   // 15
]

const V = VENUES

// Helper: base match shape
const m = (id, home, away, group, phase, matchday, date, kickoff, venue, label, matchLabel) => ({
  id, homeTeam: home, awayTeam: away, group, phase, matchday,
  date, kickoff, venue: venue.name, city: venue.city, country: venue.country,
  label: label || null, matchLabel: matchLabel || null,
  finalHome: null, finalAway: null, status: 'upcoming',
})

export const MATCHES = [

  // ════════════════════════════════════════════════════════════════
  //  GROUP STAGE
  // ════════════════════════════════════════════════════════════════

  // ── Group A ──
  m('A1', 'MEX','RSA', 'A','Group Stage',1,'2026-06-12','06:00',V[10]),
  m('A2', 'KOR','CZE', 'A','Group Stage',1,'2026-06-12','13:00',V[0]),
  m('A3', 'CZE','RSA', 'A','Group Stage',2,'2026-06-19','03:00',V[10]),
  m('A4', 'MEX','KOR', 'A','Group Stage',2,'2026-06-19','12:00',V[10]),
  m('A5', 'RSA','KOR', 'A','Group Stage',3,'2026-06-25','12:00',V[10]),
  m('A6', 'CZE','MEX', 'A','Group Stage',3,'2026-06-25','12:00',V[0]),

  // ── Group B ──
  m('B1', 'CAN','BIH', 'B','Group Stage',1,'2026-06-13','06:00',V[12]),
  m('B2', 'QAT','SUI', 'B','Group Stage',1,'2026-06-14','06:00',V[9]),
  m('B3', 'SUI','BIH', 'B','Group Stage',2,'2026-06-19','06:00',V[11]),
  m('B4', 'CAN','QAT', 'B','Group Stage',2,'2026-06-19','09:00',V[12]),
  m('B5', 'SUI','CAN', 'B','Group Stage',3,'2026-06-25','06:00',V[11]),
  m('B6', 'BIH','QAT', 'B','Group Stage',3,'2026-06-25','06:00',V[12]),

  // ── Group C ──
  m('C1', 'BRA','MAR', 'C','Group Stage',1,'2026-06-14','09:00',V[4]),
  m('C2', 'HAI','SCO', 'C','Group Stage',1,'2026-06-14','12:00',V[5]),
  m('C3', 'SCO','MAR', 'C','Group Stage',2,'2026-06-20','09:00',V[5]),
  m('C4', 'BRA','HAI', 'C','Group Stage',2,'2026-06-20','11:30',V[4]),
  m('C5', 'MAR','HAI', 'C','Group Stage',3,'2026-06-25','09:00',V[4]),
  m('C6', 'SCO','BRA', 'C','Group Stage',3,'2026-06-25','09:00',V[5]),

  // ── Group D ──
  m('D1', 'USA','PAR', 'D','Group Stage',1,'2026-06-13','12:00',V[0]),
  m('D2', 'AUS','TUR', 'D','Group Stage',1,'2026-06-14','15:00',V[2]),
  m('D3', 'USA','AUS', 'D','Group Stage',2,'2026-06-20','06:00',V[0]),
  m('D4', 'TUR','PAR', 'D','Group Stage',2,'2026-06-20','14:00',V[2]),
  m('D5', 'TUR','USA', 'D','Group Stage',3,'2026-06-26','13:00',V[2]),
  m('D6', 'PAR','AUS', 'D','Group Stage',3,'2026-06-26','13:00',V[9]),

  // ── Group E ──
  m('E1', 'GER','CUW', 'E','Group Stage',1,'2026-06-15','04:00',V[1]),
  m('E2', 'CIV','ECU', 'E','Group Stage',1,'2026-06-15','10:00',V[3]),
  m('E3', 'GER','CIV', 'E','Group Stage',2,'2026-06-21','07:00',V[1]),
  m('E4', 'ECU','CUW', 'E','Group Stage',2,'2026-06-21','11:00',V[3]),
  m('E5', 'CUW','CIV', 'E','Group Stage',3,'2026-06-26','07:00',V[3]),
  m('E6', 'ECU','GER', 'E','Group Stage',3,'2026-06-26','07:00',V[1]),

  // ── Group F ──
  m('F1', 'NED','JPN', 'F','Group Stage',1,'2026-06-15','07:00',V[8]),
  m('F2', 'SWE','TUN', 'F','Group Stage',1,'2026-06-15','13:00',V[6]),
  m('F3', 'NED','SWE', 'F','Group Stage',2,'2026-06-21','04:00',V[8]),
  m('F4', 'TUN','JPN', 'F','Group Stage',2,'2026-06-21','15:00',V[6]),
  m('F5', 'TUN','NED', 'F','Group Stage',3,'2026-06-26','10:00',V[6]),
  m('F6', 'JPN','SWE', 'F','Group Stage',3,'2026-06-26','10:00',V[8]),

  // ── Group G ──
  m('G1', 'BEL','EGY', 'G','Group Stage',1,'2026-06-16','06:00',V[0]),
  m('G2', 'IRN','NZL', 'G','Group Stage',1,'2026-06-16','12:00',V[9]),
  m('G3', 'BEL','IRN', 'G','Group Stage',2,'2026-06-22','06:00',V[0]),
  m('G4', 'NZL','EGY', 'G','Group Stage',2,'2026-06-22','12:00',V[9]),
  m('G5', 'NZL','BEL', 'G','Group Stage',3,'2026-06-27','14:00',V[9]),
  m('G6', 'EGY','IRN', 'G','Group Stage',3,'2026-06-27','14:00',V[0]),

  // ── Group H ──
  m('H1', 'ESP','CPV', 'H','Group Stage',1,'2026-06-16','03:00',V[7]),
  m('H2', 'KSA','URU', 'H','Group Stage',1,'2026-06-16','09:00',V[4]),
  m('H3', 'ESP','KSA', 'H','Group Stage',2,'2026-06-22','03:00',V[7]),
  m('H4', 'URU','CPV', 'H','Group Stage',2,'2026-06-22','09:00',V[4]),
  m('H5', 'CPV','KSA', 'H','Group Stage',3,'2026-06-27','11:00',V[7]),
  m('H6', 'URU','ESP', 'H','Group Stage',3,'2026-06-27','11:00',V[4]),

  // ── Group I ──
  m('I1', 'FRA','SEN', 'I','Group Stage',1,'2026-06-17','06:00',V[5]),
  m('I2', 'IRQ','NOR', 'I','Group Stage',1,'2026-06-17','09:00',V[1]),
  m('I3', 'FRA','IRQ', 'I','Group Stage',2,'2026-06-23','08:00',V[5]),
  m('I4', 'NOR','SEN', 'I','Group Stage',2,'2026-06-23','11:00',V[1]),
  m('I5', 'NOR','FRA', 'I','Group Stage',3,'2026-06-27','06:00',V[1]),
  m('I6', 'SEN','IRQ', 'I','Group Stage',3,'2026-06-27','06:00',V[5]),

  // ── Group J ──
  m('J1', 'ARG','ALG', 'J','Group Stage',1,'2026-06-17','12:00',V[2]),
  m('J2', 'AUT','JOR', 'J','Group Stage',1,'2026-06-17','15:00',V[3]),
  m('J3', 'ARG','AUT', 'J','Group Stage',2,'2026-06-23','04:00',V[2]),
  m('J4', 'JOR','ALG', 'J','Group Stage',2,'2026-06-23','14:00',V[3]),
  m('J5', 'ALG','AUT', 'J','Group Stage',3,'2026-06-28','13:00',V[3]),
  m('J6', 'JOR','ARG', 'J','Group Stage',3,'2026-06-28','13:00',V[2]),

  // ── Group K ──
  m('K1', 'POR','COD', 'K','Group Stage',1,'2026-06-18','04:00',V[6]),
  m('K2', 'UZB','COL', 'K','Group Stage',1,'2026-06-18','13:00',V[0]),
  m('K3', 'POR','UZB', 'K','Group Stage',2,'2026-06-24','04:00',V[6]),
  m('K4', 'COL','COD', 'K','Group Stage',2,'2026-06-24','13:00',V[0]),
  m('K5', 'COL','POR', 'K','Group Stage',3,'2026-06-28','10:30',V[0]),
  m('K6', 'COD','UZB', 'K','Group Stage',3,'2026-06-28','10:30',V[6]),

  // ── Group L ──
  m('L1', 'ENG','CRO', 'L','Group Stage',1,'2026-06-18','07:00',V[7]),
  m('L2', 'GHA','PAN', 'L','Group Stage',1,'2026-06-18','10:00',V[8]),
  m('L3', 'ENG','GHA', 'L','Group Stage',2,'2026-06-24','07:00',V[7]),
  m('L4', 'PAN','CRO', 'L','Group Stage',2,'2026-06-24','10:00',V[8]),
  m('L5', 'PAN','ENG', 'L','Group Stage',3,'2026-06-28','08:00',V[8]),
  m('L6', 'CRO','GHA', 'L','Group Stage',3,'2026-06-28','08:00',V[7]),

  // ════════════════════════════════════════════════════════════════
  //  ROUND OF 32  (Matches 73–88)
  // ════════════════════════════════════════════════════════════════
  m('R32-1', 'RSA','CAN',null,'Round of 32',null,'2026-06-29','00:30',V[2],'RSA vs CAN','M73'),
  m('R32-2', 'GER','PAR',null,'Round of 32',null,'2026-06-30','02:00',V[7],'GER vs PAR','M74'),
  m('R32-3', 'NED','MAR',null,'Round of 32',null,'2026-06-30','06:30',V[11],'NED vs MAR','M75'),
  m('R32-4', 'BRA','JPN',null,'Round of 32',null,'2026-06-29','22:30',V[9],'BRA vs JPN','M76'),
  m('R32-5', 'FRA','SWE',null,'Round of 32',null,'2026-07-01','02:30',V[0],'FRA vs SWE','M77'),
  m('R32-6', 'CIV','NOR',null,'Round of 32',null,'2026-06-30','22:30',V[1],'CIV vs NOR','M78'),
  m('R32-7', null,null,null,'Round of 32',null,'2026-07-01','06:30',V[10],'MEX vs Best 3rd (C/E)','M79'),
  m('R32-8', null,null,null,'Round of 32',null,'2026-07-01','21:30',V[15],'Winner L vs Best 3rd (I/J/K)','M80'),
  m('R32-9', 'USA','BIH',null,'Round of 32',null,'2026-07-02','05:30',V[3],'USA vs BIH','M81'),
  m('R32-10', null,null,null,'Round of 32',null,'2026-07-02','01:30',V[14],'BEL vs Best 3rd (A/I/J)','M82'),
  m('R32-11', null,null,null,'Round of 32',null,'2026-07-03','04:30',V[13],'Runner-up K vs Runner-up L','M83'),
  m('R32-12', 'ESP',null,null,'Round of 32',null,'2026-07-03','00:30',V[2],'ESP vs Runner-up J','M84'),
  m('R32-13', 'SUI',null,null,'Round of 32',null,'2026-07-03','08:30',V[12],'SUI vs Best 3rd (G/J)','M85'),
  m('R32-14', 'ARG','CPV',null,'Round of 32',null,'2026-07-04','03:30',V[4],'ARG vs CPV','M86'),
  m('R32-15', null,null,null,'Round of 32',null,'2026-07-04','07:00',V[8],'Winner K vs Best 3rd (E/I/L)','M87'),
  m('R32-16', 'AUS','EGY',null,'Round of 32',null,'2026-07-03','23:30',V[1],'AUS vs EGY','M88'),

  // ════════════════════════════════════════════════════════════════
  //  ROUND OF 16  (Matches 89–96)
  // ════════════════════════════════════════════════════════════════
  m('R16-1', null,null,null,'Round of 16',null,'2026-07-05','02:30',V[5],'Winner M74 vs Winner M77','M89'),
  m('R16-2', null,null,null,'Round of 16',null,'2026-07-04','22:30',V[9],'Winner M73 vs Winner M75','M90'),
  m('R16-3', null,null,null,'Round of 16',null,'2026-07-06','01:30',V[0],'Winner M76 vs Winner M78','M91'),
  m('R16-4', null,null,null,'Round of 16',null,'2026-07-06','05:30',V[10],'Winner M79 vs Winner M80','M92'),
  m('R16-5', null,null,null,'Round of 16',null,'2026-07-07','00:30',V[1],'Winner M83 vs Winner M84','M93'),
  m('R16-6', null,null,null,'Round of 16',null,'2026-07-07','05:30',V[14],'Winner M81 vs Winner M82','M94'),
  m('R16-7', null,null,null,'Round of 16',null,'2026-07-07','21:30',V[15],'Winner M86 vs Winner M88','M95'),
  m('R16-8', null,null,null,'Round of 16',null,'2026-07-08','01:30',V[12],'Winner M85 vs Winner M87','M96'),

  // ════════════════════════════════════════════════════════════════
  //  QUARTER-FINALS  (Matches 97–100)
  // ════════════════════════════════════════════════════════════════
  m('QF-1', null,null,null,'Quarter-Final',null,'2026-07-10','01:30',V[7],'Winner M89 vs Winner M90','M97'),
  m('QF-2', null,null,null,'Quarter-Final',null,'2026-07-11','00:30',V[2],'Winner M93 vs Winner M94','M98'),
  m('QF-3', null,null,null,'Quarter-Final',null,'2026-07-12','02:30',V[4],'Winner M91 vs Winner M92','M99'),
  m('QF-4', null,null,null,'Quarter-Final',null,'2026-07-12','06:30',V[8],'Winner M95 vs Winner M96','M100'),

  // ════════════════════════════════════════════════════════════════
  //  SEMI-FINALS  (Matches 101–102)
  // ════════════════════════════════════════════════════════════════
  m('SF-1', null,null,null,'Semi-Final',null,'2026-07-15','00:30',V[1],'Winner M97 vs Winner M98','M101'),
  m('SF-2', null,null,null,'Semi-Final',null,'2026-07-16','00:30',V[15],'Winner M99 vs Winner M100','M102'),

  // ════════════════════════════════════════════════════════════════
  //  THIRD PLACE  (Match 103)
  // ════════════════════════════════════════════════════════════════
  m('3RD', null,null,null,'Third Place',null,'2026-07-19','02:30',V[4],'Loser M101 vs Loser M102','M103'),

  // ════════════════════════════════════════════════════════════════
  //  FINAL  (Match 104)
  // ════════════════════════════════════════════════════════════════
  m('FIN', null,null,null,'Final',null,'2026-07-20','00:30',V[0],'Winner M101 vs Winner M102','M104'),
]

export const PHASES = [
  'Group Stage',
  'Round of 32',
  'Round of 16',
  'Quarter-Final',
  'Semi-Final',
  'Third Place',
  'Final',
]

export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Map match number label → match id (for quick lookup)
export const MATCH_LABEL_TO_ID = {}
MATCHES.forEach(match => {
  if (match.matchLabel) MATCH_LABEL_TO_ID[match.matchLabel] = match.id
})