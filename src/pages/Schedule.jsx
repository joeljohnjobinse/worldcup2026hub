import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'

import {
  MATCHES,
  PHASES,
  GROUPS,
  TEAMS,
} from '../firebase/matchData'

import MatchCard from '../components/MatchCard'

export default function Schedule() {

  const [phase, setPhase] = useState('All')
  const [group, setGroup] = useState('All')
  const [search, setSearch] = useState('')

  const filteredMatches = useMemo(() => {

    return MATCHES.filter(match => {

      if (
        phase !== 'All' &&
        match.phase !== phase
      ) {
        return false
      }

      if (
        group !== 'All' &&
        match.group !== group
      ) {
        return false
      }

      if (search.trim()) {

        const q =
          search.toLowerCase()

        const homeName =
          TEAMS[match.homeTeam]
            ?.name
            ?.toLowerCase() || ''

        const awayName =
          TEAMS[match.awayTeam]
            ?.name
            ?.toLowerCase() || ''

        const venue =
          match.venue
            ?.toLowerCase() || ''

        const city =
          match.city
            ?.toLowerCase() || ''

        const label =
          match.label
            ?.toLowerCase() || ''

        return (

          homeName.includes(q) ||

          awayName.includes(q) ||

          venue.includes(q) ||

          city.includes(q) ||

          label.includes(q)

        )
      }

      return true

    })

  }, [phase, group, search])

  const groupedMatches = useMemo(() => {

    const grouped = {}

    filteredMatches.forEach(match => {

      if (!grouped[match.date]) {
        grouped[match.date] = []
      }

      grouped[match.date].push(match)

    })

    Object.keys(grouped).forEach(date => {

      grouped[date].sort(
        (a, b) =>
          a.kickoff.localeCompare(
            b.kickoff
          )
      )

    })

    return grouped

  }, [filteredMatches])

  const sortedDates =
    Object.keys(groupedMatches)
      .sort()

  return (

    <div className="
      max-w-7xl
      mx-auto
      px-4
      sm:px-6
      lg:px-8
      py-10
    ">

      {/* Header */}

      <div className="mb-8">

        <h1 className="
          font-display
          text-5xl
          font-black
          uppercase
          text-white
          tracking-wide
          mb-2
        ">
          Match Schedule
        </h1>

        <p className="text-wc-muted">
          All {MATCHES.length} matches ·
          June 2026 – July 2026
        </p>

      </div>

      {/* Filters */}

      <div className="
        card
        mb-8
        flex
        flex-wrap
        gap-4
      ">

        <div className="
          flex-1
          min-w-[240px]
        ">

          <label className="
            block
            text-xs
            text-wc-muted
            font-semibold
            uppercase
            tracking-widest
            mb-1.5
          ">
            Search
          </label>

          <input
            type="text"
            value={search}
            onChange={e =>
              setSearch(
                e.target.value
              )
            }
            placeholder="
              Team, venue, city...
            "
            className="input"
          />

        </div>

        <div>

          <label className="
            block
            text-xs
            text-wc-muted
            font-semibold
            uppercase
            tracking-widest
            mb-1.5
          ">
            Phase
          </label>

          <select
            value={phase}
            onChange={e =>
              setPhase(
                e.target.value
              )
            }
            className="
              input
              min-w-[180px]
            "
          >

            <option value="All">
              All
            </option>

            {PHASES.map(p => (

              <option
                key={p}
                value={p}
              >
                {p}
              </option>

            ))}

          </select>

        </div>

        <div>

          <label className="
            block
            text-xs
            text-wc-muted
            font-semibold
            uppercase
            tracking-widest
            mb-1.5
          ">
            Group
          </label>

          <select
            value={group}
            onChange={e =>
              setGroup(
                e.target.value
              )
            }
            className="
              input
              min-w-[140px]
            "
          >

            <option value="All">
              All
            </option>

            {GROUPS.map(g => (

              <option
                key={g}
                value={g}
              >
                Group {g}
              </option>

            ))}

          </select>

        </div>

        <div className="
          flex
          items-end
        ">

          <button
            className="
              btn-ghost
              text-sm
            "
            onClick={() => {

              setPhase('All')
              setGroup('All')
              setSearch('')

            }}
          >
            Reset
          </button>

        </div>

      </div>

      {/* Match count */}

      <div className="
        flex
        justify-between
        items-center
        mb-6
      ">

        <span className="
          text-sm
          text-wc-muted
        ">
          {filteredMatches.length} matches
        </span>

      </div>

      {/* Matches */}

      {sortedDates.length === 0 ? (

        <div className="
          text-center
          py-24
          text-wc-muted
        ">
          No matches found.
        </div>

      ) : (

        sortedDates.map(date => {

          let formattedDate = date

          try {

            formattedDate =
              format(
                parseISO(date),
                'EEEE, MMMM d, yyyy'
              )

          } catch {}

          return (

            <div
              key={date}
              className="mb-10"
            >

              <div className="
                flex
                items-center
                gap-4
                mb-5
              ">

                <div className="
                  h-px
                  flex-1
                  bg-wc-border
                " />

                <span className="
                  text-xs
                  md:text-sm
                  uppercase
                  tracking-widest
                  text-wc-muted
                  font-semibold
                ">
                  {formattedDate}
                </span>

                <div className="
                  h-px
                  flex-1
                  bg-wc-border
                " />

              </div>

              <div className="
                grid
                sm:grid-cols-2
                xl:grid-cols-3
                gap-4
              ">

                {groupedMatches[date]
                  .map(match => (

                  <MatchCard
                    key={match.id}
                    match={match}
                  />

                ))}

              </div>

            </div>

          )

        })

      )}

    </div>

  )

}