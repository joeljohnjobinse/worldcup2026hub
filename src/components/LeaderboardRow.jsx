const RANK_STYLES = {
  1: {
    container: "border-wc-gold/50 bg-gradient-to-r from-wc-gold/10 to-transparent",
    rank: "bg-wc-gold text-black",
    trophy: "🥇",
  },
  2: {
    container: "border-[#C0C0C0]/40 bg-gradient-to-r from-[#C0C0C0]/8 to-transparent",
    rank: "bg-[#C0C0C0] text-black",
    trophy: "🥈",
  },
  3: {
    container: "border-[#CD7F32]/40 bg-gradient-to-r from-[#CD7F32]/8 to-transparent",
    rank: "bg-[#CD7F32] text-black",
    trophy: "🥉",
  },
};

export default function LeaderboardRow({ entry, rank, isCurrentUser }) {
  const style = RANK_STYLES[rank] || null;

  const exactScoreRate =
    entry.totalPredictions > 0
      ? Math.round((entry.exactScores / entry.totalPredictions) * 100)
      : 0;

  const correctResultRate =
    entry.totalPredictions > 0
      ? Math.round((entry.correctResults / entry.totalPredictions) * 100)
      : 0;

  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200
        ${style
          ? style.container
          : isCurrentUser
          ? "border-wc-gold/20 bg-wc-gold/5"
          : "border-wc-border bg-wc-card hover:border-wc-border/80"
        }
      `}
    >
      {/* Rank */}
      <div className="w-10 shrink-0 flex justify-center">
        {style ? (
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${style.rank}`}
          >
            {rank}
          </span>
        ) : (
          <span className="text-wc-muted font-display text-lg w-8 text-center">
            {rank}
          </span>
        )}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            isCurrentUser
              ? "bg-wc-gold/20 text-wc-gold ring-2 ring-wc-gold/40"
              : "bg-wc-surface text-wc-light"
          }`}
        >
          {entry.avatar ? (
            <img
              src={entry.avatar}
              alt={entry.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            entry.displayName?.[0]?.toUpperCase() || "?"
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-sm truncate ${
                isCurrentUser ? "text-wc-gold" : "text-wc-light"
              }`}
            >
              {entry.displayName}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] text-wc-gold/70 bg-wc-gold/10 px-1.5 py-0.5 rounded-full shrink-0">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-wc-muted">
              {entry.totalPredictions ?? 0} picks
            </span>
            {entry.exactScores > 0 && (
              <span className="text-[11px] text-wc-gold/70">
                🎯 {entry.exactScores} exact
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats — hidden on mobile, visible on sm+ */}
      <div className="hidden sm:flex items-center gap-6 shrink-0">
        <div className="text-center">
          <div className="text-xs text-wc-muted mb-0.5">Result %</div>
          <div className="text-sm font-semibold text-wc-light">
            {correctResultRate}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-wc-muted mb-0.5">Score %</div>
          <div className="text-sm font-semibold text-wc-gold">
            {exactScoreRate}%
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="shrink-0 text-right">
        <div
          className={`font-display text-2xl leading-none ${
            style
              ? rank === 1
                ? "text-wc-gold"
                : rank === 2
                ? "text-[#C0C0C0]"
                : "text-[#CD7F32]"
              : isCurrentUser
              ? "text-wc-gold"
              : "text-wc-light"
          }`}
        >
          {entry.totalPoints ?? 0}
        </div>
        <div className="text-[11px] text-wc-muted mt-0.5">pts</div>
      </div>
    </div>
  );
}