import { useState } from "react";

const TRAVELERS = [
  { name: "Michael Francese", role: "Dad", icon: "👨" },
  { name: "Meghan Ryan", role: "Mom", icon: "👩" },
  { name: "Kenna Holland", role: "Daughter (12)", icon: "👧" },
  { name: "Louise Francese", role: "Daughter (5)", icon: "👶" },
];

const BOOKINGS = [
  {
    id: "outbound",
    category: "flight",
    label: "Outbound Flight",
    status: "confirmed",
    carrier: "Frontier Airlines",
    detail: "F9 2646 · STL → ATL",
    date: "Fri, Apr 17",
    time: "8:23 PM → 11:09 PM ET",
    duration: "1h 46m · Nonstop",
    confirmation: "SJ4C3A",
    cost: "$175.92",
    paidWith: "Visa ···3174",
    notes: "Personal items only (14×18×8 in). No carry-on or checked bags purchased.",
    alertNotes: [
      "Measure all backpacks against 14\"H × 18\"W × 8\"D before trip",
      "Set alarm 8:23 PM Thu 4/16 for 24-hr check-in (seat assignments)"
    ],
    passengers: "Michael, Meghan, Kenna, Louise",
  },
  {
    id: "return",
    category: "flight",
    label: "Return Flight",
    status: "confirmed",
    carrier: "Southwest Airlines",
    detail: "WN 1395 · ATL → STL",
    date: "Mon, Apr 20",
    time: "8:05 PM → 8:55 PM CT",
    duration: "1h 50m · Nonstop · Basic fare",
    confirmation: "BO8RPW",
    cost: "$679.12",
    paidWith: "30K RR pts + $284.34 Visa ···4879 + $94.78 flight credits",
    notes: "Basic fare includes carry-on + personal item. Preferred seats selected (Row 9). Flight changes require fare upgrade.",
    passengers: "Michael (9E), Meghan (9D), Kenna (9C), Louise (9F)",
  },
  {
    id: "car",
    category: "car",
    label: "Rental Car",
    status: "confirmed",
    carrier: "Enterprise",
    detail: "Standard Car · Subaru Impreza or similar",
    date: "Apr 17–20",
    time: "Pickup 11:00 PM Fri → Return 7:30 PM Mon",
    duration: "3 days",
    confirmation: "H-2100517884COUNT",
    cost: "$217.30",
    paidWith: "21,730 Capital One miles (Venture X ···8314)",
    notes: "ATL Rental Car Center, 2200 Rental Car Cntr Pkwy. Unlimited mileage. Free cancellation. Return car by 5:30–6:00 PM Mon (need buffer for SkyTrain + TSA).",
    alertNotes: [
      "Confirm Enterprise ATL counter open past 11:30 PM Fridays",
      "Return by 5:30 PM despite 7:30 PM reservation — need airport buffer"
    ],
    passengers: "Driver: Michael Francese",
  },
  {
    id: "show",
    category: "show",
    label: "Initiative — Aurora Theatre",
    status: "pending",
    carrier: "Aurora Theatre",
    detail: "World Premiere · by Jacob York",
    date: "Sat, Apr 18",
    time: "8:00 PM ET · ~2 hrs (15 min intermission)",
    duration: "128 E Pike St, Lawrenceville, GA 30046",
    confirmation: "Pending — Galen contacting Aurora",
    cost: "TBD",
    paidWith: "—",
    notes: "3 tickets needed (2 adults, 1 child). Galen York is working with Aurora to exchange existing Friday tickets for Saturday. Content advisory: adult language, themes of loss and grief.",
    passengers: "Michael, Meghan, Kenna",
  },
];

const TIMELINE = [
  {
    day: "Friday, April 17",
    subtitle: "Travel Day",
    events: [
      { time: "1:00 PM CT", label: "Kenna returns to school from camp", type: "milestone" },
      { time: "1:15 PM", label: "Michael picks up Kenna", type: "action" },
      { time: "~2:00 PM", label: "Uber to STL — all 4 meet at airport", type: "action" },
      { time: "8:23 PM", label: "✈ Frontier F9 2646 departs STL", type: "flight" },
      { time: "11:09 PM ET", label: "Land ATL", type: "flight" },
      { time: "~11:30 PM", label: "SkyTrain to Rental Car Center → pick up Enterprise", type: "action" },
      { time: "~12:00 AM", label: "Drive to Decatur (~20 min) → arrive Jacob & Galen's", type: "arrive" },
    ],
  },
  {
    day: "Saturday, April 18",
    subtitle: "Show Day",
    events: [
      { time: "Morning", label: "Breakfast with Wiley & Laura", type: "social" },
      { time: "Daytime", label: "Relax at Jacob & Galen's / explore Decatur", type: "free" },
      { time: "~6:15 PM", label: "Leave Decatur → Lawrenceville (~30 min)", type: "action" },
      { time: "7:00 PM", label: "Arrive Lawrenceville · dinner near Aurora Theatre", type: "action" },
      { time: "8:00 PM", label: "🎭 Initiative — Curtain", type: "show" },
      { time: "~10:00 PM", label: "Show ends · drive back to Decatur", type: "action" },
    ],
  },
  {
    day: "Sunday, April 19",
    subtitle: "Free Day",
    events: [
      { time: "All day", label: "Full day with the Yorks in Decatur", type: "free" },
      { time: "Ideas", label: "Fernbank Museum · Stone Mountain · Ponce City Market", type: "free" },
    ],
  },
  {
    day: "Monday, April 20",
    subtitle: "Travel Home",
    events: [
      { time: "Daytime", label: "Hang with Jacob, Galen & kids", type: "free" },
      { time: "~5:30 PM ET", label: "Return rental car at ATL", type: "action" },
      { time: "~6:00 PM", label: "SkyTrain to terminal · through TSA", type: "action" },
      { time: "8:05 PM", label: "✈ Southwest WN 1395 departs ATL", type: "flight" },
      { time: "8:55 PM CT", label: "Land STL · Uber home", type: "arrive" },
    ],
  },
];

const CHECKLIST = [
  { id: 1, text: "Measure all 4 backpacks: 14\"H × 18\"W × 8\"D max (Frontier)", done: false, urgent: true },
  { id: 2, text: "Confirm Enterprise ATL counter hours (open past 11:30 PM Fri?)", done: false, urgent: true },
  { id: 3, text: "Show tickets — follow up with Galen on Aurora exchange", done: false, urgent: true },
  { id: 4, text: "Confirm Kenna's camp return time (1 PM Fri) is firm", done: false, urgent: false },
  { id: 5, text: "Pack BubbleBum inflatable booster for Louise", done: false, urgent: false },
  { id: 6, text: "Set alarm: 8:23 PM Thu 4/16 — Frontier 24-hr check-in", done: false, urgent: false },
  { id: 7, text: "Coordinate with Wiley & Laura — Sat breakfast plans", done: false, urgent: false },
  { id: 8, text: "Discuss Louise plan with Galen for during Sat show", done: false, urgent: false },
];

const COSTS = [
  { item: "Frontier outbound (4 pax)", amount: "$175.92", method: "Visa ···3174" },
  { item: "Southwest return (4 pax)", amount: "$679.12", method: "30K pts + $284.34 cash + $94.78 credits" },
  { item: "Enterprise rental (3 days)", amount: "$217.30", method: "21,730 Capital One miles" },
  { item: "Uber to STL (Fri)", amount: "~$35", method: "—" },
  { item: "Uber from STL (Mon)", amount: "~$35", method: "—" },
  { item: "Gas in Atlanta", amount: "~$20", method: "—" },
  { item: "Show tickets (3)", amount: "TBD", method: "—" },
  { item: "Meals (Fri–Mon)", amount: "~$200", method: "—" },
];

const typeColors = {
  flight: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  action: { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" },
  milestone: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  social: { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  free: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  show: { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  arrive: { bg: "#d1fae5", text: "#065f46", dot: "#059669" },
};

const statusStyles = {
  confirmed: { bg: "#059669", label: "Confirmed" },
  pending: { bg: "#d97706", label: "Pending" },
};

function Badge({ status }) {
  const s = statusStyles[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, background: s.bg, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function BookingCard({ booking, isOpen, toggle }) {
  const catIcons = { flight: "✈️", car: "🚗", show: "🎭" };
  return (
    <div onClick={toggle} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 10, cursor: "pointer", border: isOpen ? "2px solid #2563eb" : "1.5px solid #e5e7eb", transition: "all 0.15s", boxShadow: isOpen ? "0 4px 24px rgba(37,99,235,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, marginTop: 2 }}>{catIcons[booking.category]}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{booking.label}</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{booking.carrier} · {booking.date}</div>
            <div style={{ color: "#374151", fontSize: 13, marginTop: 1 }}>{booking.time}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Badge status={booking.status} />
          <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>{booking.confirmation}</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: 13 }}>
            <div><span style={{ color: "#9ca3af" }}>Detail</span><div style={{ color: "#111827", marginTop: 2 }}>{booking.detail}</div></div>
            <div><span style={{ color: "#9ca3af" }}>Duration</span><div style={{ color: "#111827", marginTop: 2 }}>{booking.duration}</div></div>
            <div><span style={{ color: "#9ca3af" }}>Cost</span><div style={{ color: "#111827", fontWeight: 600, marginTop: 2 }}>{booking.cost}</div></div>
            <div><span style={{ color: "#9ca3af" }}>Paid with</span><div style={{ color: "#111827", marginTop: 2 }}>{booking.paidWith}</div></div>
            <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#9ca3af" }}>Passengers</span><div style={{ color: "#111827", marginTop: 2 }}>{booking.passengers}</div></div>
          </div>
          {booking.notes && <div style={{ marginTop: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{booking.notes}</div>}
          {booking.alertNotes && booking.alertNotes.map((n, i) => (
            <div key={i} style={{ marginTop: 8, padding: "8px 14px", background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>⚠️ {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [openBooking, setOpenBooking] = useState(null);
  const [checks, setChecks] = useState(CHECKLIST);

  const toggleCheck = (id) => setChecks(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  const doneCount = checks.filter(c => c.done).length;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "bookings", label: "Bookings" },
    { key: "timeline", label: "Timeline" },
    { key: "budget", label: "Budget" },
    { key: "checklist", label: `Checklist (${doneCount}/${checks.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🎭</span>
            <div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Atlanta — Initiative</h1>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 3, fontWeight: 400 }}>April 17–20, 2026 · Staying with Jacob & Galen York, Decatur</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
            {TRAVELERS.map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, padding: "4px 12px 4px 6px" }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 500 }}>{t.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "rgba(15,23,42,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 0, padding: "0 24px", overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ background: "none", border: "none", padding: "12px 16px", color: activeTab === t.key ? "#60a5fa" : "#64748b", fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, cursor: "pointer", borderBottom: activeTab === t.key ? "2px solid #60a5fa" : "2px solid transparent", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 40px" }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {BOOKINGS.map((b) => {
                const icons = { flight: "✈️", car: "🚗", show: "🎭" };
                return (
                  <div key={b.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{icons[b.category]}</span>
                      <Badge status={b.status} />
                    </div>
                    <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{b.label}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{b.date} · {b.time.split("→")[0].trim()}</div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 4, fontFamily: "monospace" }}>{b.confirmation}</div>
                  </div>
                );
              })}
            </div>

            {/* Key Alerts */}
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>⚠️ Key Alerts</div>
              <div style={{ color: "#fde68a", fontSize: 13, lineHeight: 1.8 }}>
                <div>• Measure backpacks NOW — Frontier enforces 14×18×8" at the gate ($99/bag if oversized)</div>
                <div>• Return rental car by 5:30 PM Mon — need 2+ hrs for SkyTrain + TSA before 8:05 PM flight</div>
                <div>• Show tickets still pending — Galen coordinating with Aurora Theatre</div>
              </div>
            </div>

            {/* Quick Numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#60a5fa", fontSize: 22, fontWeight: 800 }}>$855</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>Booked (cash)</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#a78bfa", fontSize: 22, fontWeight: 800 }}>52K</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>Points/miles used</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#34d399", fontSize: 22, fontWeight: 800 }}>3</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>Nights in Decatur</div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div>
            {BOOKINGS.map((b) => (
              <BookingCard key={b.id} booking={b} isOpen={openBooking === b.id} toggle={() => setOpenBooking(openBooking === b.id ? null : b.id)} />
            ))}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === "timeline" && (
          <div>
            {TIMELINE.map((day, di) => (
              <div key={di} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                  <h3 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, margin: 0 }}>{day.day}</h3>
                  <span style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>{day.subtitle}</span>
                </div>
                <div style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", marginLeft: 8, paddingLeft: 20 }}>
                  {day.events.map((ev, ei) => {
                    const tc = typeColors[ev.type] || typeColors.action;
                    return (
                      <div key={ei} style={{ display: "flex", gap: 12, marginBottom: 10, position: "relative" }}>
                        <div style={{ position: "absolute", left: -26, top: 6, width: 10, height: 10, borderRadius: 99, background: tc.dot, border: "2px solid #1e293b" }} />
                        <div style={{ minWidth: 80, color: "#64748b", fontSize: 12, fontWeight: 500, paddingTop: 3, flexShrink: 0 }}>{ev.time}</div>
                        <div style={{ background: tc.bg, color: tc.text, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{ev.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUDGET */}
        {activeTab === "budget" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
              {COSTS.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: i < COSTS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{c.item}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{c.method}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.amount === "TBD" ? "#d97706" : "#111827", fontFamily: "monospace" }}>{c.amount}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)", borderRadius: 12, padding: 20, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Estimated Total</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Excluding show tickets</div>
              </div>
              <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>~$1,362</div>
            </div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
              Cash out-of-pocket: ~$855 · Points/miles: 30K SW + 21.7K CapOne · Credits: $94.78
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === "checklist" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>{doneCount} of {checks.length} complete</div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6, width: 120, overflow: "hidden" }}>
                <div style={{ background: "#34d399", height: "100%", width: `${(doneCount / checks.length) * 100}%`, borderRadius: 99, transition: "width 0.3s" }} />
              </div>
            </div>
            {checks.map((c) => (
              <div key={c.id} onClick={() => toggleCheck(c.id)} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", marginBottom: 6, borderRadius: 10, background: c.done ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)", border: c.urgent && !c.done ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: c.done ? "none" : "2px solid #475569", background: c.done ? "#059669" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                  {c.done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ color: c.done ? "#64748b" : "#e2e8f0", fontSize: 14, fontWeight: 500, textDecoration: c.done ? "line-through" : "none", lineHeight: 1.5, transition: "all 0.15s" }}>
                  {c.urgent && !c.done && <span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, marginRight: 6 }}>URGENT</span>}
                  {c.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
