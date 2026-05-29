import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  upcoming: "text-wc-gold border-wc-gold/30 bg-wc-gold/10",
  live: "text-green-400 border-green-400/30 bg-green-400/10",
  finished: "text-wc-muted border-wc-border bg-wc-surface",
};

const STATUS_LABELS = {
  upcoming: "Upcoming",
  live: "🔴 Live",
  finished: "Full Time",
};

export default function PredictionCard({ match, existingPrediction }) {
  const { user } = useAuth();
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(existingPrediction || null);

  const isLocked =
    match.status === "live" || match.status === "finished";
  const isFinished = match.status === "finished";

  useEffect(() => {
    if (prediction) {
      setHomeScore(String(prediction.predictedHome));
      setAwayScore(String(prediction.predictedAway));
    }
  }, [prediction]);

  // Fetch existing prediction if not passed
  useEffect(() => {
    if (!existingPrediction && user && match.id) {
      const predId = `${user.uid}_${match.id}`;
      getDoc(doc(db, "predictions", predId)).then((snap) => {
        if (snap.exists()) setPrediction(snap.data());
      });
    }
  }, [user, match.id, existingPrediction]);

  const derivedWinner = (h, a) => {
    const hi = parseInt(h, 10);
    const ai = parseInt(a, 10);
    if (isNaN(hi) || isNaN(ai)) return null;
    if (hi > ai) return match.homeTeam;
    if (ai > hi) return match.awayTeam;
    return "draw";
  };

  const predictedWinner = derivedWinner(homeScore, awayScore);

  const handleSave = async () => {
    if (isLocked) return;
    if (homeScore === "" || awayScore === "") {
      setError("Enter both scores.");
      return;
    }
    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("Scores must be non-negative numbers.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const predId = `${user.uid}_${match.id}`;
      const data = {
        userId: user.uid,
        matchId: match.id,
        predictedHome: h,
        predictedAway: a,
        predictedWinner: derivedWinner(h, a),
        pointsEarned: 0,
        resolvedAt: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "predictions", predId), data, { merge: true });
      setPrediction(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Points display for finished matches
  const renderPoints = () => {
    if (!isFinished || !prediction) return null;
    const pts = prediction.pointsEarned ?? 0;
    return (
      <div
        className={`text-center py-1.5 rounded-lg text-sm font-bold tracking-wide ${
          pts >= 6
            ? "bg-wc-gold/15 text-wc-gold"
            : pts >= 1
            ? "bg-green-400/10 text-green-400"
            : "bg-wc-surface text-wc-muted"
        }`}
      >
        {pts >= 6
          ? "🎯 Perfect! +6 pts"
          : pts === 1
          ? "✓ Correct result · +1 pt"
          : "✗ No points"}
      </div>
    );
  };

  const matchDate = match.date
    ? new Date(`${match.date}T${match.kickoff || "00:00"}`)
    : null;

  return (
    <div className="card group relative overflow-hidden transition-all duration-300 hover:border-wc-gold/30">
      {/* Phase badge + status */}
      <div className="flex items-center justify-between mb-4">
        <span className="badge bg-wc-surface text-wc-muted">
          {match.phase || "Group Stage"} · {match.group || ""}
        </span>
        <span
          className={`badge border ${
            STATUS_COLORS[match.status] || STATUS_COLORS.upcoming
          }`}
        >
          {STATUS_LABELS[match.status] || "Upcoming"}
        </span>
      </div>

      {/* Teams row */}
      <div className="flex items-center gap-3 mb-5">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-3xl">{match.homeFlagEmoji || "🏳️"}</span>
          <span className="font-display text-lg uppercase tracking-wider text-center leading-tight">
            {match.homeTeam}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-1 min-w-18[72px]">
          {isFinished &&
          match.finalHome !== undefined &&
          match.finalAway !== undefined ? (
            <div className="font-display text-3xl tracking-wider text-white">
              {match.finalHome}
              <span className="text-wc-muted mx-1">—</span>
              {match.finalAway}
            </div>
          ) : (
            <div className="font-display text-xl text-wc-muted tracking-widest">
              VS
            </div>
          )}
          {matchDate && (
            <span className="text-[11px] text-wc-muted text-center">
              {matchDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}{" "}
              ·{" "}
              {matchDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-3xl">{match.awayFlagEmoji || "🏳️"}</span>
          <span className="font-display text-lg uppercase tracking-wider text-center leading-tight">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Venue */}
      <p className="text-center text-xs text-wc-muted mb-5">
        📍 {match.venue}, {match.city}
      </p>

      {/* Prediction input */}
      {!isLocked ? (
        <div className="space-y-3">
          <p className="text-xs text-wc-muted text-center uppercase tracking-widest">
            Your Prediction
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-wc-muted uppercase tracking-wide">
                {match.homeTeam}
              </span>
              <input
                type="number"
                min="0"
                max="99"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="input text-center text-xl font-display w-16 h-14"
                placeholder="0"
              />
            </div>
            <span className="font-display text-2xl text-wc-muted mt-5">—</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-wc-muted uppercase tracking-wide">
                {match.awayTeam}
              </span>
              <input
                type="number"
                min="0"
                max="99"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="input text-center text-xl font-display w-16 h-14"
                placeholder="0"
              />
            </div>
          </div>

          {predictedWinner && (
            <p className="text-center text-xs text-wc-gold">
              Predicting:{" "}
              <strong>
                {predictedWinner === "draw"
                  ? "Draw"
                  : `${predictedWinner} win`}
              </strong>
            </p>
          )}

          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "btn-gold"
            }`}
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : prediction ? "Update Prediction" : "Save Prediction"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prediction ? (
            <>
              <p className="text-xs text-wc-muted text-center uppercase tracking-widest mb-2">
                Your Prediction
              </p>
              <div className="flex items-center justify-center gap-4 py-3 bg-wc-surface rounded-xl">
                <span className="font-display text-2xl text-white">
                  {prediction.predictedHome}
                </span>
                <span className="text-wc-muted">—</span>
                <span className="font-display text-2xl text-white">
                  {prediction.predictedAway}
                </span>
              </div>
              {renderPoints()}
            </>
          ) : (
            <div className="text-center py-4 text-wc-muted text-sm">
              {isFinished
                ? "No prediction was made for this match."
                : "Predictions are locked — match has started."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}