// ─────────────────────────────────────────────────────────────────────────
// CREDIT SIGNALS
//
// Computes the three convergence signals (demand, inventory, festival
// timing) that the Credit Agent reasons over. These used to be fixed
// strings baked into the LLM prompt ("+34% week-over-week" for every
// seller, every time). Now they're derived from the seller's own raw order
// data and current stock — a brand-new seller and an established seller
// will genuinely produce different numbers.
//
// The festival calendar itself is legitimate static reference data (it's
// the same for every seller, like the platform average return rate is) —
// what changes is where "today" falls relative to it, which is computed
// live from the real clock.
// ─────────────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// A few major Indian shopping-season anchors. In production this would come
// from Meesho's own seasonal calendar; hardcoding a couple of known dates
// per year is a reasonable stand-in, since festival dates themselves are
// fixed facts, not seller data.
const FESTIVAL_ANCHORS_MMDD = [
  { name: 'Diwali Season', month: 10, day: 18 },
  { name: 'Republic Day Sale', month: 1, day: 26 },
  { name: 'Raksha Bandhan Season', month: 8, day: 9 },
];

function nextFestival(fromDate) {
  const year = fromDate.getFullYear();
  const candidates = FESTIVAL_ANCHORS_MMDD.map((f) => {
    let d = new Date(year, f.month - 1, f.day);
    if (d.getTime() < fromDate.getTime()) d = new Date(year + 1, f.month - 1, f.day);
    return { name: f.name, date: d };
  });
  candidates.sort((a, b) => a.date - b.date);
  return candidates[0];
}

/**
 * @param {object} raw - result of getSellerRawData()
 * @returns computed signal object consumed by the Credit Recommendation Agent
 */
export function computeCreditSignals(raw) {
  const now = Date.now();
  const windowDays = 30;
  const midpoint = now - (windowDays / 2) * DAY_MS;

  const recentOrders = raw.orders.filter((o) => now - o.placedAt <= windowDays * DAY_MS);
  const firstHalf = recentOrders.filter((o) => o.placedAt < midpoint).length;
  const secondHalf = recentOrders.filter((o) => o.placedAt >= midpoint).length;
  const demandChangePct = firstHalf > 0
    ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
    : secondHalf > 0 ? 100 : 0;

  const daysToStockout = raw.dailyVelocity > 0
    ? Math.max(0, Math.round(raw.currentStockUnits / raw.dailyVelocity))
    : null;

  const restockLeadDays = 7;
  const festival = nextFestival(new Date(now));
  const daysToFestival = Math.max(0, Math.round((festival.date.getTime() - now) / DAY_MS));
  const actionWindowDays = Math.max(0, daysToFestival - restockLeadDays);

  const demandAlert = demandChangePct >= 15;
  const stockAlert = daysToStockout !== null && daysToStockout <= 14;
  const festivalAlert = actionWindowDays <= 10;

  return {
    demand: {
      changePct: demandChangePct,
      alert: demandAlert,
      recentOrderCount: recentOrders.length,
    },
    inventory: {
      currentStockUnits: raw.currentStockUnits,
      dailyVelocity: round1(raw.dailyVelocity),
      daysToStockout,
      alert: stockAlert,
    },
    festival: {
      name: festival.name,
      daysToFestival,
      restockLeadDays,
      actionWindowDays,
      alert: festivalAlert,
    },
    convergence: demandAlert && stockAlert && festivalAlert,
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
