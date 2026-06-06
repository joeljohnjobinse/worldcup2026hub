// src/pages/Auction.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuctionLobby from "../components/auction/AuctionLobby";
import AuctionRoom from "../components/auction/AuctionRoom";
import { getRoomByCode, getUserRooms } from "../firebase/auctionHelpers";

export default function Auction() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [myRooms, setMyRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // fetch rooms whenever we return to home
  useEffect(() => {
    if (!user || view !== "home") return;
    setRoomsLoading(true);
    getUserRooms(user.uid)
      .then((rooms) => {
        // newest first
        const sorted = rooms.sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
        setMyRooms(sorted);
      })
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
  }, [user, view]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const room = await getRoomByCode(joinCode.trim().toUpperCase());
      if (!room) throw new Error("Room not found. Check your code.");
      setActiveRoomId(room.id);
      setView("room");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejoin = (roomId) => {
    setActiveRoomId(roomId);
    setView("room");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6">You need to sign in to join or host an auction.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-emerald-500 rounded-xl font-bold hover:bg-emerald-400 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (view === "room" && activeRoomId) {
    return (
      <AuctionRoom
        roomId={activeRoomId}
        onLeave={() => { setView("home"); setActiveRoomId(null); }}
      />
    );
  }

  if (view === "create") {
    return (
      <AuctionLobby
        mode="create"
        onRoomCreated={(id) => { setActiveRoomId(id); setView("room"); }}
        onBack={() => setView("home")}
      />
    );
  }

  const STATUS_META = {
    lobby:   { label: "In Lobby",  cls: "bg-gray-500/20 text-gray-300",            icon: "🟡" },
    bidding: { label: "LIVE",      cls: "bg-red-500/20 text-red-400",               icon: "🔴" },
    paused:  { label: "Paused",    cls: "bg-amber-500/20 text-amber-400",           icon: "🟠" },
    ended:   { label: "Ended",     cls: "bg-emerald-500/20 text-emerald-400",       icon: "✅" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-amber-900/20" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6 text-emerald-400 text-sm font-semibold">
            ⚽ FIFA World Cup 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            PLAYER{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              AUCTION
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Draft your dream World Cup squad. Bid on 120+ real players, manage your budget, build the ultimate team with your friends.
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Host */}
            <button
              onClick={() => setView("create")}
              className="group relative bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-8 text-left hover:border-emerald-400/60 hover:from-emerald-600/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-xl font-black mb-2">Host Auction</h3>
              <p className="text-gray-400 text-sm">
                Create a private room, set the rules, and invite your friends to draft players.
              </p>
              <div className="mt-4 text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Create Room →
              </div>
            </button>

            {/* Join */}
            <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-2xl p-8 text-left">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-black mb-2">Join Auction</h3>
              <p className="text-gray-400 text-sm mb-4">
                Enter your room code to join a friend's auction room.
              </p>
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm uppercase tracking-widest font-mono focus:outline-none focus:border-amber-400 text-white placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-sm font-bold text-black transition disabled:opacity-50"
                >
                  {loading ? "…" : "Join"}
                </button>
              </form>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── My Rooms ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">My Rooms</h2>
          {roomsLoading && (
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {!roomsLoading && myRooms.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm">
            No rooms yet. Create one above to get started!
          </div>
        )}

        {myRooms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRooms.map((room) => {
              const meta = STATUS_META[room.status] || STATUS_META.lobby;
              const isHost = room.hostUid === user.uid;
              const teamCount = Object.keys(room.teams || {}).length;
              const myTeam = room.teams?.[user.uid];
              const soldCount = (room.soldPlayers || []).filter((s) => s.soldTo).length;

              return (
                <div
                  key={room.id}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-4 transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-black text-white tracking-widest text-sm">
                          {room.code}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {isHost ? "👑 You hosted" : `Hosted by ${room.hostName}`}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/20 rounded-xl p-2">
                      <div className="text-white font-black text-sm">{teamCount}</div>
                      <div className="text-gray-500 text-xs">Teams</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2">
                      <div className="text-amber-400 font-black text-sm">{soldCount}</div>
                      <div className="text-gray-500 text-xs">Sold</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2">
                      <div className="text-emerald-400 font-black text-sm">
                        💰 {myTeam?.budget ?? room.settings?.budget ?? "—"}
                      </div>
                      <div className="text-gray-500 text-xs">My Budget</div>
                    </div>
                  </div>

                  {/* Rejoin button */}
                  <button
                    onClick={() => handleRejoin(room.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                      room.status === "ended"
                        ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                        : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                    }`}
                  >
                    {room.status === "ended" ? "📊 View Results" : "→ Rejoin Room"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "👥", label: "Max Players per Room", value: "8 Teams" },
            { icon: "💰", label: "Default Budget",        value: "1000 Coins" },
            { icon: "⚽", label: "Player Pool",           value: "120 Players" },
            { icon: "⏱️", label: "Bid Timer",             value: "30 Seconds" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-lg font-black">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-center mb-8 text-gray-300">HOW IT WORKS</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Create or Join",  desc: "Host creates a room and shares the 6-character code with friends.", icon: "🔑" },
            { step: "02", title: "Bid on Players",  desc: "Host nominates players one-by-one. Everyone bids within the countdown timer.", icon: "🔨" },
            { step: "03", title: "Build Your Squad",desc: "Highest bidder wins the player. Manage budget. Build the best 11–15 player squad.", icon: "🏆" },
          ].map((s) => (
            <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-500 font-black text-lg font-mono">{s.step}</span>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <h3 className="text-lg font-black mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}