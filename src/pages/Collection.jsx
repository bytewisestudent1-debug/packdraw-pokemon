import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'
import { RARITY_CONFIG, TYPE_CONFIG, CARDS } from '../data/cards'
import Card from '../components/Card'

const RARITY_ORDER = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 }

function PokedexGrid({ collection }) {
  const owned = new Set(collection.map(c => c.id))
  const byRarity = { legendary: [], epic: [], rare: [], uncommon: [], common: [] }
  for (const c of CARDS) byRarity[c.rarity].push(c)
  const ordered = [
    ...byRarity.legendary, ...byRarity.epic, ...byRarity.rare,
    ...byRarity.uncommon, ...byRarity.common,
  ]
  const uniqueCount = owned.size

  return (
    <div>
      {/* Progress */}
      <div
        className="flex items-center justify-between mb-4 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      >
        <div>
          <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
            Pokédex Progress
          </div>
          <div className="font-display text-3xl" style={{ color: 'var(--paper)' }}>
            {uniqueCount}<span className="text-xl" style={{ color: 'var(--muted)' }}>/50</span>
          </div>
        </div>
        <div className="w-48">
          <div className="h-2 rounded-full mb-1" style={{ background: 'var(--line)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(uniqueCount / 50) * 100}%`,
                background: 'linear-gradient(90deg, #60A5FA, #F472B6)',
              }}
            />
          </div>
          <div className="font-mono text-xs text-right" style={{ color: 'var(--muted)' }}>
            {Math.round((uniqueCount / 50) * 100)}% complete
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
        {ordered.map(card => {
          const isOwned = owned.has(card.id)
          const typeConf = TYPE_CONFIG[card.type] || TYPE_CONFIG.normal
          const rarCfg = RARITY_CONFIG[card.rarity]

          return (
            <div
              key={card.id}
              title={isOwned ? `${card.name} — ${rarCfg.label}` : '???'}
              className="rounded-lg overflow-hidden relative"
              style={{
                aspectRatio: '1',
                background: isOwned
                  ? `linear-gradient(145deg, ${typeConf.cardBg1}, ${typeConf.cardBg2})`
                  : '#1A1918',
                border: `1.5px solid ${isOwned ? rarCfg.color + '80' : 'var(--line)'}`,
                boxShadow: isOwned && ['epic','legendary'].includes(card.rarity)
                  ? `0 0 8px ${rarCfg.color}50`
                  : 'none',
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-1">
                <span
                  role="img"
                  style={{
                    fontSize: 20,
                    filter: isOwned ? 'none' : 'grayscale(1) brightness(0.3)',
                    lineHeight: 1,
                  }}
                >
                  {card.emoji}
                </span>
                <span
                  className="font-mono text-center leading-none"
                  style={{
                    fontSize: 6.5,
                    color: isOwned ? (typeConf.textDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.8)') : 'var(--muted)',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isOwned ? card.name : '???'}
                </span>
              </div>
              {!isOwned && (
                <div
                  className="absolute inset-0"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(1px)' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Collection({ setPage }) {
  const { state, dispatch } = useGame()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('rarity')
  const [view, setView] = useState('cards') // 'cards' | 'dex'
  const [search, setSearch] = useState('')

  const { collection } = state

  // Dupe count map
  const dupeMap = collection.reduce((m, c) => { m[c.id] = (m[c.id] || 0) + 1; return m }, {})
  const dupeCount = Object.values(dupeMap).reduce((s, n) => s + Math.max(0, n - 1), 0)
  const dupeValue = collection
    .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity])
    .reduce((acc, c) => {
      const seen = acc.seen
      if (seen.has(c.id)) acc.coins += RARITY_CONFIG[c.rarity].sellPrice
      else seen.add(c.id)
      return acc
    }, { seen: new Set(), coins: 0 }).coins

  const shown = collection
    .filter(c => filter === 'all' || c.rarity === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rarity')    return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]
      if (sort === 'name')      return a.name.localeCompare(b.name)
      if (sort === 'team')      return a.type.localeCompare(b.type)
      return b.obtainedAt - a.obtainedAt
    })

  function sell(instanceId) {
    const card = collection.find(c => c.instanceId === instanceId)
    if (card) {
      dispatch({ type: 'SELL_CARD', instanceId })
      toast(`Sold ${card.name} for ${RARITY_CONFIG[card.rarity].sellPrice} 🪙`, 'coin')
    }
  }

  function sellDupes() {
    if (!dupeCount) return
    dispatch({ type: 'SELL_DUPES' })
    toast(`Sold ${dupeCount} duplicates for ${dupeValue} 🪙!`, 'coin')
  }

  const filters = ['all', 'legendary', 'epic', 'rare', 'uncommon', 'common']
  const FCOLORS = {
    all: 'var(--muted)', legendary: '#F472B6', epic: '#FBBF24',
    rare: '#60A5FA', uncommon: '#34D399', common: '#9CA3AF',
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">

      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-6"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
            <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>My Collection</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--paper)' }}>
            {collection.length} {collection.length === 1 ? 'Card' : 'Cards'}
          </h1>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {new Set(collection.map(c => c.id)).size}/50 unique Pokémon discovered
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="font-mono text-xs px-3 py-2 outline-none"
            style={{
              background: 'var(--surface)',
              color: 'var(--paper)',
              border: '1px solid var(--line)',
              width: 120,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--line)')}
          />

          {/* View toggle */}
          <div className="flex" style={{ border: '1px solid var(--line)' }}>
            {[['cards', 'Cards'], ['dex', 'Pokédex']].map(([v, lbl]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200"
                style={{
                  background: view === v ? 'var(--amber)' : 'transparent',
                  color: view === v ? 'var(--ink)' : 'var(--muted)',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Sell dupes */}
          {dupeCount > 0 && view === 'cards' && (
            <button
              onClick={sellDupes}
              className="px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200"
              style={{ border: '1px solid #34D399', color: '#34D399', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Sell {dupeCount} Dupes (+{dupeValue}🪙)
            </button>
          )}

          {/* Sort (cards view only) */}
          {view === 'cards' && (
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="font-mono text-xs uppercase tracking-wider px-3 py-2 outline-none cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--line)' }}
            >
              <option value="rarity">Sort: Rarity</option>
              <option value="obtained">Sort: Newest</option>
              <option value="name">Sort: Name</option>
              <option value="team">Sort: Type</option>
            </select>
          )}
        </div>
      </div>

      {/* Pokédex view */}
      {view === 'dex' && <PokedexGrid collection={collection} />}

      {/* Cards view */}
      {view === 'cards' && (
        <>
          {/* Rarity filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map(r => {
              const count = r === 'all' ? collection.length : collection.filter(c => c.rarity === r).length
              const color = FCOLORS[r]
              const active = filter === r
              return (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-200"
                  style={{
                    border: `1px solid ${active ? color : 'var(--line)'}`,
                    color: active ? color : 'var(--muted)',
                    background: active ? color + '18' : 'transparent',
                  }}
                >
                  {r} ({count})
                </button>
              )
            })}
          </div>

          {collection.length === 0 && (
            <div className="text-center py-28">
              <p className="font-display text-3xl mb-3" style={{ color: 'var(--muted)' }}>No cards yet.</p>
              <p className="font-body text-sm font-light mb-8" style={{ color: 'var(--muted)' }}>Open your first pack to start collecting.</p>
              <button
                onClick={() => setPage('shop')}
                className="px-8 py-3 font-mono text-xs tracking-widest uppercase"
                style={{ background: 'var(--amber)', color: 'var(--ink)' }}
              >
                Go to Shop →
              </button>
            </div>
          )}

          {shown.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {shown.map(card => (
                <Card
                  key={card.instanceId}
                  card={card}
                  showSell
                  onSell={() => sell(card.instanceId)}
                  badge={dupeMap[card.id]}
                />
              ))}
            </div>
          )}

          {shown.length === 0 && collection.length > 0 && (
            <p className="text-center py-16 font-body font-light" style={{ color: 'var(--muted)' }}>
              No {filter} cards in your collection.
            </p>
          )}
        </>
      )}
    </div>
  )
}
