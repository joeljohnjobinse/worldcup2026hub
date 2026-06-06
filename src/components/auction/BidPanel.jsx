// src/components/auction/BidPanel.jsx
import { useState } from "react";

export default function BidPanel({ room, myTeam, onBid, userId }) {
  const [customAmount, setCustomAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState("");

  if (!room?.currentPlayer || !myTeam) return null;

  const currentAmount = room.currentBid?.amount || room.currentPlayer.basePrice;
  const increment = room.settings?.bidIncrement || 5;
  const minNextBid = currentAmount + increment;
  const isMyBid = room.currentBid?.uid === userId;
  const canAfford = (amount) => myTeam.budget >= amount;
  const alreadyHasPlayer = myTeam.players?.some((p) => p.id === room.currentPlayer.id);

  const quickBids = [
    minNextBid,
    minNextBid + increment,
    minNextBid + increment * 2,
    minNextBid + increment * 5,
  ].filter((b) => b <= myTeam.budget);

  const handleBid = async (amount) => {
    const parsed = Number(amount);
    if (!parsed || parsed < minNextBid) {
      setError(`Minimum bid is ${minNextBid} coins.`);
      return;
    }
    if (!canAfford(parsed)) {
      setError("Not enough budget!");
      return;
    }
    setError("");
    setBidding(true);
    try {
      await onBid(parsed);
      setCustomAmount("");
    } catch (e) {
      setError("Bid failed. Try again.");
    } finally {
      setBidding(false);
    }
  };

  const squadSize = myTeam.players?.length || 0;
  const maxSquad = room.settings?.maxSquadSize || 15;
  const squadFull = squadSize >= maxSquad;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm text-gray-300">YOUR BID</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">Budget: <span className="text-emerald-400 font-bold">💰 {myTeam.budget}</span></span>
          <span className="text-gray-400">Squad: <span className="text-white font-bold">{squadSize}/{maxSquad}</span></span>
        </div>
      </div>

      {isMyBid && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-emerald-400 text-sm font-bold">
          ✅ You hold the highest bid! Defend it.
        </div>
      )}

      {squadFull && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-red-400 text-sm">
          🚫 Your squad is full ({maxSquad} players max). You cannot bid.
        </div>
      )}

      {alreadyHasPlayer && (
        <div className="text-amber-400 text-xs">You already own this player.</div>
      )}

      {!squadFull && !alreadyHasPlayer && (
        <>
          {/* Quick bid buttons */}
          {quickBids.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">QUICK BID</p>
              <div className="flex flex-wrap gap-2">
                {quickBids.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleBid(amount)}
                    disabled={bidding}
                    className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl text-sm font-bold hover:bg-amber-500/30 transition disabled:opacity-50"
                  >
                    💰 {amount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom bid */}
          <div>
            <p className="text-xs text-gray-500 mb-2">CUSTOM BID (min {minNextBid})</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`${minNextBid}+`}
                min={minNextBid}
                max={myTeam.budget}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 placeholder:text-gray-600"
              />
              <button
                onClick={() => handleBid(Number(customAmount))}
                disabled={bidding || !customAmount}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-black text-black hover:opacity-90 transition disabled:opacity-40 text-sm"
              >
                {bidding ? "…" : "BID"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </>
      )}
    </div>
  );
}