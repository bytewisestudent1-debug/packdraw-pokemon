import { useState, useEffect } from 'react'
import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'
import { PACKS } from '../data/packs'
import { canClaimDaily, msUntilNextClaim } from '../lib/storage'

const RARITY_COLORS = {
  legendary: '#F472B6', epic: '#FBBF24', rare: '#60A5FA', uncommon: '#34D399', common: '#9CA3AF',
}

function OddsTable({ odds }) {
  return (
    <div className="space-y-1.5 mt-3">
      {Object.entries(RARITY_COLORS).map(([r, color]) => {
        const pct = (odds[r] || 0) * 100
        if (!pct) return null
        return (
          <div key={r} className="flex items-center gap-2">
            <span className="font-mono text-[9px] w-16 text-right uppercase" style={{ color }}>{r}</span>
            <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--line)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="font-mono text-[9px] w-7" style={{ color }}>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

function PackCard({ pack, canBuy, owned, onBuy, onOpen }) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${pack.gradFrom}, ${pack.gradTo})` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 9px)' }}
        />
        {/* Glow circle behind icon */}
        <div
          className="absolute"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${pack.accentColor}30 0%, transparent 70%)`,
          }}
        />
        <div className="relative text-center">
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 4 }}>{pack.icon}</div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: pack.accentColor + 'cc' }}>
            {pack.cardCount} cards
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl" style={{ color: 'var(--paper)' }}>{pack.name}</h3>
        <p className="font-body text-xs font-light mt-0.5" style={{ color: 'var(--muted)' }}>{pack.subtitle}</p>
        <OddsTable odds={pack.odds} />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onBuy}
            disabled={!canBuy}
            className="flex-1 py-3 font-mono text-xs tracking-widest uppercase transition-opacity duration-200"
            style={{
              background: canBuy ? pack.accentColor : 'var(--line)',
              color: canBuy ? '#111010' : 'var(--muted)',
              cursor: canBuy ? 'pointer' : 'not-allowed',
              opacity: canBuy ? 1 : 0.65,
            }}
          >
            Buy · {pack.price} 🪙
          </button>
          {owned > 0 && (
            <button
              onClick={onOpen}
              className="px-4 py-3 font-mono text-xs uppercase transition-all duration-200"
              style={{ border: '1px solid var(--amber)', color: 'var(--amber)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,160,69,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Open ×{owned}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatCountdown(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function Shop({ setPage }) {
  const { state, dispatch } = useGame()
  const toast = useToast()
  const [countdown, setCountdown] = useState(0)

  const claimable = canClaimDaily(state.lastDailyClaim)

  useEffect(() => {
    if (claimable) { setCountdown(0); return }
    const tick = () => setCountdown(msUntilNextClaim(state.lastDailyClaim))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state.lastDailyClaim, claimable])

  function buy(packId) {
    const pack = PACKS[packId]
    if (state.coins < pack.price) { toast('Not enough coins!', 'error'); return }
    dispatch({ type: 'BUY_PACK', packId })
    toast(`Bought ${pack.name}!`, 'success')
  }

  function open(packId) {
    dispatch({ type: 'OPEN_PACK', packId })
    setPage('opening')
  }

  function claimDaily() {
    dispatch({ type: 'CLAIM_DAILY' })
    toast('Daily reward claimed! +500🪙 +1 Booster Pack', 'coin')
  }

  const pityPct = Math.min((state.packsSinceRare / 10) * 100, 100)

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>Pack Shop</span>
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--paper)' }}>
          Choose Your Pack.
        </h1>
        <p className="text-sm font-body font-light mt-1" style={{ color: 'var(--muted)' }}>
          Balance: <span style={{ color: 'var(--amber)' }}>🪙 {state.coins.toLocaleString()}</span>
        </p>
      </div>

      {/* Daily reward + pity row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        {/* Daily reward */}
        <div
          className="p-5 rounded-xl flex items-center gap-4"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${claimable ? '#F59E0B' : 'var(--line)'}`,
            boxShadow: claimable ? '0 0 16px rgba(245,158,11,0.15)' : 'none',
          }}
        >
          <span style={{ fontSize: 32 }}>🎁</span>
          <div className="flex-1">
            <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Daily Reward</div>
            <div className="font-body font-semibold" style={{ color: 'var(--paper)', fontSize: 14 }}>
              500 🪙 + 1 Booster Pack
            </div>
            {!claimable && (
              <div className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Next: {formatCountdown(countdown)}
              </div>
            )}
          </div>
          <button
            onClick={claimDaily}
            disabled={!claimable}
            className="px-4 py-2.5 font-mono text-xs tracking-widest uppercase transition-all duration-200 shrink-0"
            style={{
              background: claimable ? '#F59E0B' : 'var(--line)',
              color: claimable ? '#111' : 'var(--muted)',
              cursor: claimable ? 'pointer' : 'not-allowed',
            }}
          >
            {claimable ? 'Claim' : 'Done'}
          </button>
        </div>

        {/* Pity counter */}
        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Rare Pity Counter
            </div>
            <span className="font-mono text-sm font-bold" style={{ color: '#60A5FA' }}>
              {state.packsSinceRare}/10
            </span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: 'var(--line)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pityPct}%`,
                background: pityPct >= 80
                  ? 'linear-gradient(90deg, #60A5FA, #F472B6)'
                  : '#60A5FA',
              }}
            />
          </div>
          <p className="font-body text-xs font-light" style={{ color: 'var(--muted)' }}>
            {state.packsSinceRare >= 10
              ? '⚡ Guaranteed Rare+ on next pack!'
              : `Open ${10 - state.packsSinceRare} more pack${10 - state.packsSinceRare !== 1 ? 's' : ''} to guarantee a Rare+.`}
          </p>
        </div>
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.values(PACKS).map(pack => (
          <PackCard
            key={pack.id}
            pack={pack}
            canBuy={state.coins >= pack.price}
            owned={state.packsOwned[pack.id]}
            onBuy={() => buy(pack.id)}
            onOpen={() => open(pack.id)}
          />
        ))}
      </div>

      {/* Inventory */}
      {Object.values(state.packsOwned).some(n => n > 0) && (
        <div
          className="px-5 py-4 rounded-xl flex flex-wrap items-center gap-x-6 gap-y-2"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Inventory</span>
          {Object.entries(state.packsOwned).map(([id, n]) =>
            n > 0 ? (
              <div key={id} className="flex items-center gap-1.5">
                <span className="font-body text-sm" style={{ color: 'var(--paper)' }}>{PACKS[id].name}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,160,69,0.15)', color: 'var(--amber)' }}>
                  ×{n}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
