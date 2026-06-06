// src/components/auction/AuctionLobby.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAuctionRoom, joinAuctionRoom } from "../../firebase/auctionHelpers";
import { PLAYERS } from "../../data/auctionPlayers";

export default function AuctionLobby({ mode, onRoomCreated, onBack }) {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState({
    budget: 1000,
    maxTeams: 6,
    bidIncrement: 5,
    bidTimer: 30,
    maxSquadSize: 15,
    minSquadSize: 11,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const displayName = profile?.displayName || user.email.split("@")[0];
      const room = await createAuctionRoom(user.uid, displayName, settings);
      onRoomCreated(room.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, hint, name, min, max, step = 1 }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300">{label}</label>
        <span className="text-emerald-400 font-black text-lg">{settings[name]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={settings[name]}
        onChange={(e) => setSettings((s) => ({ ...s, [name]: Number(e.target.value) }))}
        className="w-full accent-emerald-500 h-2 cursor-pointer"
      />
      {hint && <p className="text-gray-500 text-xs">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
        >
          ← Back
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-3xl mb-2">🏟️</div>
          <h2 className="text-2xl font-black mb-1">Create Auction Room</h2>
          <p className="text-gray-400 text-sm mb-8">
            Configure your auction. You'll get a shareable room code once created.
          </p>

          <div className="space-y-6">
            <Field
              label="Budget per Team"
              hint={`Each team starts with ${settings.budget} coins`}
              name="budget"
              min={200}
              max={2000}
              step={50}
            />
            <Field
              label="Max Teams"
              hint={`Up to ${settings.maxTeams} teams can join`}
              name="maxTeams"
              min={2}
              max={10}
            />
            <Field
              label="Bid Increment"
              hint={`Minimum raise per bid: ${settings.bidIncrement} coins`}
              name="bidIncrement"
              min={5}
              max={50}
              step={5}
            />
            <Field
              label="Bid Timer (seconds)"
              hint={`${settings.bidTimer}s countdown after each bid`}
              name="bidTimer"
              min={10}
              max={60}
              step={5}
            />
            <Field
              label="Min Squad Size"
              name="minSquadSize"
              min={7}
              max={11}
            />
            <Field
              label="Max Squad Size"
              name="maxSquadSize"
              min={11}
              max={15}
            />
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
            <p className="font-semibold text-emerald-400 mb-2">Room Summary</p>
            <div className="grid grid-cols-2 gap-1 text-gray-300">
              <span>Total pool budget:</span>
              <span className="font-bold text-white">{settings.budget * settings.maxTeams} coins</span>
              <span>Player pool size:</span>
              <span className="font-bold text-white">{PLAYERS.length} players</span>
              <span>Players per team:</span>
              <span className="font-bold text-white">{settings.minSquadSize}–{settings.maxSquadSize}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-black text-lg transition-all disabled:opacity-50"
          >
            {loading ? "Creating Room…" : "🚀 Create Auction Room"}
          </button>
        </div>
      </div>
    </div>
  );
}