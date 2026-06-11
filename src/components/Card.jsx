import { RARITY_CONFIG, TYPE_CONFIG } from '../data/cards'

const HOLO = new Set(['rare', 'epic', 'legendary'])

function EnergyCost({ count }) {
  return (
    <span style={{ fontSize: 8, letterSpacing: '0.5px', opacity: 0.65 }}>
      {'⬡'.repeat(Math.min(count, 5))}
    </span>
  )
}

export default function Card({ card, showSell = false, onSell, badge }) {
  const rarity   = RARITY_CONFIG[card.rarity]
  const typeConf = TYPE_CONFIG[card.type] || TYPE_CONFIG.normal
  const holo     = HOLO.has(card.rarity)
  const dark     = !typeConf.textDark
  const textCol  = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)'
  const subCol   = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.52)'
  const lineCol  = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.11)'
  const artBg    = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'

  return (
    <div
      className="relative flex-shrink-0 select-none"
      style={{
        width: 160,
        height: 224,
        borderRadius: 10,
        border: `2.5px solid ${rarity.color}`,
        background: `linear-gradient(165deg, ${typeConf.cardBg1} 0%, ${typeConf.cardBg2} 100%)`,
        boxShadow: holo
          ? `0 0 22px ${rarity.color}66, 0 6px 22px rgba(0,0,0,0.45)`
          : '0 6px 18px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Holo shimmer */}
      {holo && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(135deg,
              transparent 0%,
              rgba(255,255,255,0.1) 18%,
              ${rarity.color}30 36%,
              rgba(150,230,255,0.15) 52%,
              rgba(255,120,220,0.12) 68%,
              transparent 85%)`,
            backgroundSize: '200% 200%',
            animation: 'holo 4s ease-in-out infinite',
          }}
        />
      )}

      <div className="relative z-10 h-full flex flex-col" style={{ padding: '5px 6px 4px' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex flex-col leading-none">
            <span className="font-mono uppercase" style={{ fontSize: 7, color: subCol, letterSpacing: '0.04em' }}>
              {card.stage}
            </span>
            <span
              className="font-body font-bold leading-tight"
              style={{ fontSize: card.name.length > 9 ? 10 : 12, color: textCol, letterSpacing: '-0.02em' }}
            >
              {card.name}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
            <span className="font-mono font-bold" style={{ fontSize: 8, color: '#DD2200' }}>HP</span>
            <span className="font-mono font-bold" style={{ fontSize: 13, color: '#DD2200', lineHeight: 1 }}>{card.hp}</span>
            <span style={{ fontSize: 12, marginLeft: 2 }}>{typeConf.emoji}</span>
          </div>
        </div>

        {/* Art */}
        <div
          className="relative flex items-center justify-center mb-1.5 flex-shrink-0 overflow-hidden"
          style={{ height: 82, background: artBg, border: `1.5px solid ${lineCol}`, borderRadius: 5 }}
        >
          <span role="img" style={{ fontSize: 44, lineHeight: 1 }}>{card.emoji}</span>
          <span className="absolute font-mono" style={{ fontSize: 6.5, color: subCol, bottom: 3, left: 5 }}>
            {card.species}
          </span>
          <span className="absolute font-mono font-bold" style={{ fontSize: 8, color: rarity.color, bottom: 3, right: 5 }}>
            {rarity.symbol}
          </span>
        </div>

        {/* Attacks */}
        <div className="flex flex-col gap-0.5 flex-1">
          {card.attacks.slice(0, 2).map((atk, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-1.5 py-1"
              style={{
                background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.28)',
                borderRadius: 3,
                border: `1px solid ${lineCol}`,
              }}
            >
              <div className="flex items-center gap-1 min-w-0">
                <EnergyCost count={atk.cost} />
                <span className="font-body font-semibold truncate" style={{ fontSize: 8.5, color: textCol }}>
                  {atk.name}
                </span>
              </div>
              <span className="font-mono font-bold ml-1 shrink-0" style={{ fontSize: 12, color: textCol }}>
                {atk.damage}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-1 pt-1"
          style={{ borderTop: `1px solid ${lineCol}` }}
        >
          <span className="font-mono" style={{ fontSize: 7, color: subCol }}>Weak: {card.weakness}×2</span>
          <span className="font-mono" style={{ fontSize: 7, color: subCol }}>{'●'.repeat(Math.max(1, card.retreat || 1))}</span>
        </div>
      </div>

      {/* Dupe badge */}
      {badge > 1 && (
        <div
          className="absolute top-1.5 left-1.5 z-20 font-mono font-bold rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, width: 18, height: 18 }}
        >
          ×{badge}
        </div>
      )}

      {/* Sell overlay */}
      {showSell && onSell && (
        <button
          onClick={e => { e.stopPropagation(); onSell() }}
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.82)', borderRadius: 8 }}
        >
          <div className="text-center">
            <div className="font-mono uppercase tracking-widest mb-1" style={{ fontSize: 9, color: '#E8A045' }}>Sell Card</div>
            <div className="font-mono text-white font-bold text-sm">{rarity.sellPrice} 🪙</div>
          </div>
        </button>
      )}
    </div>
  )
}
