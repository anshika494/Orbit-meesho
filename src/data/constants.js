// Shared constants used by both the data layer and the agent layer.
// Kept in their own file (rather than inside SellerContext) so
// scoreCalculator.js can import them without creating a circular
// import between the context and the calculator.

// Below this many completed orders, there isn't enough signal for a
// statistically meaningful score — this same number gates the
// Orchestrator Agent's routing decision AND the score calculator's
// "insufficient data" guard, so they can never disagree.
export const COLD_START_ORDER_THRESHOLD = 10;
