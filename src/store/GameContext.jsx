import { createContext, useContext, useReducer, useEffect } from 'react'
import { DEFAULT_STATE, loadState, saveState, canClaimDaily } from '../lib/storage'
import { CARDS, RARITY_CONFIG } from '../data/cards'
import { PACKS } from '../data/packs'

const GameContext = createContext(null)

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function rollRarity(odds) {
  const roll = Math.random()
  let cum = 0
  for (const r of ['legendary', 'epic', 'rare', 'uncommon', 'common']) {
    cum += odds[r] || 0
    if (roll <= cum) return r
  }
  return 'common'
}

function rollRarePlus() {
  const r = Math.random()
  if (r < 0.06) return 'legendary'
  if (r < 0.22) return 'epic'
  return 'rare'
}

function pickCard(rarity) {
  const pool = CARDS.filter(c => c.rarity === rarity)
  const base = pool[Math.floor(Math.random() * pool.length)]
  return { ...base, instanceId: uid(), obtainedAt: Date.now() }
}

function drawCards(pack, pityActive) {
  const cards = []
  let hasRarePlus = false

  for (let i = 0; i < pack.cardCount; i++) {
    // On last slot, apply pity guarantee
    const rarity = (pityActive && !hasRarePlus && i === pack.cardCount - 1)
      ? rollRarePlus()
      : rollRarity(pack.odds)

    if (['rare', 'epic', 'legendary'].includes(rarity)) hasRarePlus = true
    cards.push(pickCard(rarity))
  }

  return { cards, hasRarePlus }
}

function reducer(state, action) {
  switch (action.type) {

    case 'BUY_PACK': {
      const pack = PACKS[action.packId]
      if (state.coins < pack.price) return state
      return {
        ...state,
        coins: state.coins - pack.price,
        coinsSpent: state.coinsSpent + pack.price,
        packsOwned: { ...state.packsOwned, [action.packId]: state.packsOwned[action.packId] + 1 },
      }
    }

    case 'OPEN_PACK': {
      if (state.packsOwned[action.packId] < 1) return state
      const pityActive = state.packsSinceRare >= 10
      const { cards, hasRarePlus } = drawCards(PACKS[action.packId], pityActive)
      return {
        ...state,
        packsOwned: { ...state.packsOwned, [action.packId]: state.packsOwned[action.packId] - 1 },
        pendingCards: cards,
        totalPacks: state.totalPacks + 1,
        packsSinceRare: hasRarePlus ? 0 : state.packsSinceRare + 1,
        recentPulls: [...cards, ...state.recentPulls].slice(0, 20),
      }
    }

    case 'CONFIRM_CARDS': {
      if (!state.pendingCards) return state
      return {
        ...state,
        collection: [...state.collection, ...state.pendingCards],
        totalCards: state.totalCards + state.pendingCards.length,
        pendingCards: null,
      }
    }

    case 'SELL_CARD': {
      const card = state.collection.find(c => c.instanceId === action.instanceId)
      if (!card) return state
      const coins = RARITY_CONFIG[card.rarity].sellPrice
      return {
        ...state,
        coins: state.coins + coins,
        coinsEarned: state.coinsEarned + coins,
        totalSold: state.totalSold + 1,
        collection: state.collection.filter(c => c.instanceId !== action.instanceId),
      }
    }

    case 'SELL_DUPES': {
      // Keep 1 of each card.id, sell the rest (highest-rarity order kept)
      const seen = new Set()
      const keep = []
      const sell = []
      const sorted = [...state.collection].sort((a, b) => {
        const order = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 }
        return order[b.rarity] - order[a.rarity]
      })
      for (const c of sorted) {
        if (seen.has(c.id)) sell.push(c)
        else { seen.add(c.id); keep.push(c) }
      }
      if (!sell.length) return state
      const earned = sell.reduce((s, c) => s + RARITY_CONFIG[c.rarity].sellPrice, 0)
      return {
        ...state,
        collection: keep,
        coins: state.coins + earned,
        coinsEarned: state.coinsEarned + earned,
        totalSold: state.totalSold + sell.length,
      }
    }

    case 'CLAIM_DAILY': {
      if (!canClaimDaily(state.lastDailyClaim)) return state
      return {
        ...state,
        coins: state.coins + 500,
        coinsEarned: state.coinsEarned + 500,
        packsOwned: { ...state.packsOwned, booster: state.packsOwned.booster + 1 },
        lastDailyClaim: Date.now(),
      }
    }

    case 'AWARD_COINS': {
      return {
        ...state,
        coins: state.coins + action.amount,
        coinsEarned: state.coinsEarned + action.amount,
      }
    }

    case 'RECORD_BATTLE': {
      const newStreak = action.won ? state.battleStreak + 1 : 0
      return {
        ...state,
        battleWins: action.won ? state.battleWins + 1 : state.battleWins,
        battleLosses: action.won ? state.battleLosses : state.battleLosses + 1,
        battleStreak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
      }
    }

    case 'RESET':
      return { ...DEFAULT_STATE }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)
  useEffect(() => { saveState(state) }, [state])
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame outside GameProvider')
  return ctx
}
