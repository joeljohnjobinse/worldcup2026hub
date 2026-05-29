import { useRef, useState } from "react";
import html2canvas from "html2canvas";

// Team flag emoji map — extend as needed
const FLAG_MAP = {
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  France: "🇫🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Italy: "🇮🇹",
  Japan: "🇯🇵",
  Australia: "🇦🇺",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Croatia: "🇭🇷",
  Switzerland: "🇨🇭",
  Denmark: "🇩🇰",
  Poland: "🇵🇱",
  Serbia: "🇷🇸",
  Iran: "🇮🇷",
  "South Korea": "🇰🇷",
  Ecuador: "🇪🇨",
  Cameroon: "🇨🇲",
  Ghana: "🇬🇭",
  Nigeria: "🇳🇬",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
  Tunisia: "🇹🇳",
  "Costa Rica": "🇨🇷",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Ukraine: "🇺🇦",
  Turkey: "🇹🇷",
  Austria: "🇦🇹",
  "Czech Republic": "🇨🇿",
  Hungary: "🇭🇺",
  Slovakia: "🇸🇰",
  Romania: "🇷🇴",
  Greece: "🇬🇷",
  Peru: "🇵🇪",
  Chile: "🇨🇱",
  Bolivia: "🇧🇴",
  Paraguay: "🇵🇾",
  Venezuela: "🇻🇪",
  Panama: "🇵🇦",
  Honduras: "🇭🇳",
  Jamaica: "🇯🇲",
  "New Zealand": "🇳🇿",
  Indonesia: "🇮🇩",
  "Ivory Coast": "🇨🇮",
  Algeria: "🇩🇿",
  Egypt: "🇪🇬",
  Mali: "🇲🇱",
  "South Africa": "🇿🇦",
  Angola: "🇦🇴",
  Tanzania: "🇹🇿",
  Congo: "🇨🇩",
  TBD: "🏳️",
};

const getFlag = (team) => FLAG_MAP[team] || "🏳️";

const VENUE_CITIES = {
  "SoFi Stadium": "Los Angeles, CA",
  "MetLife Stadium": "East Rutherford, NJ",
  "AT&T Stadium": "Arlington, TX",
  "Levi's Stadium": "Santa Clara, CA",
  "Hard Rock Stadium": "Miami, FL",
  "Mercedes-Benz Stadium": "Atlanta, GA",
  "Arrowhead Stadium": "Kansas City, MO",
  "Gillette Stadium": "Boston, MA",
  "Lincoln Financial Field": "Philadelphia, PA",
  "BC Place": "Vancouver, Canada",
  "BMO Field": "Toronto, Canada",
  "Estadio Azteca": "Mexico City, Mexico",
  "Estadio BBVA": "Monterrey, Mexico",
  "Estadio Akron": "Guadalajara, Mexico",
};

// The actual ticket visual — extracted so html2canvas can target it cleanly
function TicketVisual({ match, ticketRef }) {
  const homeFlag = match.homeFlagEmoji || getFlag(match.homeTeam);
  const awayFlag = match.awayFlagEmoji || getFlag(match.awayTeam);
  const city = VENUE_CITIES[match.venue] || match.city || "";

  const matchDate = match.date
    ? new Date(`${match.date}T${match.kickoff || "00:00"}`)
    : null;

  const formattedDate = matchDate
    ? matchDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : match.date || "TBD";

  const formattedTime = matchDate
    ? matchDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : match.kickoff || "TBD";

  const matchNumber = match.matchNumber || match.id?.replace(/\D/g, "") || "—";

  return (
    <div
      ref={ticketRef}
      style={{
        width: "680px",
        background: "linear-gradient(135deg, #0A0A1A 0%, #0D1525 50%, #0A0A1A 100%)",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 0 0 2px rgba(197,160,50,0.4), 0 30px 80px rgba(0,0,0,0.8)",
        position: "relative",
      }}
    >
      {/* Gold top accent */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #C5A032, #F0D060, #C5A032)",
        }}
      />

      {/* Header: WC branding */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px 14px",
          borderBottom: "1px solid rgba(197,160,50,0.2)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "4px",
              color: "#C5A032",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            FIFA
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: "2px",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            World Cup
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#C5A032",
              letterSpacing: "1px",
              lineHeight: 1,
            }}
          >
            2026™
          </div>
        </div>

        {/* WC logo placeholder — soccer ball icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a2a4a, #0d1525)",
            border: "2px solid rgba(197,160,50,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
          }}
        >
          ⚽
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "3px",
              color: "#8090B0",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Match
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            {String(matchNumber).padStart(3, "0")}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#C5A032",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {match.phase || "Group Stage"}
            {match.group ? ` · ${match.group}` : ""}
          </div>
        </div>
      </div>

      {/* Main match section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 28px",
          gap: "16px",
        }}
      >
        {/* Home team */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "64px", lineHeight: 1 }}>{homeFlag}</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            {match.homeTeam}
          </div>
        </div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            minWidth: "80px",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "linear-gradient(to bottom, transparent, rgba(197,160,50,0.5))",
            }}
          />
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#C5A032",
              letterSpacing: "4px",
            }}
          >
            VS
          </div>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "linear-gradient(to bottom, rgba(197,160,50,0.5), transparent)",
            }}
          />
        </div>

        {/* Away team */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "64px", lineHeight: 1 }}>{awayFlag}</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            {match.awayTeam}
          </div>
        </div>
      </div>

      {/* Perforated divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          marginBottom: "0px",
          position: "relative",
        }}
      >
        {/* Left notch */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "#0A0A0F",
            flexShrink: 0,
            marginLeft: "-30px",
          }}
        />
        {/* Dashed line */}
        <div
          style={{
            flex: 1,
            borderTop: "2px dashed rgba(197,160,50,0.25)",
            margin: "0 8px",
          }}
        />
        {/* Right notch */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "#0A0A0F",
            flexShrink: 0,
            marginRight: "-30px",
          }}
        />
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0",
          padding: "20px 28px",
          borderTop: "1px solid rgba(197,160,50,0.1)",
        }}
      >
        {[
          { label: "Date", value: formattedDate },
          { label: "Kick-off", value: formattedTime },
          { label: "Venue", value: match.venue || "TBD" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "0 10px",
              borderRight: "1px solid rgba(197,160,50,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                color: "#C5A032",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#E8E8F0",
                lineHeight: 1.3,
              }}
            >
              {value}
            </div>
            {label === "Venue" && city && (
              <div style={{ fontSize: "11px", color: "#8090B0" }}>{city}</div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          background: "rgba(197,160,50,0.06)",
          borderTop: "1px solid rgba(197,160,50,0.15)",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#506080",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          USA · Canada · Mexico
        </div>
        {/* Barcode-style decoration */}
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {[3, 1, 4, 2, 5, 1, 3, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1].map(
            (h, i) => (
              <div
                key={i}
                style={{
                  width: i % 3 === 0 ? "3px" : "1.5px",
                  height: `${h * 5}px`,
                  background: i % 5 === 0 ? "#C5A032" : "#3a4a6a",
                  borderRadius: "1px",
                }}
              />
            )
          )}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#506080",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          WC2026 · HUB
        </div>
      </div>

      {/* Bottom gold accent */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #C5A032, #F0D060, #C5A032)",
        }}
      />
    </div>
  );
}

export default function TicketTemplate({ match }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `WC2026_${(match.homeTeam || "Home").replace(/\s/g, "")}_vs_${(match.awayTeam || "Away").replace(/\s/g, "")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Ticket download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  if (!match) {
    return (
      <div className="card text-center text-wc-muted py-12">
        Select a match to generate its ticket.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticket preview — horizontally scrollable on small screens */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="inline-block">
          <TicketVisual match={match} ticketRef={ticketRef} />
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-gold flex items-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Download Ticket (PNG)
            </>
          )}
        </button>
      </div>
    </div>
  );
}