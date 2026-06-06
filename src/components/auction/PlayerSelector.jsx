// src/components/auction/PlayerSelector.jsx
import { useState, useMemo } from "react";
import { PLAYERS, TIERS } from "../../data/auctionPlayers";
import { TierBadge } from "./AuctionRoom";

const POS_ICONS = { GK: "🧤", DEF: "🛡️", MID: "⚙️", FWD: "⚡" };

export default function PlayerSelector({ room, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("ALL");
  const [filterTier, setFilterTier] = useState("ALL");
  const [sortBy, setSortBy] = useState("tier"); // tier | name | price | rating

  // IDs already sold or currently up
  const usedIds = useMemo(() => {
    const sold = (room.soldPlayers || []).map((s) => s.player?.id);
    const current = room.currentPlayer?.id;
    return new Set([...sold, current].filter(Boolean));
  }, [room]);

  const available = useMemo(() => {
    let list = PLAYERS.filter((p) => !usedIds.has(p.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      );
    }
    if (filterPos !== "ALL") list = list.filter((p) => p.position === filterPos);
    if (filterTier !== "ALL") list = list.filter((p) => p.tier === filterTier);

    const TIER_ORDER = { ICON: 0, ELITE: 1, STAR: 2, REGULAR: 3 };
    list = [...list].sort((a, b) => {
      if (sortBy === "tier") return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.basePrice - a.basePrice;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

    return list;
  }, [search, filterPos, filterTier, sortBy, usedIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg">Nominate Player</h3>
            <p className="text-gray-400 text-xs">{available.length} players available</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-white/10 space-y-2">
          <input
            type="text"
            placeholder="Search player or country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-400"
          />
          <div className="flex flex-wrap gap-2">
            {/* Position filter */}
            {["ALL", "GK", "DEF", "MID", "FWD"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPos(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  filterPos === p
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                {p === "ALL" ? "All Pos" : `${POS_ICONS[p]} ${p}`}
              </button>
            ))}
            <div className="w-px bg-white/10 mx-1" />
            {/* Tier filter */}
            {["ALL", "ICON", "ELITE", "STAR", "REGULAR"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTier(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  filterTier === t
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                {t === "ALL" ? "All Tiers" : t}
              </button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Sort:</span>
            {["tier", "rating", "price", "name"].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-0.5 rounded capitalize transition ${
                  sortBy === s ? "text-white font-bold" : "hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Player list */}
        <div className="overflow-y-auto flex-1 px-3 py-2 space-y-1">
          {available.length === 0 && (
            <div className="text-center text-gray-500 py-10 text-sm">No players match your filters.</div>
          )}
          {available.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition text-left group"
            >
              <span className="text-2xl">{p.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm group-hover:text-white">{p.name}</div>
                <div className="text-gray-500 text-xs">{p.country} · {POS_ICONS[p.position]} {p.position} · Age {p.age}</div>
              </div>
              <div className="flex items-center gap-2">
                <TierBadge tier={p.tier} />
                <div className="text-right text-xs">
                  <div className="text-amber-400 font-bold">⭐ {p.rating}</div>
                  <div className="text-gray-400">💰 {p.basePrice}</div>
                </div>
              </div>
              <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition text-lg">→</span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-white/10 text-xs text-gray-500 text-center">
          Click a player to nominate them for auction
        </div>
      </div>
    </div>
  );
}