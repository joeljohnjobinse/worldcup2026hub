// src/components/auction/PlayerCard.jsx
import { TIERS } from "../../data/auctionPlayers";
import { TierBadge } from "./AuctionRoom";

const POSITION_COLORS = {
  GK:  "from-yellow-600/30 to-yellow-800/10 border-yellow-500/30",
  DEF: "from-blue-600/30 to-blue-800/10 border-blue-500/30",
  MID: "from-green-600/30 to-green-800/10 border-green-500/30",
  FWD: "from-red-600/30 to-red-800/10 border-red-500/30",
};

const POSITION_ICONS = { GK: "🧤", DEF: "🛡️", MID: "⚙️", FWD: "⚡" };

export default function PlayerCard({ player, compact = false }) {
  if (!player) return null;

  const tierData = TIERS[player.tier];
  const posStyle = POSITION_COLORS[player.position] || POSITION_COLORS.MID;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="text-2xl">{player.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{player.name}</div>
          <div className="text-gray-500 text-xs">{player.country}</div>
        </div>
        <TierBadge tier={player.tier} />
        <div className="text-right">
          <div className="text-xs text-gray-400">{POSITION_ICONS[player.position]} {player.position}</div>
          <div className="text-xs text-amber-400 font-bold">⭐ {player.rating}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br ${posStyle} border rounded-2xl p-6 overflow-hidden`}>
      {/* Background decorative flag */}
      <div className="absolute top-2 right-4 text-8xl opacity-10 select-none pointer-events-none">
        {player.flag}
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TierBadge tier={player.tier} />
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                {POSITION_ICONS[player.position]} {player.position}
              </span>
            </div>
            <h2 className="text-3xl font-black leading-none">{player.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
              <span>{player.flag}</span>
              <span>{player.country}</span>
              <span>·</span>
              <span>Age {player.age}</span>
            </div>
          </div>
          {/* Rating circle */}
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-2"
              style={{ borderColor: tierData?.color || "#fff", color: tierData?.color || "#fff" }}
            >
              {player.rating}
            </div>
            <div className="text-xs text-gray-400 mt-1">Rating</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <StatBox label="Base Price" value={`💰 ${player.basePrice}`} />
          <StatBox label="Position" value={`${POSITION_ICONS[player.position]} ${player.position}`} />
          <StatBox label="Nation" value={`${player.flag} ${player.country}`} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-black/20 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}