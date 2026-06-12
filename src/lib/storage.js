const KEY = 'packdraw_pokemon_v1'

export const DEFAULT_STATE = {
  coins: 1000,
  collection: [],
  packsOwned: { booster: 0, trainer: 0, champion: 0 },
  pendingCards: null,
  // stats
  totalPacks: 0,
  totalCards: 0,
  totalSold: 0,
  coinsEarned: 1000,
  coinsSpent: 0,
  // pity system
  packsSinceRare: 0,
  // daily reward
  lastDailyClaim: null,
  // recent pulls history (last 20 cards)
  recentPulls: [],
  // battle stats
  battleWins: 0,
  battleLosses: 0,
  battleStreak: 0,
  bestStreak: 0,
}

export function canClaimDaily(lastDailyClaim) {
  if (!lastDailyClaim) return true
  return Date.now() - lastDailyClaim >= 24 * 60 * 60 * 1000
}

export function msUntilNextClaim(lastDailyClaim) {
  if (!lastDailyClaim) return 0
  const remaining = 24 * 60 * 60 * 1000 - (Date.now() - lastDailyClaim)
  return Math.max(0, remaining)
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch { /* storage full */ }
}
