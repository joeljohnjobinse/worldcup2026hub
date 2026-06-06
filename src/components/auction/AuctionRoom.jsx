// src/components/auction/AuctionRoom.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToRoom,
  joinAuctionRoom,
  startAuction,
  nominatePlayer,
  placeBid,
  sellPlayer,
  unsoldPlayer,
  TEAM_COLORS,
} from "../../firebase/auctionHelpers";
import { PLAYERS } from "../../data/auctionPlayers";
import PlayerCard from "./PlayerCard";
import BidPanel from "./BidPanel";
import SquadView from "./SquadView";
import TeamsSidebar from "./TeamsSidebar";
import PlayerSelector from "./PlayerSelector";
import ChatBox from "./ChatBox";

export default function AuctionRoom({ roomId, onLeave }) {
  const { user, profile } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("auction");
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [rightPanel, setRightPanel] = useState("teams"); // "teams" | "chat"
  const timerRef = useRef(null);
  const lastBidRef = useRef(null);

  const displayName = profile?.displayName || user?.email?.split("@")[0] || "You";
  const isHost = room?.hostUid === user?.uid;
  const myTeam = room?.teams?.[user?.uid];
  const myColor = myTeam?.color || "#52A0E0";

  // ── Subscribe to room ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (data) => {
      setRoom(data);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  // ── Auto-join room when data arrives ──────────────────────────────────────
  useEffect(() => {
    if (!room || !user) return;
    if (!room.teams?.[user.uid]) {
      joinAuctionRoom(room.code, user.uid, displayName).catch(() => {});
    }
  }, [room?.id]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!room?.currentBid || !room?.currentPlayer) {
      clearInterval(timerRef.current);
      setTimerActive(false);
      setCountdown(0);
      return;
    }
    const bidTimestamp = room.currentBid?.timestamp;
    if (bidTimestamp !== lastBidRef.current) {
      lastBidRef.current = bidTimestamp;
      setCountdown(room.settings?.bidTimer || 30);
      setTimerActive(true);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [room?.currentBid?.timestamp]);

  // ── Auto-sell when timer hits 0 (host only) ───────────────────────────────
  useEffect(() => {
    if (!isHost || countdown !== 0 || !room?.currentBid?.uid || !room?.currentPlayer) return;
    const timeout = setTimeout(() => sellPlayer(roomId, room), 500);
    return () => clearTimeout(timeout);
  }, [countdown, isHost]);

  const handleStartAuction = async () => {
    const shuffled = [...PLAYERS].sort(() => Math.random() - 0.5).map((p) => p.id);
    await startAuction(roomId, shuffled);
  };

  const handleNominate = async (player) => {
    await nominatePlayer(roomId, player);
    setShowPlayerSelector(false);
  };

  const handleBid = async (amount) => {
    await placeBid(roomId, user.uid, displayName, amount);
  };

  const handleSell   = () => sellPlayer(roomId, room);
  const handleUnsold = () => unsoldPlayer(roomId, room);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Joining room…</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl text-red-400">Room not found.</p>
          <button onClick={onLeave} className="mt-4 text-gray-400 hover:text-white">← Go Back</button>
        </div>
      </div>
    );
  }

  const teamCount  = Object.keys(room.teams || {}).length;
  const soldCount  = (room.soldPlayers || []).filter((s) => s.soldTo).length;
  const unsoldCount = (room.soldPlayers || []).filter((s) => !s.soldTo).length;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f0f1a] border-b border-white/10 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={onLeave} className="text-gray-400 hover:text-white text-sm">←</button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg">WC2026 Auction</span>
              <span className="bg-white/10 text-gray-300 text-xs font-mono px-2 py-0.5 rounded-lg tracking-widest">
                {room.code}
              </span>
              <StatusBadge status={room.status} />
            </div>
            <p className="text-gray-500 text-xs">Hosted by {room.hostName} · {teamCount} teams</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-black text-emerald-400">{soldCount}</div>
            <div className="text-gray-500 text-xs">Sold</div>
          </div>
          <div className="text-center">
            <div className="font-black text-red-400">{unsoldCount}</div>
            <div className="text-gray-500 text-xs">Unsold</div>
          </div>
          <div className="text-center">
            <div className="font-black text-amber-400">{room.playerQueue?.length || 0}</div>
            <div className="text-gray-500 text-xs">Remaining</div>
          </div>
          {myTeam && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1 text-center">
              <div className="font-black text-emerald-400">💰 {myTeam.budget}</div>
              <div className="text-gray-500 text-xs">Your Budget</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f0f1a] border-b border-white/10 px-4 flex gap-1">
        {["auction", "squads", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition border-b-2 ${
              tab === t
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t === "auction" ? "⚽ Auction" : t === "squads" ? "👥 Squads" : "📜 History"}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">

        {/* AUCTION TAB */}
        {tab === "auction" && (
          <div className="h-full max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">

            {/* Left col: player + bidding (scrollable) */}
            <div className="lg:col-span-2 overflow-y-auto space-y-4 pr-1">

              {/* LOBBY */}
              {room.status === "lobby" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🏟️</div>
                  <h3 className="text-2xl font-black mb-2">Waiting in Lobby</h3>
                  <p className="text-gray-400 mb-6">
                    {teamCount}/{room.settings.maxTeams} teams joined.{" "}
                    {isHost ? "Start the auction when everyone's ready." : "Waiting for the host to start."}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {Object.values(room.teams || {}).map((t) => (
                      <div key={t.uid} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        <span>{t.name}</span>
                        {t.uid === room.hostUid && <span className="text-amber-400 text-xs">👑 HOST</span>}
                      </div>
                    ))}
                  </div>
                  {isHost && teamCount >= 2 && (
                    <button onClick={handleStartAuction}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-black hover:opacity-90 transition">
                      🚀 Start Auction
                    </button>
                  )}
                  {isHost && teamCount < 2 && (
                    <p className="text-gray-500 text-sm">At least 2 teams needed to start.</p>
                  )}
                </div>
              )}

              {/* PAUSED or BIDDING with no player yet */}
              {(room.status === "paused" || (room.status === "bidding" && !room.currentPlayer)) && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">
                    {room.status === "paused" ? "⏸️" : "🎯"}
                  </div>
                  <h3 className="text-xl font-black mb-2">
                    {room.status === "paused" ? "Round Paused" : "Auction Started!"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {isHost ? "Nominate the next player to kick things off." : "Waiting for the host to nominate a player."}
                  </p>
                  {isHost && (
                    <button onClick={() => setShowPlayerSelector(true)}
                      className="px-6 py-3 bg-emerald-500 rounded-xl font-bold hover:bg-emerald-400 transition">
                      ⚽ Nominate Player
                    </button>
                  )}
                </div>
              )}

              {/* ACTIVE BIDDING */}
              {room.status === "bidding" && room.currentPlayer && (
                <div className="space-y-4">
                  {/* Timer */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-semibold">BID COUNTDOWN</span>
                      <span className={`text-2xl font-black tabular-nums ${countdown <= 5 ? "text-red-400 animate-pulse" : countdown <= 10 ? "text-amber-400" : "text-emerald-400"}`}>
                        {countdown}s
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${countdown <= 5 ? "bg-red-500" : countdown <= 10 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${(countdown / (room.settings?.bidTimer || 30)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <PlayerCard player={room.currentPlayer} />

                  {/* Current bid */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-gray-400 text-sm mb-1">CURRENT HIGHEST BID</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-black text-amber-400">
                          💰 {room.currentBid?.amount || room.currentPlayer.basePrice}
                        </div>
                        {room.currentBid?.uid ? (
                          <div className="text-gray-300 text-sm mt-1">
                            by <span className="text-white font-semibold">{room.currentBid.name}</span>
                            {room.currentBid.uid === user.uid && (
                              <span className="ml-2 text-emerald-400 text-xs font-bold">(You)</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm mt-1">Starting bid — be the first!</div>
                        )}
                      </div>
                      {isHost && (
                        <div className="flex gap-2">
                          <button onClick={handleSell}
                            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition">
                            ✅ Sell Now
                          </button>
                          <button onClick={handleUnsold}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/30 transition">
                            ❌ Unsold
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <BidPanel room={room} myTeam={myTeam} onBid={handleBid} userId={user.uid} />
                </div>
              )}

              {/* ENDED */}
              {room.status === "ended" && (
                <div className="bg-gradient-to-br from-emerald-900/30 to-amber-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-2xl font-black mb-2">Auction Complete!</h3>
                  <p className="text-gray-400 mb-4">{soldCount} players sold. Check the Squads tab for results.</p>
                  <button onClick={() => setTab("squads")}
                    className="px-6 py-3 bg-emerald-500 rounded-xl font-bold hover:bg-emerald-400 transition">
                    View Final Squads →
                  </button>
                </div>
              )}
            </div>

            {/* Right col: Teams / Chat toggle */}
            <div className="flex flex-col h-full min-h-0">
              {/* Toggle buttons */}
              <div className="flex rounded-xl overflow-hidden border border-white/10 mb-3 flex-shrink-0">
                <button
                  onClick={() => setRightPanel("teams")}
                  className={`flex-1 py-2 text-xs font-bold transition ${
                    rightPanel === "teams"
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  👥 Teams
                </button>
                <button
                  onClick={() => setRightPanel("chat")}
                  className={`flex-1 py-2 text-xs font-bold transition ${
                    rightPanel === "chat"
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  💬 Chat
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {rightPanel === "teams" ? (
                  <div className="overflow-y-auto h-full">
                    <TeamsSidebar
                      teams={room.teams}
                      currentBidUid={room.currentBid?.uid}
                      currentPlayer={room.currentPlayer}
                      myUid={user.uid}
                    />
                  </div>
                ) : (
                  <div className="h-full" style={{ minHeight: "400px" }}>
                    <ChatBox
                      roomId={roomId}
                      uid={user.uid}
                      name={displayName}
                      color={myColor}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SQUADS TAB */}
        {tab === "squads" && (
          <div className="max-w-6xl mx-auto px-4 py-6 overflow-y-auto h-full">
            <SquadView teams={room.teams} myUid={user.uid} />
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="max-w-4xl mx-auto px-4 py-6 overflow-y-auto h-full">
            <h2 className="text-xl font-black mb-4">Auction History</h2>
            {!room.soldPlayers?.length ? (
              <p className="text-gray-500 text-center py-12">No players sold yet.</p>
            ) : (
              <div className="space-y-2">
                {[...room.soldPlayers].reverse().map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl">{entry.player.flag}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{entry.player.name}</div>
                      <div className="text-gray-500 text-xs">{entry.player.position} · {entry.player.country}</div>
                    </div>
                    <TierBadge tier={entry.player.tier} />
                    {entry.soldTo ? (
                      <div className="text-right">
                        <div className="text-amber-400 font-black">💰 {entry.soldFor}</div>
                        <div className="text-gray-400 text-xs">{entry.soldToName}</div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm font-bold">UNSOLD</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player Selector Modal */}
      {showPlayerSelector && (
        <PlayerSelector
          room={room}
          onSelect={handleNominate}
          onClose={() => setShowPlayerSelector(false)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    lobby:   { label: "Lobby",  cls: "bg-gray-500/20 text-gray-300" },
    bidding: { label: "LIVE",   cls: "bg-red-500/20 text-red-400 animate-pulse" },
    paused:  { label: "Paused", cls: "bg-amber-500/20 text-amber-400" },
    ended:   { label: "Ended",  cls: "bg-emerald-500/20 text-emerald-400" },
  };
  const s = map[status] || map.lobby;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function TierBadge({ tier }) {
  const map = {
    ICON:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ELITE:   "bg-red-500/20 text-red-400 border-red-500/30",
    STAR:    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    REGULAR: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[tier] || map.REGULAR}`}>
      {tier}
    </span>
  );
}