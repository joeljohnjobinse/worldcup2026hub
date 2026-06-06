// src/components/auction/SquadView.jsx
import { useState } from "react";
import { TierBadge } from "./AuctionRoom";
import { SQUAD_RULES } from "../../data/auctionPlayers";

const POS_ORDER = ["GK", "DEF", "MID", "FWD"];
const POS_ICONS = { GK: "🧤", DEF: "🛡️", MID: "⚙️", FWD: "⚡" };
const POS_COLORS = {
  GK:  "text-yellow-400",
  DEF: "text-blue-400",
  MID: "text-green-400",
  FWD: "text-red-400",
};

export default function SquadView({ teams, myUid }) {
  const [selected, setSelected] = useState(myUid || Object.keys(teams || {})[0]);

  if (!teams || !Object.keys(teams).length) {
    return <p className="text-gray-500 text-center py-12">No teams yet.</p>;
  }

  const teamList = Object.values(teams);
  const team = teams[selected];

  const byPos = {};
  POS_ORDER.forEach((p) => { byPos[p] = []; });
  (team?.players || []).forEach((p) => {
    if (byPos[p.position]) byPos[p.position].push(p);
  });

  const totalSpent = (team?.players || []).reduce((s, p) => s + (p.soldFor || 0), 0);
  const initialBudget = (team?.budget || 0) + totalSpent;

  // Squad validity check
  const gkOk = byPos.GK.length >= SQUAD_RULES.minGK;
  const defOk = byPos.DEF.length >= SQUAD_RULES.minDEF;
  const midOk = byPos.MID.length >= SQUAD_RULES.minMID;
  const fwdOk = byPos.FWD.length >= SQUAD_RULES.minFWD;
  const totalOk = (team?.players?.length || 0) >= SQUAD_RULES.minPlayers;
  const squadValid = gkOk && defOk && midOk && fwdOk && totalOk;

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <div className="flex flex-wrap gap-2">
        {teamList.map((t) => (
          <button
            key={t.uid}
            onClick={() => setSelected(t.uid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border ${
              selected === t.uid
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            {t.name}
            {t.uid === myUid && <span className="text-xs opacity-70">(You)</span>}
          </button>
        ))}
      </div>

      {team && (
        <>
          {/* Squad Header */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: team.color + "33", border: `2px solid ${team.color}` }}
                />
                <div>
                  <h2 className="text-xl font-black">{team.name}</h2>
                  <p className="text-gray-400 text-sm">{team.players?.length || 0} players drafted</p>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-emerald-400 font-black text-xl">💰 {team.budget}</div>
                  <div className="text-gray-500 text-xs">Remaining</div>
                </div>
                <div>
                  <div className="text-amber-400 font-black text-xl">💸 {totalSpent}</div>
                  <div className="text-gray-500 text-xs">Spent</div>
                </div>
                <div>
                  <div className={`font-black text-xl ${squadValid ? "text-emerald-400" : "text-red-400"}`}>
                    {squadValid ? "✅" : "❌"}
                  </div>
                  <div className="text-gray-500 text-xs">Valid Squad</div>
                </div>
              </div>
            </div>

            {/* Budget bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Budget used</span>
                <span>{Math.round((totalSpent / initialBudget) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all"
                  style={{ width: `${Math.min((totalSpent / initialBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Formation / Position groups */}
          <div className="space-y-4">
            {POS_ORDER.map((pos) => {
              const players = byPos[pos];
              const minReq = SQUAD_RULES[`min${pos}`];
              const met = players.length >= minReq;
              return (
                <div key={pos} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className={`px-5 py-3 border-b border-white/10 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{POS_ICONS[pos]}</span>
                      <span className={`font-black ${POS_COLORS[pos]}`}>{pos}</span>
                      <span className="text-gray-500 text-xs">
                        (min {minReq})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{players.length}</span>
                      {!met && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          Need {minReq - players.length} more
                        </span>
                      )}
                    </div>
                  </div>
                  {players.length === 0 ? (
                    <div className="px-5 py-4 text-gray-600 text-sm italic">No {pos}s drafted yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {players.map((p) => (
                        <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                          <span className="text-2xl">{p.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{p.name}</div>
                            <div className="text-gray-500 text-xs">{p.country} · Age {p.age}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TierBadge tier={p.tier} />
                            <div className="text-right">
                              <div className="text-xs text-gray-400">⭐ {p.rating}</div>
                              <div className="text-xs text-amber-400 font-bold">💰 {p.soldFor}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}