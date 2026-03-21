import { useState } from "react";

const BOOKED = "booked";
const MISSING = "missing";
const ACTION = "action";

const StatusBadge = ({ status, label }) => {
  const s = {
    [BOOKED]: { bg: "#1a3a2a", border: "#2d6b45", color: "#5ce892", icon: "✓" },
    [MISSING]: { bg: "#3a1a1a", border: "#6b2d2d", color: "#e85c5c", icon: "!" },
    [ACTION]: { bg: "#3a2e1a", border: "#6b5a2d", color: "#e8c55c", icon: "⚑" },
  }[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.3 }}>
      <span style={{ fontSize: 10 }}>{s.icon}</span> {label}
    </span>
  );
};

const SectionHeader = ({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 32, borderBottom: "1px solid #2a2a3a", paddingBottom: 8 }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8e4df", margin: 0, letterSpacing: 0.5 }}>{children}</h2>
  </div>
);

const DetailSection = ({ icon, title, children, color = "#4a90d9" }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'Playfair Display', serif", letterSpacing: 0.3 }}>{title}</span>
    </div>
    <div style={{ paddingLeft: 22 }}>{children}</div>
  </div>
);

const Bullet = ({ children, color = "#8a8aaa", icon = "›" }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
    <span style={{ color, fontSize: 13, lineHeight: 1.5, flexShrink: 0, fontWeight: 700 }}>{icon}</span>
    <span style={{ fontSize: 12, color: "#c8c4bf", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{children}</span>
  </div>
);

const WarnBullet = ({ children }) => <Bullet icon="⚠" color="#e8c55c">{children}</Bullet>;
const TipBullet = ({ children }) => <Bullet icon="💡" color="#5ce892">{children}</Bullet>;
const InfoBullet = ({ children }) => <Bullet icon="→" color="#4a90d9">{children}</Bullet>;

const DayCard = ({ day, dayNum, title, items, expanded, onToggle, hasDetail }) => (
  <div style={{ background: "#141420", border: expanded ? "1px solid #2a2a4a" : "1px solid #1e1e30", borderRadius: 8, marginBottom: 10, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
    <div
      onClick={hasDetail ? onToggle : undefined}
      style={{ padding: 16, cursor: hasDetail ? "pointer" : "default", transition: "background 0.15s", userSelect: "none" }}
      onMouseEnter={e => { if (hasDetail) e.currentTarget.style.background = "#181830"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ minWidth: 52, textAlign: "center", background: expanded ? "#12122a" : "#0d0d18", borderRadius: 6, padding: "6px 4px", border: "1px solid #1e1e30", transition: "background 0.2s" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#6a6a8a", textTransform: "uppercase" }}>{day}</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e8e4df", fontWeight: 700 }}>{dayNum}</div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#4a4a6a" }}>JUN</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#e8e4df" }}>{title}</div>
            {hasDetail && (
              <span style={{ fontSize: 11, color: expanded ? "#4a90d9" : "#3a3a5a", fontFamily: "monospace", transition: "all 0.25s ease", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}>▶</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: item.time ? "#8a8aaa" : "transparent", minWidth: 48, flexShrink: 0 }}>{item.time || "—"}</span>
                <span style={{ fontSize: 12.5, color: "#c8c4bf", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{item.text}</span>
                {item.status && <StatusBadge status={item.status} label={item.statusLabel} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {expanded && hasDetail && (
      <div style={{ borderTop: "1px solid #1e1e30", padding: "16px 16px 8px", background: "linear-gradient(180deg, #0e0e1e 0%, #0d0d18 100%)" }}>
        {hasDetail}
      </div>
    )}
  </div>
);

const InfoRow = ({ label, value, mono, status }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1a1a2a", flexWrap: "wrap", gap: 4 }}>
    <span style={{ fontSize: 12, color: "#6a6a8a", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    <span style={{ fontSize: 12, color: mono ? "#4a90d9" : "#e8e4df", fontFamily: mono ? "monospace" : "'DM Sans', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
      {value}
      {status && <StatusBadge status={status.type} label={status.label} />}
    </span>
  </div>
);

/* ── Expanded Detail Content per Day ── */

const Day7Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before" color="#b88ad9">
      <InfoBullet>Final packing check: passports for all 4 (including Louise, age 5)</InfoBullet>
      <InfoBullet>Charge all devices, download offline entertainment for overnight flight</InfoBullet>
      <InfoBullet>Pack carry-on essentials: snacks, change of clothes, toothbrush — you land midday and go straight to the hotel</InfoBullet>
      <InfoBullet>Light dinner before heading to airport. Aim to arrive STL by 7:30 PM (2.5 hrs before)</InfoBullet>
      <InfoBullet>Kids' iPads loaded + headphones packed for 8-hr overnight flight</InfoBullet>
    </DetailSection>
    <DetailSection icon="💺" title="⏰ SEAT STRATEGY — $0 cost" color="#d94a8a">
      <WarnBullet><strong>SET ALARM: Jun 6 at 9:55 PM CDT.</strong> BA online check-in opens at exactly 10:00 PM CDT (24 hrs before 10 PM Jun 7 departure). This is your FREE seat selection window!</WarnBullet>
      <InfoBullet>Both Michael and Meghan: log in simultaneously on separate devices at ba.com → Manage My Booking → YUAD5K. Select seats for all 4 passengers the instant they appear</InfoBullet>
      <InfoBullet>Target a row of 3 (A-B-C or H-J-K) for Michael+Kenna+Louise, with Meghan in the middle section same row (D-E-F). Or grab any 4 adjacent seats</InfoBullet>
      <TipBullet>If free seats don't put you together, DO NOT PAY. At the airport check-in desk, say: "We have a 5-year-old who needs to be seated next to a parent." UK CAA guidance requires airlines to seat children under 12 with an accompanying adult at no charge. Gate agents handle this daily</TipBullet>
      <TipBullet>Check back at 12 hrs, 6 hrs, and 2 hrs before departure — seats shuffle as others check in, cancel, or upgrade</TipBullet>
    </DetailSection>
    <DetailSection icon="✈️" title="Flight Details" color="#4a90d9">
      <InfoBullet>BA220 · STL → LHR · Departs 22:00, arrives 12:05+1 · Terminal 5</InfoBullet>
      <InfoBullet>World Traveller (economy). Booking ref: YUAD5K</InfoBullet>
      <InfoBullet>Paid with 260,000 Avios + $1,083.86 in taxes/fees</InfoBullet>
      <InfoBullet>Flight is ~8 hours. Meal service included. Try to sleep — you land midday and need to power through Day 1</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>UK ETA required for all 4 passengers — must be approved BEFORE boarding. Apply well in advance!</WarnBullet>
      <WarnBullet>BA Advance Passenger Info must be completed on ba.com → Manage My Booking → YUAD5K</WarnBullet>
      <WarnBullet>Overnight flight with a 5-year-old: bring comfort items, tablet loaded with shows, noise-canceling if possible</WarnBullet>
    </DetailSection>
  </>
);

const Day8Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare (on the plane)" color="#b88ad9">
      <InfoBullet>Have UK ETA confirmation accessible on phone for each passenger</InfoBullet>
      <InfoBullet>Brush teeth, wash face before landing — you'll want to feel somewhat fresh</InfoBullet>
      <InfoBullet>Have hotel address ready: Travelodge London Kings Cross Royal Scot</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Immigration at T5 — can take 30-60 min. E-gates may work for US adults with ETA; kids under 12 use staffed desks</InfoBullet>
      <InfoBullet>Heathrow Express: Pre-booked (ref 69d52862). Platform in T5 basement level. 15 min to Paddington</InfoBullet>
      <InfoBullet>Paddington → Kings Cross: Hammersmith & City or Circle line → Kings Cross St Pancras (~20 min). Use contactless payment</InfoBullet>
      <InfoBullet>Travelodge: Early check-in available from noon! Walk from Kings Cross station ~5 min</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>Jet lag will hit HARD, especially Louise. Power through until 7-8 PM local time to reset body clocks</WarnBullet>
      <WarnBullet>Don't over-plan Day 1. Coal Drops Yard is a 5-min walk — perfect low-key exploring</WarnBullet>
      <WarnBullet>Contactless payment works everywhere in London (Tube, buses, shops). No cash needed</WarnBullet>
      <WarnBullet>Louise might crash mid-afternoon. Have a stroller or be ready for a hotel nap break</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>Travelodge WiFi code: TVLRTFRPK. Breakfast included all 5 mornings</TipBullet>
      <TipBullet>Coal Drops Yard has great kid-friendly restaurants (Pizza Pilgrims, Barrafina)</TipBullet>
      <TipBullet>St Pancras station next door has beautiful architecture — worth a peek even on arrival day</TipBullet>
      <TipBullet><strong>Kenna Oyster card:</strong> Buy at Paddington or Kings Cross Tube station (£7). Ask staff to add Young Visitor discount (50% off, 14 days). Kenna must be present. Louise rides free everywhere as under-11</TipBullet>
      <TipBullet><strong>Adults + transport:</strong> Apple Pay on your iPhones works on all London transport (Tube, buses, Thames Clipper). Just tap at the yellow readers. Auto-caps at daily rate. No Oyster card needed for adults</TipBullet>
    </DetailSection>
  </>
);

const Day9Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before" color="#b88ad9">
      <InfoBullet>First breakfast at Travelodge — check time/location at front desk</InfoBullet>
      <InfoBullet>Save London Eye e-ticket on phone (Order #601617735). Screenshot as backup</InfoBullet>
      <InfoBullet>Check weather — this is a heavily outdoor day (Westminster, parks, river)</InfoBullet>
      <InfoBullet>Pack layers, rain jackets, comfy walking shoes — BIG walking day</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Travelodge → Westminster: Tube from Kings Cross (Northern or Victoria line). ~15 min</InfoBullet>
      <InfoBullet>Thames Clipper: Buy tickets at pier (Oyster/contactless works). Runs every 20 min</InfoBullet>
      <InfoBullet>All walking between Westminster, St James's Park, Buckingham Palace, and South Bank is doable (~25 min stretches)</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>London Eye at 1:00 PM is a FIXED time. Work backwards from this — don't linger at Buckingham Palace</WarnBullet>
      <WarnBullet>Changing of the Guard only happens certain days — check online. Huge crowds if it's on</WarnBullet>
      <WarnBullet>South Bank can be overwhelming with 2 kids. Pick a focused stretch near London Eye rather than walking end to end</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>St James's Park playground is excellent for Louise — perfect mid-morning energy burn</TipBullet>
      <TipBullet>Southbank Centre Food Market (Fri-Sun) has great diverse food at reasonable prices</TipBullet>
      <TipBullet>Thames Clipper is both transport AND sightseeing — great for tired legs after the Eye</TipBullet>
    </DetailSection>
  </>
);

const Day10Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before" color="#b88ad9">
      <InfoBullet>Download Matilda e-tickets to phone. Ref: 26042Q-6YAMRCW8CJ</InfoBullet>
      <InfoBullet>Cambridge Theatre, Seven Dials (Covent Garden area). Dress Circle Row A, Seats 23-26</InfoBullet>
      <InfoBullet>Book V&A Fashion Tour if not done yet (vam.ac.uk, 12:30 PM slot)</InfoBullet>
      <InfoBullet>Plan the tight transfer: V&A → Matilda has only a 25 min buffer</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Kings Cross → Covent Garden: Piccadilly line, ~10 min</InfoBullet>
      <InfoBullet>Covent Garden → V&A (South Kensington): Piccadilly line, ~10 min</InfoBullet>
      <InfoBullet>V&A → Cambridge Theatre: Tube South Ken → Leicester Square (Piccadilly, ~12 min) + 5 min walk</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>⏱ TIGHT TRANSFER: V&A tour ends ~1:15 PM. Matilda curtain is 2:00 PM sharp. Only ~45 min door-to-door with Tube. If tour runs over, you're sprinting</WarnBullet>
      <WarnBullet>Contingency: If running late, skip Tube and taxi V&A → Cambridge Theatre (~15 min, ~£12)</WarnBullet>
      <WarnBullet>Alternative: Drop V&A tour entirely. Museum is free to explore casually instead — zero stress</WarnBullet>
      <WarnBullet>Matilda is 2 hrs 40 min. Louise (age 5) needs to sit through the whole show — bring a quiet snack</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>Covent Garden street performers are free and kids love them — perfect morning entertainment</TipBullet>
      <TipBullet>Dress Circle Row A is phenomenal — front of the upper level with full unobstructed stage view</TipBullet>
      <TipBullet>Post-show: you're in Seven Dials/Covent Garden. Chinatown is a 5-min walk for dinner</TipBullet>
    </DetailSection>
  </>
);

const Day11Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before" color="#b88ad9">
      <InfoBullet>Flex day — no fixed bookings! Sleep in if jet lag is still lingering</InfoBullet>
      <InfoBullet>British Museum is free, no timed entry needed. Opens 10 AM</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Kings Cross → British Museum: 20 min walk through Bloomsbury, or Tube 1 stop to Russell Square</InfoBullet>
      <InfoBullet>British Museum → Regent's Park: 15 min walk north</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>British Museum is ENORMOUS. Don't try to see everything. Pick 2-3 highlights: Egyptian mummies, Rosetta Stone, Greek marbles</WarnBullet>
      <WarnBullet>Museum fatigue is real with kids. 2 hours max, then get outside to Regent's Park</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>Regent's Park has fantastic playgrounds and pedal boats on the boating lake</TipBullet>
      <TipBullet>This is your buffer/recovery day. If something from earlier was missed, today is the makeup day</TipBullet>
      <TipBullet>Close to hotel — easy to pop back for an afternoon rest if Louise needs it</TipBullet>
    </DetailSection>
  </>
);

const Day12Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before" color="#b88ad9">
      <InfoBullet>Confirm Natural History Museum timed entry (nhm.ac.uk)</InfoBullet>
      <InfoBullet>Confirm Sky Garden booking if secured (booked May 25)</InfoBullet>
      <InfoBullet>⚠️ SET ALARM FOR 5:15 AM TOMORROW! Pack bags for Paris TONIGHT</InfoBullet>
      <InfoBullet>Print/save Eurostar tickets. Ref: QRXPZK. Check-in opens 45 min before departure</InfoBullet>
      <InfoBullet>Lay out tomorrow's clothes. Bags by the door. Everyone in bed by 9 PM</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Split day: Decide morning meeting point for Michael+Louise and Meghan+Kenna</InfoBullet>
      <InfoBullet>NHM: Tube to South Kensington (Piccadilly line, ~15 min from Kings Cross)</InfoBullet>
      <InfoBullet>Tate Modern: Tube to Southwark or St Paul's + walk across Millennium Bridge</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>CRITICAL: Pack for Paris tonight. You will NOT have time tomorrow morning — Eurostar departs 6:31 AM</WarnBullet>
      <WarnBullet>Eurostar API must be completed for Kenna and Louise before departure. Do this NOW if not done</WarnBullet>
      <WarnBullet>Early dinner tonight. Everyone in bed by 9 PM — tomorrow is brutal</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>NHM dinosaur gallery is the highlight for Louise. Blue whale in Hintze Hall is jaw-dropping</TipBullet>
      <TipBullet>Tate Modern is free. Kenna (12) may enjoy the immersive installations on upper floors</TipBullet>
      <TipBullet>Sky Garden is free — 360° views from the 35th floor of the Walkie Talkie building</TipBullet>
    </DetailSection>
  </>
);

const Day13Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before (Jun 12)" color="#b88ad9">
      <InfoBullet>Bags packed by door. Alarm 5:15 AM. Clothes laid out</InfoBullet>
      <InfoBullet>Eurostar tickets on phone. Ref: QRXPZK. Train 9002, Coach 10, Seats 18/17/13/14</InfoBullet>
      <InfoBullet>Travelodge is 5-min walk to St Pancras — leave hotel by 5:30 AM latest</InfoBullet>
      <InfoBullet>No hotel breakfast (too early). Grab pastries at St Pancras or eat on Eurostar</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements — 4 Legs Today" color="#4a90d9">
      <InfoBullet><strong>Leg 1:</strong> Walk to St Pancras (5 min). Check-in opens 5:46 AM. Gates close 6:01 AM. Be there 5:45</InfoBullet>
      <InfoBullet><strong>Leg 2:</strong> Eurostar 9002 · 06:31→09:57 Paris Gare du Nord. Security + UK exit + French entry checks before boarding</InfoBullet>
      <InfoBullet><strong>Leg 3:</strong> Gare du Nord → Trocadéro: Metro Line 4 → Line 6 (or Line 9). ~30 min</InfoBullet>
      <InfoBullet><strong>Leg 4:</strong> Eiffel Tower area → Disney: Metro to Châtelet, RER A to Marne-la-Vallée/Chessy. ~1 hour. ~€5/person</InfoBullet>
      <InfoBullet>Dream Castle shuttle: Free from Disney bus station. Runs ~every 20 min</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>5:15 AM alarm with a 5-year-old. Have Louise's clothes and a snack ready to go</WarnBullet>
      <WarnBullet>Eiffel Tower lift tickets go on sale exactly 60 days ahead at MIDNIGHT Paris time. For Jun 13 visit → tickets drop at <strong>5:00 PM CDT on April 13</strong> (midnight CEST = UTC+2). Be on ticket.toureiffel.paris refreshing at 4:55 PM!</WarnBullet>
      <WarnBullet>Summit sells out within MINUTES in summer. If midnight batch sells out, a second batch often drops at 4:45 AM Paris time = <strong>9:45 PM CDT April 13</strong></WarnBullet>
      <WarnBullet>Create your account on ticket.toureiffel.paris NOW so you're ready to buy instantly on April 13</WarnBullet>
      <WarnBullet>If you miss both windows, Trocadéro viewpoint is still an amazing free photo op — and on-site tickets are sometimes available day-of with a longer wait</WarnBullet>
      <WarnBullet>RER A to Disney: Validate your tickets! Fine for no validation is €50+</WarnBullet>
      <WarnBullet>Watch belongings on Paris metro — tourist areas are pickpocket-heavy</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>Eurostar has a bar car — coffee and pastries once onboard</TipBullet>
      <TipBullet>Dream Castle pool has a water slide! Let the kids burn energy after travel</TipBullet>
      <TipBullet>Disney Village is walkable — good for dinner without park tickets</TipBullet>
      <TipBullet><strong>Eiffel Tower tickets:</strong> Must be purchased April 13 at 5:00 PM CDT (midnight Paris, 60 days out). Summit by elevator is the goal. All 4 need tickets (Louise is 5 — child rate, not free). Official site only: ticket.toureiffel.paris</TipBullet>
    </DetailSection>
  </>
);

const Day14Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before (Jun 13)" color="#b88ad9">
      <InfoBullet>Set alarm 6:30 AM. Pack day bag: chargers, sunscreen, snacks, rain layer</InfoBullet>
      <InfoBullet>Download Disneyland Paris app. Link booking #32984124 to Disney Account</InfoBullet>
      <InfoBullet>Ensure MagicPass and meal vouchers are accessible in app (mobile check-in opens Jun 7)</InfoBullet>
      <InfoBullet>Charge phones to 100% — app-heavy day (wait times, dining, Premier Access)</InfoBullet>
      <InfoBullet>Bring a portable battery pack!</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Dream Castle → Art of Marvel: ~10-15 min shuttle or walk through Disney Village</InfoBullet>
      <InfoBullet>Art of Marvel → Disney Adventure World entrance: ~10 min walk. Security opens ~30 min before EMT</InfoBullet>
      <InfoBullet>Show MagicPass/Easy Pass at EMT entrance. Get it at Art of Marvel early check-in desk first</InfoBullet>
      <InfoBullet><strong>At check-in: Request same room for both nights.</strong> Tell front desk you have booking #32984124 (Jun 14) and #H-DKH4WQD368V2 (Jun 15) — ask them to assign the same room. This is the most reliable way to get it done</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>Dream Castle checkout: Don't wait until 11 AM! Check out ~7:00 to maximize EMT</WarnBullet>
      <WarnBullet>Art of Marvel early check-in gets your MagicPass, but room isn't ready until 3 PM. Leave bags at hotel luggage storage</WarnBullet>
      <WarnBullet>Louise (est. 115cm in June) CLEARS Crush's Coaster (107cm), Big Thunder Mountain (102cm), and Tower of Terror (102cm)!</WarnBullet>
      <WarnBullet>Louise CANNOT ride: Avengers Assemble: Flight Force (120cm), Hyperspace Mountain (120cm), Indiana Jones (140cm) — use Parent Swap for these 3</WarnBullet>
      <WarnBullet>Bistrot Chez Rémy at 11:45 AM is FIXED. Set phone alarm — easy to lose track on rides</WarnBullet>
      <WarnBullet>PYM Kitchen at 6:00 PM — same. Don't queue for a ride at 5:30 thinking you'll make it</WarnBullet>
    </DetailSection>
    <DetailSection icon="🎢" title="Disney Tips & Strategy" color="#d94a8a">
      <TipBullet><strong>EMT Strategy (8:00–9:30):</strong> ALL FOUR → Crush's Coaster first (Louise clears 107cm!). Then Spider-Man W.E.B. Adventure (no req). Then split: Michael+Kenna → Avengers Assemble (120cm, Parent Swap for Meghan) while Meghan+Louise → Frozen Ever After or Ratatouille</TipBullet>
      <TipBullet><strong>Post-9:30:</strong> Tower of Terror (Louise clears 102cm! — new covered queue area makes the wait more bearable), Cars Road Trip, Ratatouille (refurbished 2026 — now 2D, new Parisian artist studio queue scene, enhanced props)</TipBullet>
      <TipBullet><strong>NEW World of Frozen (opened Mar 29):</strong> Frozen Ever After (boat ride through Arendelle — expect long waits even in June!), Royal Encounter with Anna & Elsa in Arendelle Castle (meet & greet — check app for Virtual Queue), "A Celebration in Arendelle" daytime show on Viking longships in Arendelle Bay. Louise will be mesmerized</TipBullet>
      <TipBullet><strong>NEW Adventure Way (opened Mar 29):</strong> Raiponce Tangled Spin (spinner ride under glowing lanterns — Louise's new favorite!), themed gardens (Toy Story, Tangled, British), Regal View Restaurant & Lounge (Princess character dining — first in-park bar at DLP!), new Mickey & Minnie meet and greet</TipBullet>
      <TipBullet><strong>NEW Disney Cascade of Lights (~8:30-9:00 PM):</strong> Brand-new nighttime lake show on Adventure Bay — fireworks, water-screen projections, drones, and aquatic drones. Don't miss this! It's the Adventure World equivalent of Illuminations</TipBullet>
      <TipBullet><strong>Avengers Assemble: Flight Force (120cm):</strong> Louise can't ride. Parent Swap — one adult rides with Kenna, then swaps. Free!</TipBullet>
      <TipBullet><strong>Standby Pass (FREE!):</strong> Reserve free return-time slots in the app. Only hold 1 at a time. Combine with Premier Access for max efficiency</TipBullet>
      <TipBullet><strong>Single Rider:</strong> Available on Crush's Coaster, Ratatouille, RC Racer. Great for a quick re-ride</TipBullet>
      <TipBullet><strong>Louise highlights:</strong> Frozen Ever After (boat ride!), Raiponce Tangled Spin (lanterns!), Ratatouille, Cars Road Trip, A Celebration in Arendelle show, Anna & Elsa meet and greet</TipBullet>
    </DetailSection>
    <DetailSection icon="💳" title="Premier Access Recommendation" color="#e8a04a">
      <InfoBullet><strong>Skip Premier Access Ultimate</strong> (~€120-160/person in June high season). With EMT + 2 full days, you have time for standby</InfoBullet>
      <InfoBullet><strong>Buy 1-2 Premier Access One strategically</strong> (~€8-18/ride, purchased in-app once inside park):</InfoBullet>
      <TipBullet><strong>#1: Frozen Ever After</strong> — brand new ride, will have the longest waits. All 4 can ride. Best PA One value today</TipBullet>
      <TipBullet><strong>#2: Ratatouille</strong> — if standby hits 60+ min midday. All 4 can ride. Buy while queuing for something else</TipBullet>
      <TipBullet>Skip PA for: Cars Road Trip (short waits), Tower of Terror (preshow means PA still takes 15-20 min)</TipBullet>
      <InfoBullet><strong>Parent Swap (free!):</strong> Only needed for Avengers Assemble: Flight Force (120cm). One adult rides with Kenna, then the other swaps — no re-queuing</InfoBullet>
      <InfoBullet>Max 3 PA One per person per day. Budget: 2 passes × 4 riders × ~€12 = ~€96 (~$105)</InfoBullet>
    </DetailSection>
    <DetailSection icon="🍽️" title="Meal Plan Voucher Map — Jun 14" color="#5ce892">
      <InfoBullet><strong>No breakfast voucher today</strong> — you slept at Dream Castle (not covered by meal plan)</InfoBullet>
      <InfoBullet><strong>11:45 AM — Bistrot Chez Rémy → MEAL VOUCHER 1.</strong> Table service = starter + main + dessert + soft drink (kids). Order all 3 courses — they're included, don't skip any!</InfoBullet>
      <InfoBullet><strong>~3:00 PM — Pause Gourmande → SNACK + DRINK VOUCHER.</strong> Pastry + hot/cold drink at any quick-service. Perfect mid-ride fuel. Don't waste this at breakfast!</InfoBullet>
      <InfoBullet><strong>6:00 PM — PYM Kitchen → MEAL VOUCHER 2.</strong> All-you-can-eat buffet + soft drink. Go back for seconds — best calorie-per-voucher value</InfoBullet>
      <InfoBullet><strong>~9:00 PM — Skyline Bar (Art of Marvel) → DRINK VOUCHER.</strong> 1 alcoholic OR non-alcoholic drink per person. Cocktails run €12-16 — high-value use! Michael & Meghan: cocktails. Kenna & Louise: mocktails/milkshakes</InfoBullet>
      <WarnBullet><strong>Excluded restaurants:</strong> Starbucks, McDonald's, Rainforest Café, Five Guys, Earl of Sandwich, Vapiano, The Royal Pub, Brasserie Rosalie — vouchers NOT accepted</WarnBullet>
      <TipBullet><strong>$0 out of pocket for all food + drinks today</strong></TipBullet>
    </DetailSection>
  </>
);

const Day15Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before (Jun 14)" color="#b88ad9">
      <InfoBullet>Set alarm 6:15 AM. Breakfast opens early — be there by 7:00 to eat and still make EMT</InfoBullet>
      <InfoBullet>Check parade and show times in app tonight. Plan around Disney Stars on Parade + Illuminations</InfoBullet>
      <InfoBullet>Charge phones again. Another full app-heavy day</InfoBullet>
      <InfoBullet>Royal Banquet at 12:30 is at the DISNEYLAND HOTEL (not your hotel). Know the walking route — allow 15 min</InfoBullet>
    </DetailSection>
    <DetailSection icon="💺" title="⏰ RETURN FLIGHT CHECK-IN" color="#d94a8a">
      <WarnBullet><strong>SET ALARM: Jun 15 at 5:20 PM Paris time (10:20 AM CDT).</strong> BA return check-in opens at exactly 5:25 PM CEST (24 hrs before 4:25 PM BST Jun 16 departure). You'll be in Disneyland Park — do this from your phone during a break!</WarnBullet>
      <InfoBullet>Same strategy: both log in on separate phones at ba.com → YUAD5K. Grab 4 adjacent seats instantly</InfoBullet>
      <InfoBullet>If free seats don't work, handle at Heathrow T5 check-in desk on Jun 16 — same "5-year-old must sit with parent" rule applies</InfoBullet>
      <TipBullet>Good time to do this: right before or after Disney Stars on Parade (~2:30-3:00 PM park time). Take 5 min, grab seats, get back to the magic</TipBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements" color="#4a90d9">
      <InfoBullet>Art of Marvel → Disneyland Park entrance: ~10 min walk through Disney Village</InfoBullet>
      <InfoBullet>Security checkpoint opens ~30 min before EMT (~7:30 AM)</InfoBullet>
      <InfoBullet>Royal Banquet: Inside the Disneyland Hotel (castle building above park entrance). Exit park → walk through hotel lobby → restaurant. Allow 15 min each way</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>Royal Banquet at 12:30 is OUTSIDE the park (in Disneyland Hotel). Exit and re-enter. Allow 15 min each way</WarnBullet>
      <WarnBullet>Character dining takes ~75-90 min with princesses visiting tables. Don't rush — this is a highlight for the kids</WarnBullet>
      <WarnBullet>Peter Pan's Flight: Consistently longest waits (60-90 min). Hit it during EMT (Meghan+Louise while Michael+Kenna do Hyperspace Mountain) or buy PA One</WarnBullet>
      <WarnBullet>Disney Illuminations at ~10 PM. Louise will be exhausted after 14+ hours. Consider a stroller</WarnBullet>
      <WarnBullet>⚠️ PACK TONIGHT! 7:30 AM checkout tomorrow. You will NOT have time in the morning</WarnBullet>
    </DetailSection>
    <DetailSection icon="🎢" title="Disney Tips & Strategy" color="#d94a8a">
      <TipBullet><strong>EMT Strategy (8:00–9:30):</strong> ALL FOUR → Big Thunder Mountain first (Louise clears 102cm!). Then split: Michael+Kenna → Hyperspace Mountain (120cm, Parent Swap for Meghan) while Meghan+Louise → Peter Pan's Flight (no req, walk-on during EMT!)</TipBullet>
      <TipBullet><strong>Post-9:30:</strong> Pirates of the Caribbean, Phantom Manor, Buzz Lightyear (all family-friendly, all 4 ride together)</TipBullet>
      <TipBullet><strong>After Royal Banquet (~2 PM):</strong> It's a Small World, Alice's Curious Labyrinth (walkthrough — Louise will love it, no wait), Dumbo, Mad Hatter's Tea Cups</TipBullet>
      <TipBullet><strong>Parent Swap rides (120cm+):</strong> Hyperspace Mountain only. Indiana Jones (140cm) — Kenna only, both adults swap. That's it — Louise rides almost everything else!</TipBullet>
      <TipBullet><strong>Parade Strategy (~2:30-3:00 PM):</strong> Disney Stars on Parade is spectacular. Watch from Main Street or Central Plaza. OR skip and ride headliners with shorter queues during the parade</TipBullet>
      <TipBullet><strong>Evening (7-10 PM):</strong> Re-ride favorites. Queues drop significantly after dinner. Fantasyland rides nearly walk-on after 8 PM</TipBullet>
      <TipBullet><strong>10:00 PM:</strong> Disney Illuminations at Sleeping Beauty Castle. Claim a spot in the hub 20-30 min early. Front-center gives the best view</TipBullet>
      <TipBullet><strong>Single Rider:</strong> Big Thunder Mountain and Ratatouille both have it. Great for a quick re-ride</TipBullet>
    </DetailSection>
    <DetailSection icon="💳" title="Premier Access Recommendation" color="#e8a04a">
      <InfoBullet><strong>Best PA One targets for Disneyland Park today:</strong></InfoBullet>
      <TipBullet><strong>#1: Peter Pan's Flight</strong> — perpetually 60-90 min waits. Only ~€8-12. All 4 can ride. Best value PA in either park</TipBullet>
      <TipBullet><strong>#2: Big Thunder Mountain</strong> — if you want a re-ride and it's 45+ min midday. All 4 can ride (Louise clears 102cm)</TipBullet>
      <TipBullet>Skip PA for: Phantom Manor (rarely 25+ min), Pirates (walk-on after 5 PM), Buzz (moderate waits)</TipBullet>
      <InfoBullet><strong>Parent Swap only needed for 2 rides today:</strong> Hyperspace Mountain (120cm) and Indiana Jones (140cm, Kenna only). That's it!</InfoBullet>
      <InfoBullet>Estimated PA One spend: 2 passes × 4 riders × ~€10 avg = ~€80 (~$87)</InfoBullet>
    </DetailSection>
    <DetailSection icon="🍽️" title="Meal Plan Voucher Map — Jun 15" color="#5ce892">
      <InfoBullet><strong>~7:00 AM — Art of Marvel buffet → BREAKFAST VOUCHER.</strong> Eat well — this is your only included breakfast. Hot + cold buffet, pastries, eggs, the works</InfoBullet>
      <InfoBullet><strong>12:30 PM — Royal Banquet → LAST DAY VOUCHER + CHARACTER DINING.</strong> Princess dining! The character meal REPLACES a regular voucher (not extra). Starter + main + dessert. Expect Anna, Elsa, Rapunzel, Cinderella, Aurora visiting your table. Allow 75-90 min</InfoBullet>
      <WarnBullet><strong>~6:00-7:00 PM — Dinner: NO VOUCHER LEFT.</strong> All 6 vouchers are spent. Budget ~€40-60 out of pocket for the family. Options: quick-service in Disneyland Park (~€12-15/person), or a crêpe/snack — you'll have had a massive Royal Banquet lunch</WarnBullet>
      <WarnBullet><strong>Snack + Drink vouchers were used yesterday.</strong> You get 1 set per night, and your plan only covers 1 night</WarnBullet>
      <TipBullet><strong>Strategy:</strong> Royal Banquet will be a huge multi-course meal with characters at 12:30. You probably won't be hungry again until 6-7 PM. A lighter quick-service dinner keeps costs down</TipBullet>
    </DetailSection>
  </>
);

const Day16Detail = () => (
  <>
    <DetailSection icon="🎒" title="Prepare the Night Before (Jun 15)" color="#b88ad9">
      <InfoBullet>PACK EVERYTHING after Illuminations tonight. Checkout is 7:30 AM</InfoBullet>
      <InfoBullet>Set alarm 6:30 AM</InfoBullet>
      <WarnBullet><strong>Breakfast NOT included tomorrow</strong> — Night 2 is Capital One (no meal plan). Options: pay for hotel buffet (~€82 for family of 4) or grab pastries at Marne-la-Vallée station or Gare du Nord (much cheaper, ~€15-20 total)</WarnBullet>
      <InfoBullet>Eurostar return on phone. Ref: QRXPZK. Train 9023, Coach 4, Seats 53/54/58/57</InfoBullet>
      <InfoBullet>Heathrow Express on phone. Ref: c44d65da</InfoBullet>
    </DetailSection>
    <DetailSection icon="🚆" title="Travel Requirements — 5 Legs!" color="#4a90d9">
      <InfoBullet><strong>Leg 1:</strong> Art of Marvel → Marne-la-Vallée station (~15 min walk). RER A → Châtelet-Les Halles. RER B → Gare du Nord. Total ~50-60 min. ~€5/person</InfoBullet>
      <InfoBullet><strong>Leg 2:</strong> Eurostar 9023 departs 11:02 AM. Check-in ~10:15. Be at Gare du Nord by 10:00 AM latest</InfoBullet>
      <InfoBullet><strong>Leg 3:</strong> Arrive St Pancras 12:30 (UK time — gain 1 hour). Walk/Tube to Paddington (~15 min)</InfoBullet>
      <InfoBullet><strong>Leg 4:</strong> Heathrow Express from Paddington ~13:00. 15 min to T5. Ref: c44d65da</InfoBullet>
      <InfoBullet><strong>Leg 5:</strong> BA221 departs 16:25 → STL 19:30. Arrive T5 ~13:15 = 3 hr 10 min buffer</InfoBullet>
    </DetailSection>
    <DetailSection icon="⚠️" title="Potential Pitfalls" color="#e8c55c">
      <WarnBullet>RER connections can be confusing at Châtelet. Follow signs for RER B direction "Aéroport Charles de Gaulle"</WarnBullet>
      <WarnBullet>RER B runs every ~10-15 min. If you miss one, you're fine — plenty of buffer</WarnBullet>
      <WarnBullet>Gare du Nord Eurostar terminal is separate from main station. Follow "Eurostar" signs</WarnBullet>
      <WarnBullet>Time zone change: France → UK loses 1 hour. Depart 11:02 Paris, arrive 12:30 London (feels like 28 min!)</WarnBullet>
      <WarnBullet>If ANY leg is delayed, you still have 3+ hours buffer at Heathrow. Don't panic</WarnBullet>
    </DetailSection>
    <DetailSection icon="💡" title="Local Intel" color="#5ce892">
      <TipBullet>Buy RER tickets at Marne-la-Vallée machines (cards accepted). Keep them — scan OUT at Gare du Nord</TipBullet>
      <TipBullet>Eurostar bar car: final French croissant opportunity</TipBullet>
      <TipBullet>Heathrow T5 duty-free is excellent for last-minute gifts. Budget time for it with 3+ hr buffer</TipBullet>
      <TipBullet>BA221 arrives STL 19:30. Home for a late dinner. Trip complete!</TipBullet>
    </DetailSection>
  </>
);


/* ── Main Component ── */

export default function TripItinerary() {
  const [tab, setTab] = useState("itinerary");
  const [expandedDay, setExpandedDay] = useState(null);

  const toggle = (d) => setExpandedDay(expandedDay === d ? null : d);

  return (
    <div style={{ background: "#0d0d18", color: "#e8e4df", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "20px 16px" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#4a4a6a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Francese Family</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: 1, background: "linear-gradient(90deg, #e8e4df, #c8a882)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>London & Paris 2026</h1>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#6a6a8a" }}>June 7 – 16 &nbsp;·&nbsp; STL → LHR → CDG → LHR → STL</div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#2d6b45", marginTop: 6 }}>✓ All transport, hotels, shows & dining booked</div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#4a4a6a", marginTop: 4, fontStyle: "italic" }}>Tap any day to expand · prep · travel · pitfalls · tips</div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 6, overflow: "hidden", border: "1px solid #1e1e30" }}>
        {[{ id: "itinerary", label: "Day by Day" }, { id: "bookings", label: "Reservations" }, { id: "budget", label: "Budget" }, { id: "todo", label: "To Do" }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setExpandedDay(null); }} style={{
            flex: 1, padding: "10px 8px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
            background: tab === t.id ? "#1a1a2e" : "#0d0d18", color: tab === t.id ? "#e8e4df" : "#4a4a6a",
            borderBottom: tab === t.id ? "2px solid #4a90d9" : "2px solid transparent"
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "itinerary" && (
        <div>
          <SectionHeader icon="✈️">Departure</SectionHeader>
          <DayCard day="Sun" dayNum="7" title="Fly to London"
            expanded={expandedDay === 7} onToggle={() => toggle(7)} hasDetail={<Day7Detail />}
            items={[
              { text: "⏰ ALARM: Jun 6 at 9:55 PM — BA check-in opens for FREE seat selection!", status: ACTION, statusLabel: "SET ALARM" },
              { time: "22:00", text: "BA220 · STL → LHR · World Traveller", status: BOOKED, statusLabel: "YUAD5K" },
              { text: "Overnight flight — arrives June 8 at 12:05 PM (Terminal 5)" }
            ]} />

          <SectionHeader icon="🇬🇧">London · Days 1–5</SectionHeader>
          <DayCard day="Mon" dayNum="8" title="Arrival Day — Kings Cross"
            expanded={expandedDay === 8} onToggle={() => toggle(8)} hasDetail={<Day8Detail />}
            items={[
              { time: "12:05", text: "Arrive LHR Terminal 5. Early check-in booked from 12pm!" },
              { time: "~13:00", text: "🚄 Heathrow Express → Paddington (15 min)", status: BOOKED, statusLabel: "69d52862" },
              { time: "~13:30", text: "Tube to Kings Cross. Check into Travelodge", status: BOOKED, statusLabel: "164080202" },
              { text: "WiFi code: TVLRTFRPK · Breakfast included all 5 mornings" },
              { text: "Explore Coal Drops Yard / St Pancras area" },
              { text: "Early dinner — Dishoom or Pizza Union" }
            ]} />
          <DayCard day="Tue" dayNum="9" title="Westminster + London Eye + Thames"
            expanded={expandedDay === 9} onToggle={() => toggle(9)} hasDetail={<Day9Detail />}
            items={[
              { time: "~09:30", text: "Big Ben, Westminster Abbey" },
              { time: "~11:00", text: "St James's Park playground (Louise)" },
              { time: "~11:30", text: "Walk to Buckingham Palace" },
              { time: "~12:15", text: "Walk back to South Bank. Quick lunch" },
              { time: "13:00", text: "🎡 London Eye (30 min ride)", status: BOOKED, statusLabel: "#601617735" },
              { time: "~13:45", text: "Walk to London Eye Pier → Thames Clipper boat ride" },
              { time: "~15:00", text: "Explore South Bank" },
              { text: "Dinner at Southbank Centre Food Market" }
            ]} />
          <DayCard day="Wed" dayNum="10" title="West End Matinee Day"
            expanded={expandedDay === 10} onToggle={() => toggle(10)} hasDetail={<Day10Detail />}
            items={[
              { text: "Morning: Covent Garden shops + street performers" },
              { time: "~11:30", text: "Head to V&A Museum (Tube to South Kensington)" },
              { time: "12:30", text: "👗 V&A Fashion Tour (45 min)", status: ACTION, statusLabel: "BOOK AHEAD" },
              { time: "13:15", text: "Tube: South Kensington → Leicester Square (~15 min)" },
              { time: "~13:35", text: "Arrive Cambridge Theatre — 25 min buffer ⚠️" },
              { time: "14:00", text: "🎭 Matilda the Musical · Dress Circle Row A · Seats 23-26", status: BOOKED, statusLabel: "26042Q" },
              { time: "~16:30", text: "Show ends" },
              { text: "Dinner in Covent Garden or Chinatown" }
            ]} />
          <DayCard day="Thu" dayNum="11" title="British Museum + Regent's Park"
            expanded={expandedDay === 11} onToggle={() => toggle(11)} hasDetail={<Day11Detail />}
            items={[
              { text: "British Museum (mummies, Greek marbles)" },
              { text: "Regent's Park playgrounds / pedal boats" },
              { text: "Dinner near Kings Cross" }
            ]} />
          <DayCard day="Fri" dayNum="12" title="Museums (Split Day) + Pack for Paris"
            expanded={expandedDay === 12} onToggle={() => toggle(12)} hasDetail={<Day12Detail />}
            items={[
              { text: "👨‍👧 Michael + Louise: Natural History Museum", status: ACTION, statusLabel: "BOOK ENTRY" },
              { text: "👩‍👧 Meghan + Kenna: Tate Modern + Millennium Bridge" },
              { text: "Regroup for lunch or afternoon" },
              { text: "Optional: Sky Garden (free, book 3 wks ahead)", status: ACTION, statusLabel: "BOOK MAY 25" },
              { text: "⚠ Pack tonight — 5:15 AM wake-up tomorrow!" }
            ]} />

          <SectionHeader icon="🚄">Channel Crossing</SectionHeader>
          <DayCard day="Sat" dayNum="13" title="London → Paris → Disneyland"
            expanded={expandedDay === 13} onToggle={() => toggle(13)} hasDetail={<Day13Detail />}
            items={[
              { time: "05:15", text: "Wake up. Walk to St Pancras (5 min)" },
              { time: "06:31", text: "🚄 Eurostar 9002 · Coach 10 · Seats 18,17,13,14", status: BOOKED, statusLabel: "QRXPZK" },
              { time: "09:57", text: "Arrive Paris Gare du Nord" },
              { time: "~10:30", text: "Metro to Trocadéro → Eiffel Tower!" },
              { time: "~13:00", text: "Lunch near Eiffel Tower" },
              { time: "~14:00", text: "Metro → RER A to Marne-la-Vallée (~1 hr)" },
              { time: "~15:30", text: "Check into Dream Castle Hotel", status: BOOKED, statusLabel: "H-KTXPJ3X4HJ4C" },
              { text: "Kids: castle pool & water slide! Evening: Disney Village" }
            ]} />

          <SectionHeader icon="🏰">Disneyland Paris · Days 7–8</SectionHeader>
          <DayCard day="Sun" dayNum="14" title="Disney Day 1 — Disney Adventure World"
            expanded={expandedDay === 14} onToggle={() => toggle(14)} hasDetail={<Day14Detail />}
            items={[
              { time: "~07:00", text: "Check out Dream Castle. Shuttle/walk to Art of Marvel." },
              { time: "~07:15", text: "Early check-in at Art of Marvel — get MagicPass + Easy Pass (room not ready until 3 PM)", status: BOOKED, statusLabel: "32984124" },
              { time: "~07:30", text: "Head to Disney Adventure World entrance (10-min walk)" },
              { time: "08:00–08:30", text: "⭐ EXTRA MAGIC TIME — early access! (Art of Marvel arrival day = eligible)", status: BOOKED, statusLabel: "EARLY ACCESS" },
              { text: "All 4 together: Crush's Coaster (Louise clears 107cm!), Spider-Man W.E.B., then split for Avengers Assemble" },
              { time: "09:30", text: "Park opens to public. Crowds arrive — switch to lower-wait rides" },
              { time: "09:30–11:30", text: "Ratatouille (refurbished — now 2D!), Frozen Ever After, Raiponce Tangled Spin, Tower of Terror" },
              { time: "11:45", text: "🍽️ Lunch: Bistrot Chez Rémy — meal voucher 1", status: BOOKED, statusLabel: "DINING" },
              { time: "~13:00", text: "Continue rides. Use SNACK+DRINK voucher mid-afternoon (Pause Gourmande)" },
              { time: "~15:00", text: "Room ready — drop bags at Art of Marvel" },
              { time: "18:00", text: "🍽️ Dinner: PYM Kitchen — meal voucher 2", status: BOOKED, statusLabel: "DINING" },
              { time: "~19:00", text: "Evening rides + explore Adventure Way gardens (new! Toy Story, Tangled themes)" },
              { time: "~20:30", text: "✨ Disney Cascade of Lights — NEW nighttime lake show (drones, fireworks, water projections!)" },
              { time: "~21:00", text: "Disney Adventure World closes (est. June hours)" },
              { time: "~21:30", text: "🍸 Skyline Bar at Art of Marvel — use DRINK VOUCHER (cocktails/mocktails!)" },
              { text: "🎫 All meals + drinks today covered by Full-board Extra Plus (4 vouchers used)" }
            ]} />
          <DayCard day="Mon" dayNum="15" title="Disney Day 2 — Disneyland Park"
            expanded={expandedDay === 15} onToggle={() => toggle(15)} hasDetail={<Day15Detail />}
            items={[
              { time: "~07:00", text: "🍽️ Breakfast at Art of Marvel — BREAKFAST VOUCHER (only included breakfast of trip)" },
              { time: "~07:30", text: "Head to Disneyland Park entrance (10-min walk)" },
              { time: "08:00–08:30", text: "⭐ EXTRA MAGIC TIME — early access! (Art of Marvel guest)", status: BOOKED, statusLabel: "EARLY ACCESS" },
              { text: "All 4 → Big Thunder Mountain. Then split: Hyperspace Mtn (Parent Swap) + Peter Pan (walk-on!)" },
              { time: "09:30", text: "Park opens to public. Crowds arrive — switch to lower-wait rides" },
              { time: "12:30", text: "🍽️ Lunch: Royal Banquet — LAST DAY VOUCHER + character dining 👸", status: BOOKED, statusLabel: "DINING" },
              { time: "~14:00", text: "Afternoon: Pirates of the Caribbean, Phantom Manor, Peter Pan's Flight" },
              { time: "~14:40", text: "Disney Stars on Parade (est. time — check app on the day)" },
              { time: "17:25", text: "⏰ BA RETURN CHECK-IN OPENS — grab free seats on phone NOW!", status: ACTION, statusLabel: "SET ALARM" },
              { time: "~18:30", text: "🍽️ Dinner: Quick-service (NO voucher left — ~€40-60 out of pocket)", status: ACTION, statusLabel: "NOT COVERED" },
              { text: "Stay in Art of Marvel (same room)", status: BOOKED, statusLabel: "H-DKH4WQD368V2" },
              { time: "~22:00", text: "✨ Disney Illuminations fireworks at Sleeping Beauty Castle!" },
              { time: "~22:30", text: "Disneyland Park closes (est. June hours). Walk back to hotel." },
              { text: "⚠ Pack tonight — 7:30 AM checkout tomorrow!" }
            ]} />

          <SectionHeader icon="✈️">Return Journey</SectionHeader>
          <DayCard day="Tue" dayNum="16" title="Disney → Paris → London → Home"
            expanded={expandedDay === 16} onToggle={() => toggle(16)} hasDetail={<Day16Detail />}
            items={[
              { time: "~07:00", text: "🍽️ Breakfast NOT included (C1 booking). Grab pastries at station (~€15-20)", status: ACTION, statusLabel: "NOT COVERED" },
              { time: "~07:30", text: "Check out. RER A → Châtelet → RER B → Gare du Nord" },
              { time: "~09:00", text: "Arrive Gare du Nord. Eurostar check-in" },
              { time: "11:02", text: "🚄 Eurostar 9023 · Coach 4 · Seats 53,54,58,57", status: BOOKED, statusLabel: "QRXPZK" },
              { time: "12:30", text: "Arrive London St Pancras" },
              { time: "~12:45", text: "Walk/Tube to Paddington (~15 min)" },
              { time: "~13:00", text: "🚄 Heathrow Express (15 min)", status: BOOKED, statusLabel: "c44d65da" },
              { time: "~13:15", text: "Arrive Heathrow T5 — 3 hr 10 min buffer ✅" },
              { time: "16:25", text: "✈ BA221 · LHR → STL", status: BOOKED, statusLabel: "YUAD5K" },
              { time: "19:30", text: "Arrive St. Louis! Welcome home 🏠" }
            ]} />
        </div>
      )}

      {tab === "bookings" && (
        <div>
          <SectionHeader icon="✈️">Flights</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e4df", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>British Airways · Round Trip</div>
            <InfoRow label="Booking Ref" value="YUAD5K" mono />
            <InfoRow label="Outbound" value="Jun 7 · BA220 · STL→LHR 22:00→12:05+1" />
            <InfoRow label="Return" value="Jun 16 · BA221 · LHR→STL 16:25→19:30" />
            <InfoRow label="Terminal" value="Heathrow T5" />
            <InfoRow label="Paid" value="260,000 Avios + $1,083.86" />
          </div>

          <SectionHeader icon="🚄">Eurostar</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e4df", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>London ↔ Paris · Round Trip</div>
            <InfoRow label="Booking Ref" value="QRXPZK" mono />
            <InfoRow label="Outbound" value="Jun 13 · 9002 · 06:31→09:57 · Coach 10 · Seats 18,17,13,14" />
            <InfoRow label="Return" value="Jun 16 · 9023 · 11:02→12:30 · Coach 4 · Seats 53,54,58,57" />
            <InfoRow label="Cost" value="$368 (Apple Pay)" />
            <InfoRow label="Kenna API" value="BLOCKED — passport pending" status={{ type: MISSING, label: "BLOCKED" }} />
            <InfoRow label="Louise API" value="Completed" status={{ type: BOOKED, label: "✓ DONE" }} />
          </div>

          <SectionHeader icon="🚄">Heathrow Express</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <InfoRow label="Jun 8 · LHR→Paddington" value="Ref 69d52862" mono />
            <InfoRow label="Jun 16 · Paddington→LHR" value="Ref c44d65da" mono />
            <InfoRow label="Cost" value="£40 total" />
          </div>

          <SectionHeader icon="🏨">Hotels</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e4df", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Travelodge London Kings Cross Royal Scot</div>
            <InfoRow label="Dates" value="Jun 8–13 (5 nights)" />
            <InfoRow label="Confirmation" value="164080202" mono />
            <InfoRow label="Cost" value="£1,242.45" />
            <InfoRow label="Check-in" value="From noon (early check-in)" />
            <InfoRow label="Perks" value="Breakfast included · WiFi: TVLRTFRPK" />
          </div>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e4df", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Dream Castle Hotel (Disney Partner)</div>
            <InfoRow label="Date" value="Jun 13 (1 night)" />
            <InfoRow label="Confirmation" value="H-KTXPJ3X4HJ4C" mono />
            <InfoRow label="Cost" value="$0 (C1 $300 travel credit)" />
          </div>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e4df", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Disney Hotel New York — Art of Marvel</div>
            <InfoRow label="Night 1" value="Jun 14 · #32984124 (Disney)" mono />
            <InfoRow label="Night 2" value="Jun 15 · #H-DKH4WQD368V2 (C1)" mono />
            <InfoRow label="Room" value="Superior, 2 Large Double, Garden View" />
            <InfoRow label="Night 1" value="$1,733.68 (hotel+tickets+meals)" />
            <InfoRow label="Status" value="PAID IN FULL" status={{ type: BOOKED, label: "✓ PAID" }} />
            <InfoRow label="Night 2" value="$0 (64,795 C1 miles + $26.85)" />
            <InfoRow label="Link rooms" value="Call +33 1 60 30 60 53" status={{ type: ACTION, label: "DO NOW" }} />
          </div>

          <SectionHeader icon="🎭">Shows & Attractions</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <InfoRow label="Matilda the Musical" value="Jun 10 · 2:00 PM" />
            <InfoRow label="Venue" value="Cambridge Theatre · Dress Circle A23-26" />
            <InfoRow label="Ref" value="26042Q-6YAMRCW8CJ" mono />
            <InfoRow label="Cost" value="£340" />
          </div>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <InfoRow label="London Eye" value="Jun 9 · 1:00 PM" />
            <InfoRow label="Order #" value="601617735" mono />
            <InfoRow label="Cost" value="£110" />
          </div>

          <SectionHeader icon="🍽️">Disney Dining</SectionHeader>
          <div style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <InfoRow label="Jun 14 · 11:45 AM" value="Bistrot Chez Rémy" />
            <InfoRow label="Jun 14 · 6:00 PM" value="PYM Kitchen" />
            <InfoRow label="Jun 15 · 12:30 PM" value="Royal Banquet (character dining)" />
            <InfoRow label="All covered by" value="Full-board Extra Plus" status={{ type: BOOKED, label: "$0" }} />
          </div>
        </div>
      )}

      {tab === "budget" && (
        <div>
          <SectionHeader icon="💰">Cash Spent</SectionHeader>
          {[
            { item: "BA Flights (taxes/fees)", cost: "$1,083.86", note: "+ 260K Avios" },
            { item: "Eurostar Round Trip", cost: "$368.00" },
            { item: "Heathrow Express (2×)", cost: "~$50.00", note: "£40" },
            { item: "UK ETA (4 persons)", cost: "~$50.00", note: "£10 each" },
            { item: "Travelodge (5 nights)", cost: "~$1,553.00", note: "£1,242.45" },
            { item: "Art of Marvel Night 1", cost: "$1,733.68", note: "hotel+tickets+meals" },
            { item: "Matilda the Musical", cost: "~$425.00", note: "£340" },
            { item: "London Eye", cost: "~$138.00", note: "£110" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #1a1a2a" }}>
              <div>
                <span style={{ fontSize: 12, color: "#c8c4bf" }}>{r.item}</span>
                {r.note && <span style={{ fontSize: 10, color: "#4a4a6a", marginLeft: 8 }}>{r.note}</span>}
              </div>
              <span style={{ fontSize: 12, color: "#e8e4df", fontFamily: "monospace", fontWeight: 600 }}>{r.cost}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 12px 8px", borderTop: "2px solid #2a2a3a", marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4df" }}>Confirmed Cash Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4df", fontFamily: "monospace" }}>~$5,402</span>
          </div>

          <SectionHeader icon="📊">Estimated Additional</SectionHeader>
          {[
            { item: "Eiffel Tower (4 tickets, summit)", cost: "~$110" },
            { item: "Local Transport (Oyster, Metro, RER)", cost: "~$149" },
            { item: "Meals (London + Paris transit)", cost: "~$545–750" },
            { item: "Disney meals (covered by plan)", cost: "$0", note: "4 of 6 meals" },
            { item: "Disney meals (NOT covered)", cost: "~$60–100", note: "Jun 15 dinner + Jun 16 breakfast" },
            { item: "Premier Access (optional)", cost: "~$100–200", note: "PA One passes" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #1a1a2a" }}>
              <div>
                <span style={{ fontSize: 12, color: "#8a8a9a" }}>{r.item}</span>
                {r.note && <span style={{ fontSize: 10, color: "#4a4a6a", marginLeft: 8 }}>{r.note}</span>}
              </div>
              <span style={{ fontSize: 12, color: "#8a8a9a", fontFamily: "monospace" }}>{r.cost}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 12px 8px", borderTop: "2px solid #2a2a3a", marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4df" }}>Estimated Trip Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4df", fontFamily: "monospace" }}>~$6,366–6,711</span>
          </div>

          <div style={{ background: "#111a15", border: "1px solid #1a2a1a", borderRadius: 8, padding: 14, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#5ce892", marginBottom: 6 }}>💡 Total value from points & credits</div>
            <div style={{ fontSize: 11, color: "#8a8a9a", lineHeight: 1.6 }}>
              260,000 Avios → flights (~$4,000+ value)<br />
              64,795 C1 miles → Art of Marvel Night 2 ($648 value)<br />
              $300 Venture X credit → Dream Castle + AoM partial<br />
              <span style={{ color: "#5ce892", fontWeight: 600 }}>Total savings: ~$4,948+</span>
            </div>
          </div>
        </div>
      )}

      {tab === "todo" && (
        <div>
          <SectionHeader icon="🔴">Do This Week</SectionHeader>
          {[
            { title: "Apply for Global Entry — Michael + Meghan", detail: "Apply at ttp.dhs.gov. $120/person — fully reimbursed by Venture X. Kids apply FREE once your apps are pending. All 4 can do Enrollment on Arrival at STL on Jun 16 if conditionally approved. Includes TSA PreCheck for outbound." },
            { title: "Apply for Global Entry — Kenna + Louise (after adults)", detail: "Free for minors when parent's application is pending or approved. Same site: ttp.dhs.gov. Parent must consent + attend interview with each child." },
            { title: "Buy 3-4 Anker Nano Travel Adapters (5-in-1, 20W)", detail: "anker.com/products/a9215. Covers US/UK/EU/AU plugs with USB-C port. ~$16 each. One per person or per charging station." },
            { title: "Check T-Mobile plan details with Meghan", detail: "Find out exact plan name (Go5G, Magenta MAX, Experience More/Beyond, etc.). This determines if you get 5GB or 15GB free high-speed data in UK+France. May not need a separate eSIM at all." },
            { title: "⚠️ Kenna's passport — follow up on hiccup", detail: "Application requires a copy of Tyler's (Meghan's ex-husband) ID. Follow up on status — this is a BLOCKER for Eurostar API, UK ETA, and travel." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#1a1520", border: "1px solid #3a1a2a", borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e85c5c", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#8a8a9a", lineHeight: 1.6 }}>{item.detail}</div>
            </div>
          ))}

          <SectionHeader icon="🟡">Before Travel — April</SectionHeader>
          {[
            { title: "🗼 Eiffel Tower — Apr 13 at 5:00 PM CDT!", detail: "Lift tickets drop at midnight Paris time (60 days ahead). ticket.toureiffel.paris. Summit sells out in MINUTES. Backup batch at 9:45 PM CDT. Create account NOW." },
            { title: "UK ETA — all 4 passengers", detail: "gov.uk/apply-electronic-travel-authorisation. £10/person. Apply once all passports are in hand. Takes a few days to process." },
            { title: "Eurostar API for Kenna Holland", detail: "eurostar.com → Manage Booking → QRXPZK. BLOCKED until passport arrives." },
            { title: "BA Advance Passenger Info — all 4", detail: "ba.com → Manage My Booking → YUAD5K. Passport + contact details for each passenger." },
            { title: "BA seat selection — check if needed", detail: "Manage My Booking → YUAD5K. Check if seats are assigned. BA charges ~$25-50/seat in economy but worth it to sit together with 2 kids on an 8-hr overnight flight." },
            { title: "Notify Capital One (Venture X) of travel", detail: "Set travel notifications for UK and France, June 7-16. Prevents fraud blocks on international purchases. No foreign transaction fees on Venture X." },
            { title: "Data plan decision — T-Mobile vs. eSIM", detail: "Once you know your T-Mobile plan tier: if 5-15GB included is enough, just enable data roaming. If not, add T-Mobile 30-Day International Pass ($50/15GB/line) or buy an Airalo Europe eSIM (~$16/10GB). Both UK and France are covered by all options." },
            { title: "Travel insurance — consider a family policy", detail: "Venture X covers trip cancellation + lost bags but NOT medical expenses abroad. World Nomads or Allianz family plans ~$100-150 for 10 days. One ER visit without insurance could cost thousands with 2 kids." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#1a1e15", border: "1px solid #3a3a1a", borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8c55c", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#8a8a9a", lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}

          <SectionHeader icon="📅">Before Travel — May</SectionHeader>
          {[
            { title: "Sky Garden (Jun 12) — book Mon May 25 at 5 AM CDT", detail: "Free. Released Mondays 10am London / 5am CDT. skygarden.london. Set alarm!" },
            { title: "NHM timed entry (Jun 12) — book ~mid-May", detail: "Free. nhm.ac.uk. Michael + Louise day." },
            { title: "V&A Fashion Tour (Jun 10) — book closer to date", detail: "12:30 PM slot. vam.ac.uk. ⚠ Only 25 min buffer to Matilda." },
            { title: "Book Uber to STL — Jun 7 departure", detail: "Schedule for ~7:00 PM pickup (flight departs 10 PM, arrive 2.5 hrs early). Book at earliest available date in Uber app. Cheaper than STL long-term parking." },
            { title: "Book Uber from STL — Jun 16 return", detail: "BA221 arrives STL 7:30 PM. Schedule pickup for ~8:15 PM (allow for customs/baggage). If you have Global Entry, you'll be out faster!" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#1a1520", border: "1px solid #2a2a3a", borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#b88ad9", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#8a8a9a", lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}

          <SectionHeader icon="📱">Before Travel — June (Pre-Departure Week)</SectionHeader>
          {[
            { title: "Download offline maps", detail: "Google Maps: download London, Paris, and Marne-la-Vallée/Disney area for offline use. Essential for navigation without burning through data." },
            { title: "Install + link all travel apps", detail: "Disneyland Paris app (link booking #32984124), Eurostar app (QRXPZK), BA app (YUAD5K), CityMapper (London transit — better than Google Maps for Tube)." },
            { title: "Download Google Translate French pack", detail: "Settings → Offline Translation → French. Works without data for menus, signs, conversations." },
            { title: "Load iPads for kids", detail: "Louise: Meghan's iPad with downloaded movies/shows/games. Kenna: her own iPad. Download content for overnight BA flight (8 hrs) + Eurostar (3.5 hrs each way). Bring kid headphones!" },
            { title: "Disney mobile check-in (opens Jun 7)", detail: "Disneyland Paris app → check in for booking #32984124. Gets your digital MagicPass ready. Meal vouchers + park tickets will appear here." },
            { title: "Kenna Oyster card — do at Paddington on arrival Jun 8", detail: "Buy Oyster card (£7) at any Tube station. Ask staff to add Young Visitor discount (50% off, valid 14 days). Kenna must be present. Louise (5) rides FREE everywhere with adult." },
            { title: "Enable T-Mobile data roaming on both phones", detail: "Settings → Cellular → Data Roaming → ON. Phone will connect automatically when you land in London. If using a travel eSIM instead, install it before departure." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4a90d9", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#8a8a9a", lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}

          <SectionHeader icon="🎒">Packing & Prep Reminders</SectionHeader>
          {[
            { title: "Carry-on only strategy (1 bag + 1 personal item per person)", detail: "BA allows 1 cabin bag (56×45×25cm) + 1 personal item per person. No checked bags = no waiting at baggage claim, no lost luggage risk, easier Eurostar/RER transfers. Pack light — you can do laundry at Travelodge if needed." },
            { title: "Charge Away luggage battery packs", detail: "Removable power packs must be charged. Keep them removable (required for flights). These + Anker adapters = charging sorted." },
            { title: "Prescriptions & first aid kit", detail: "Pack regular meds + copies of prescriptions. Bring: children's Tylenol/Motrin, anti-nausea, allergy meds (Benadryl/Zyrtec), band-aids, sunscreen (June sun is strong for Disney outdoor days)." },
            { title: "Passports for all 4 — verify before leaving", detail: "Michael ✅, Meghan ✅, Louise ✅, Kenna ⚠️ (pending — follow up!). All 4 needed for BA flights, Eurostar, and UK ETA." },
            { title: "Disney PhotoPass+ (~€80) — decide before trip", detail: "Unlimited digital ride photos + photographer shots for your 2-day stay. Worth it if you want hands-free family photos at character dining, in front of the castle, on rides. Buy in app once tickets activate Jun 7." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#141420", border: "1px solid #1e1e30", borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a8a8b8", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#8a8a9a", lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}

          <SectionHeader icon="💳">Disney Payment ✅</SectionHeader>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, padding: "6px 12px", background: "#111a15", borderRadius: 6, border: "1px solid #1a2a1a" }}>
            <span style={{ color: "#2d6b45", fontSize: 12, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 12, color: "#5a8a5a", lineHeight: 1.4, textDecoration: "line-through", textDecorationColor: "#2a3a2a" }}>Booking #32984124 — PAID IN FULL ($1,733.68) on March 19, 2026</span>
          </div>

          <SectionHeader icon="✅">Completed</SectionHeader>
          {[
            "Flights — YUAD5K (260K Avios)",
            "Travelodge — 164080202",
            "Eurostar — QRXPZK ($368)",
            "Heathrow Express — 69d52862 + c44d65da",
            "Dream Castle — H-KTXPJ3X4HJ4C",
            "Art of Marvel Night 1 — 32984124 (PAID IN FULL Mar 19)",
            "Art of Marvel Night 2 — H-DKH4WQD368V2",
            "Matilda — 26042Q-6YAMRCW8CJ",
            "Disney dining — 3 restaurants",
            "London Eye — #601617735",
            "Louise Eurostar API — completed",
            "Disney booking — paid in full ($1,733.68)",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, padding: "6px 12px", background: "#111a15", borderRadius: 6, border: "1px solid #1a2a1a" }}>
              <span style={{ color: "#2d6b45", fontSize: 12, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 12, color: "#5a8a5a", lineHeight: 1.4, textDecoration: "line-through", textDecorationColor: "#2a3a2a" }}>{item}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 32, padding: "16px 0", borderTop: "1px solid #1a1a2a" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "#3a3a4a" }}>
          Updated March 21, 2026 · All bookings confirmed · Tap any day for full details
        </div>
      </div>
    </div>
  );
}
