// src/components/auction/TeamsSidebar.jsx
import { TierBadge } from "./AuctionRoom";

export default function TeamsSidebar({ teams, currentBidUid, currentPlayer, myUid }) {
  if (!teams) return null;
  const sorted = Object.values(teams).sort((a, b) => b.budget - a.budget);

  return (
    <div className="space-y-3">
      <h3 className="font-black text-sm text-gray-400 uppercase tracking-wide">Teams</h3>
      {sorted.map((team) => {
        const isLeading = currentBidUid === team.uid;
        const isMe = team.uid === myUid;
        return (
          <div
            key={team.uid}
            className={`rounded-2xl border p-4 transition-all ${
              isLeading
                ? "bg-amber-500/10 border-amber-500/50"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-bold text-sm truncate max-w-[100px]">{team.name}</span>
                {isMe && (
                  <span className="text-xs text-emerald-400 font-bold">(You)</span>
                )}
              </div>
              {isLeading && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  🔨 Leading
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-amber-400 font-black">💰 {team.budget}</div>
                <div className="text-gray-500">Budget</div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-white font-black">{team.players?.length || 0}</div>
                <div className="text-gray-500">Players</div>
              </div>
            </div>

            {/* Mini squad preview */}
            {team.players?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {team.players.slice(-4).map((p) => (
                  <span
                    key={p.id}
                    title={p.name}
                    className="text-sm cursor-default"
                  >
                    {p.flag}
                  </span>
                ))}
                {team.players.length > 4 && (
                  <span className="text-xs text-gray-500">+{team.players.length - 4}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}