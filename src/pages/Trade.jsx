import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'
import { CARDS, RARITY_CONFIG, TYPE_CONFIG } from '../data/cards'
import Card from '../components/Card'

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
const RARITY_VALUE = { common: 50, uncommon: 120, rare: 300, epic: 700, legendary: 1800 }

const TRADERS = [
  {
    id: 'ash',
    name: 'Ash Ketchum',
    avatar: '🧢',
    tagline: '"Gotta catch \'em all!"',
    desc: 'Straightforward, fair deals. Wants strong cards for his journey.',
    style: { from: '#3B82F6', to: '#1D4ED8' },
    offerBias: null,
  },
  {
    id: 'misty',
    name: 'Misty',
    avatar: '🌊',
    tagline: '"Water types rule!"',
    desc: 'Obsessed with Water Pokémon. Pays a coin bonus to get them.',
    style: { from: '#06B6D4', to: '#0369A1' },
    offerBias: 'water',
  },
  {
    id: 'giovanni',
    name: 'Giovanni',
    avatar: '😈',
    tagline: '"Everything has a price."',
    desc: 'Has rare cards — but always wants something valuable in return.',
    style: { from: '#7C3AED', to: '#4C1D95' },
    offerBias: 'legendary',
  },
]

function generateOffers(trader, collection) {
  if (collection.length === 0) return []

  const offers = []
  const usedInstanceIds = new Set()

  for (let attempt = 0; attempt < 30 && offers.length < 3; attempt++) {
    let pool = [...CARDS]
    if (trader.id === 'giovanni') {
      pool = CARDS.filter(c => ['epic', 'legendary'].includes(c.rarity))
    } else if (trader.id === 'misty') {
      const waterCards = CARDS.filter(c => c.type === 'water')
      const others = CARDS.filter(c => c.type !== 'water')
      pool = [...waterCards, ...waterCards, ...others] // water cards appear 2x more
    }

    const theirCard = pool[Math.floor(Math.random() * pool.length)]
    const theirRank = RARITY_ORDER[theirCard.rarity]

    // Giovanni wants cards at same rarity or better; others want ±1 rarity
    const wantableRarities = trader.id === 'giovanni'
      ? Object.keys(RARITY_ORDER).filter(r => RARITY_ORDER[r] >= theirRank - 1)
      : Object.keys(RARITY_ORDER).filter(r => Math.abs(RARITY_ORDER[r] - theirRank) <= 1)

    const candidates = collection.filter(
      c => wantableRarities.includes(c.rarity) && !usedInstanceIds.has(c.instanceId)
    )
    if (candidates.length === 0) continue

    const wantCard = candidates[Math.floor(Math.random() * candidates.length)]
    usedInstanceIds.add(wantCard.instanceId)

    // Coin delta balances unequal rarity; Misty pays extra for water
    const theirValue = RARITY_VALUE[theirCard.rarity]
    const wantValue = RARITY_VALUE[wantCard.rarity]
    let coinDelta = Math.round((wantValue - theirValue) * 0.35)
    if (trader.id === 'misty' && wantCard.type === 'water') {
      coinDelta += Math.round(wantValue * 0.25)
    }

    offers.push({ id: `${attempt}_${theirCard.id}`, theirCard, wantCard, coinDelta })
  }

  return offers
}

function MiniCard({ card, label }) {
  const typeConf = TYPE_CONFIG[card.type]
  const rarCfg = RARITY_CONFIG[card.rarity]
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div
        className="rounded-xl p-3 flex flex-col items-center gap-1.5"
        style={{
          background: `linear-gradient(135deg, ${typeConf?.cardBg1}22, ${typeConf?.cardBg2}33)`,
          border: `1.5px solid ${rarCfg.color}55`,
          width: 112,
        }}
      >
        <div style={{ fontSize: 30 }}>{card.emoji}</div>
        <div className="font-display text-center text-sm leading-tight" style={{ color: 'var(--paper)' }}>
          {card.name}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: rarCfg.color }}>
          {rarCfg.label}
        </div>
        <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>
          {card.hp} HP · {typeConf?.emoji}
        </div>
      </div>
    </div>
  )
}

function OfferRow({ offer, onAccept }) {
  const coinColor = offer.coinDelta >= 0 ? '#4ADE80' : '#EF4444'
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      <MiniCard card={offer.theirCard} label="They offer" />

      <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
        <div className="font-mono text-2xl" style={{ color: 'var(--amber)' }}>⇄</div>
        {offer.coinDelta !== 0 && (
          <div className="font-mono text-xs font-bold" style={{ color: coinColor }}>
            {offer.coinDelta > 0 ? `+${offer.coinDelta}` : offer.coinDelta} 🪙
          </div>
        )}
        <button
          onClick={() => onAccept(offer)}
          className="px-5 py-2 font-mono text-xs tracking-widest uppercase rounded-lg transition-opacity duration-200"
          style={{ background: 'var(--amber)', color: 'var(--ink)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Accept
        </button>
      </div>

      <MiniCard card={offer.wantCard} label="They want" />
    </div>
  )
}

function Hub({ onVisit, tradesCompleted }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
        <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
          Trading Post
        </span>
        <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
      </div>

      <h1
        className="font-display mb-3 text-center"
        style={{ fontSize: 'clamp(4rem,12vw,7rem)', color: 'var(--paper)', lineHeight: 0.88 }}
      >
        Trade.
      </h1>
      <p className="font-body font-light text-center mb-2" style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto 8px' }}>
        Visit a trader and swap cards from your collection. Each trader has unique preferences.
      </p>

      {tradesCompleted > 0 && (
        <p className="font-mono text-xs text-center mt-3 mb-2" style={{ color: 'var(--amber)' }}>
          {tradesCompleted} trade{tradesCompleted !== 1 ? 's' : ''} completed
        </p>
      )}

      <div className="flex flex-col gap-4 mt-8">
        {TRADERS.map(trader => (
          <button
            key={trader.id}
            onClick={() => onVisit(trader)}
            className="flex items-center gap-5 p-5 rounded-xl text-left transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${trader.style.from}18, ${trader.style.to}22)`,
              border: `1px solid ${trader.style.from}44`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = trader.style.from + '88')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = trader.style.from + '44')}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${trader.style.from}, ${trader.style.to})`,
                fontSize: 28,
              }}
            >
              {trader.avatar}
            </div>
            <div className="flex-1">
              <div className="font-display text-xl mb-0.5" style={{ color: 'var(--paper)' }}>{trader.name}</div>
              <div className="font-mono text-xs mb-1" style={{ color: trader.style.from }}>{trader.tagline}</div>
              <div className="font-body text-xs font-light" style={{ color: 'var(--muted)' }}>{trader.desc}</div>
            </div>
            <span className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>Visit →</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Offers({ trader, offers, onAccept, onBack, noCards, onRefresh }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
      <button
        onClick={onBack}
        className="font-mono text-xs uppercase tracking-wider mb-6 block transition-colors duration-200"
        style={{ color: 'var(--muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        ← Trading Post
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${trader.style.from}, ${trader.style.to})`,
            fontSize: 24,
          }}
        >
          {trader.avatar}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-2xl" style={{ color: 'var(--paper)' }}>
            {trader.name}'s Offers
          </h2>
          <p className="font-mono text-xs" style={{ color: trader.style.from }}>{trader.tagline}</p>
        </div>
        <button
          onClick={onRefresh}
          className="font-mono text-xs uppercase tracking-wider transition-colors duration-200"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ↺ Refresh
        </button>
      </div>

      {noCards ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p className="font-body font-light" style={{ color: 'var(--muted)' }}>
            You need cards to trade. Open some packs first!
          </p>
        </div>
      ) : offers.length === 0 ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <p className="font-body font-light" style={{ color: 'var(--muted)' }}>
            No compatible offers right now. Try refreshing or opening more packs!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>
            {offers.length} active offer{offers.length !== 1 ? 's' : ''} · Accepting removes the card from your collection
          </p>
          {offers.map(offer => (
            <OfferRow key={offer.id} offer={offer} onAccept={onAccept} />
          ))}
        </div>
      )}
    </div>
  )
}

function TradeResult({ result, trader, onMoreTrades, onHub }) {
  return (
    <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
      <div style={{ fontSize: 56, marginBottom: 12 }}>🤝</div>
      <h2
        className="font-display mb-4"
        style={{ fontSize: 'clamp(3rem,8vw,5rem)', color: '#22C55E', lineHeight: 0.88 }}
      >
        Trade Complete!
      </h2>
      <p className="font-body font-light mb-6" style={{ color: 'var(--muted)' }}>
        You gave away <strong style={{ color: 'var(--paper)' }}>{result.gave.name}</strong> and received:
      </p>

      <div className="flex justify-center mb-6">
        <Card card={result.received} />
      </div>

      {result.coinDelta !== 0 && (
        <div
          className="inline-block font-mono px-6 py-3 rounded-xl mb-6"
          style={{ background: 'rgba(232,160,69,0.12)', border: '1px solid rgba(232,160,69,0.3)' }}
        >
          <span style={{ color: result.coinDelta > 0 ? '#4ADE80' : '#EF4444', fontWeight: 'bold' }}>
            {result.coinDelta > 0 ? '+' : ''}{result.coinDelta} 🪙
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 items-center mt-4">
        <button
          onClick={onMoreTrades}
          className="w-full max-w-xs px-10 py-3.5 font-mono text-sm tracking-widest uppercase"
          style={{ background: 'var(--amber)', color: 'var(--ink)' }}
        >
          More Trades with {trader.name}
        </button>
        <button
          onClick={onHub}
          className="font-mono text-xs uppercase tracking-wider mt-1 transition-colors duration-200"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← Trading Post
        </button>
      </div>
    </div>
  )
}

export default function Trade() {
  const { state, dispatch } = useGame()
  const toast = useToast()

  const [screen, setScreen] = useState('hub')
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [offers, setOffers] = useState([])
  const [tradeResult, setTradeResult] = useState(null)

  function visitTrader(trader) {
    setSelectedTrader(trader)
    setOffers(generateOffers(trader, state.collection))
    setScreen('offers')
  }

  function refreshOffers() {
    setOffers(generateOffers(selectedTrader, state.collection))
  }

  function handleAccept(offer) {
    dispatch({
      type: 'EXECUTE_TRADE',
      giveInstanceId: offer.wantCard.instanceId,
      receiveCard: offer.theirCard,
      coinDelta: offer.coinDelta,
    })
    setTradeResult({ gave: offer.wantCard, received: offer.theirCard, coinDelta: offer.coinDelta })
    toast(`Trade complete! Got ${offer.theirCard.name}!`, 'coin')
    setScreen('result')
  }

  if (screen === 'hub') {
    return <Hub onVisit={visitTrader} tradesCompleted={state.tradesCompleted || 0} />
  }

  if (screen === 'offers') {
    return (
      <Offers
        trader={selectedTrader}
        offers={offers}
        onAccept={handleAccept}
        onBack={() => setScreen('hub')}
        onRefresh={refreshOffers}
        noCards={state.collection.length === 0}
      />
    )
  }

  if (screen === 'result' && tradeResult) {
    return (
      <TradeResult
        result={tradeResult}
        trader={selectedTrader}
        onMoreTrades={() => visitTrader(selectedTrader)}
        onHub={() => setScreen('hub')}
      />
    )
  }

  return null
}
