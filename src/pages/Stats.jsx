import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'
import { RARITY_CONFIG, TYPE_CONFIG, CARDS } from '../data/cards'
import Card from '../components/Card'

export default function Stats({ setPage }) {
  const { state, dispatch } = useGame()
  const toast = useToast()
  const { collection, coins, totalPacks, totalCards, totalSold, coinsEarned, coinsSpent, recentPulls } = state

  const rarityCounts = Object.fromEntries(
    Object.keys(RARITY_CONFIG).map(r => [r, collection.filter(c => c.rarity === r).length])
  )

  const typeCounts = Object.keys(TYPE_CONFIG).map(type => ({
    type,
    count: collection.filter(c => c.type === type).length,
    conf: TYPE_CONFIG[type],
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count)

  const collectionValue = collection.reduce((s, c) => s + RARITY_CONFIG[c.rarity].sellPrice, 0)
  const uniqueCount = new Set(collection.map(c => c.id)).size

  const best = collection.length
    ? collection.reduce((b, c) =>
        RARITY_CONFIG[c.rarity].sellPrice > RARITY_CONFIG[b.rarity].sellPrice ? c : b
      , collection[0])
    : null

  // Pack efficiency: coins spent vs collection value
  const roi = coinsSpent > 0 ? ((collectionValue / coinsSpent) * 100).toFixed(0) : '—'

  function reset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      dispatch({ type: 'RESET' })
      toast('Progress reset.', 'info')
    }
  }

  const tiles = [
    { label: 'Balance',          value: `${coins.toLocaleString()} 🪙`,               sub: 'current' },
    { label: 'Packs Opened',     value: totalPacks,                                     sub: 'all time' },
    { label: 'Cards Owned',      value: collection.length,                              sub: `${totalCards} total pulled` },
    { label: 'Unique Pokémon',   value: `${uniqueCount}/50`,                            sub: `${Math.round((uniqueCount/50)*100)}% complete` },
    { label: 'Cards Sold',       value: totalSold,                                      sub: `${(coinsEarned - 1000).toLocaleString()}🪙 earned` },
    { label: 'Collection Value', value: `${collectionValue.toLocaleString()} 🪙`,       sub: 'at sell prices' },
    { label: 'Coins Spent',      value: `${coinsSpent.toLocaleString()} 🪙`,           sub: 'on packs' },
    { label: 'Pack ROI',         value: `${roi}%`,                                      sub: 'value vs cost' },
    { label: 'Pity Counter',     value: `${state.packsSinceRare}/10`,                  sub: state.packsSinceRare >= 10 ? '⚡ Rare guaranteed!' : 'packs since last rare' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>Statistics</span>
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--paper)' }}>
          Your Overview.
        </h1>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {tiles.map(t => (
          <div key={t.label} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="font-mono text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>{t.label}</div>
            <div className="font-display text-3xl mb-1" style={{ color: 'var(--paper)' }}>{t.value}</div>
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-col: rarity + type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Rarity breakdown */}
        <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--muted)' }}>Rarity Breakdown</div>
          <div className="space-y-3">
            {Object.entries(RARITY_CONFIG).reverse().map(([key, cfg]) => {
              const count = rarityCounts[key] || 0
              const pct = collection.length ? (count / collection.length) * 100 : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-20 text-right uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--line)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
                  </div>
                  <span className="font-mono text-sm w-6 text-right" style={{ color: cfg.color }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Type breakdown */}
        <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--muted)' }}>Type Breakdown</div>
          {typeCounts.length === 0 && (
            <p className="font-body text-sm font-light" style={{ color: 'var(--muted)' }}>Open some packs first!</p>
          )}
          <div className="space-y-2">
            {typeCounts.slice(0, 8).map(({ type, count, conf }) => {
              const pct = collection.length ? (count / collection.length) * 100 : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{conf.emoji}</span>
                  <span className="font-mono text-xs w-16 uppercase" style={{ color: 'var(--muted)' }}>{conf.label}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--line)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${conf.cardBg1}, ${conf.cardBg2})` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-5 text-right" style={{ color: 'var(--muted)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Best card */}
      {best && (
        <div
          className="flex items-center gap-5 p-5 rounded-xl mb-6"
          style={{ background: 'var(--surface)', border: `1px solid ${RARITY_CONFIG[best.rarity].color}50` }}
        >
          <Card card={best} />
          <div>
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Best Card</div>
            <div className="font-display text-3xl mb-1" style={{ color: 'var(--paper)' }}>{best.name}</div>
            <div className="font-mono text-sm mb-3" style={{ color: RARITY_CONFIG[best.rarity].color }}>
              {RARITY_CONFIG[best.rarity].label} · {best.type} · {RARITY_CONFIG[best.rarity].sellPrice} 🪙
            </div>
            <div className="flex gap-4">
              {[['HP', best.hp], ...Object.entries(best.stats || {}).map(([k,v]) => [k.toUpperCase(), v])].map(([l,v]) => (
                <div key={l} className="text-center">
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--paper)' }}>{v}</div>
                  <div className="font-mono text-xs uppercase" style={{ color: 'var(--muted)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent pulls */}
      {recentPulls.length > 0 && (
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Recent Pulls</div>
          <div className="flex flex-wrap gap-3">
            {recentPulls.slice(0, 10).map(card => (
              <div
                key={card.instanceId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'var(--surface)', border: `1px solid ${RARITY_CONFIG[card.rarity].color}40` }}
              >
                <span style={{ fontSize: 16 }}>{TYPE_CONFIG[card.type]?.emoji}</span>
                <div>
                  <div className="font-body text-xs font-semibold" style={{ color: 'var(--paper)' }}>{card.name}</div>
                  <div className="font-mono" style={{ fontSize: 9, color: RARITY_CONFIG[card.rarity].color }}>{RARITY_CONFIG[card.rarity].label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={reset}
        className="font-mono text-xs uppercase tracking-wider px-5 py-3 transition-colors duration-200"
        style={{ border: '1px solid var(--line)', color: 'var(--muted)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)' }}
      >
        Reset All Progress
      </button>
    </div>
  )
}
