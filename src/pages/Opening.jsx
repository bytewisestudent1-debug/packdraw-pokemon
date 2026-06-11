import { useState, useEffect } from 'react'
import { useGame } from '../store/GameContext'
import { RARITY_CONFIG } from '../data/cards'
import Card from '../components/Card'
import CardBack from '../components/CardBack'

function FlipCard({ card, flipped, onClick }) {
  return (
    <div
      className="flip-card select-none"
      style={{
        width: 160,
        height: 224,
        cursor: flipped ? 'default' : 'pointer',
        transform: flipped ? undefined : undefined,
        transition: 'transform 0.15s ease',
      }}
      onClick={!flipped ? onClick : undefined}
      onMouseEnter={e => { if (!flipped) e.currentTarget.style.transform = 'scale(1.06) translateY(-4px)' }}
      onMouseLeave={e => { if (!flipped) e.currentTarget.style.transform = 'none' }}
    >
      <div className={`flip-card-inner${flipped ? ' is-flipped' : ''}`}>
        <div className="flip-card-back"><CardBack /></div>
        <div className="flip-card-front">
          <div
            style={{
              filter: flipped ? `drop-shadow(0 0 18px ${RARITY_CONFIG[card.rarity].color}80)` : 'none',
              transition: 'filter 0.4s ease 0.3s',
            }}
          >
            <Card card={card} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Opening({ setPage }) {
  const { state, dispatch } = useGame()
  const [phase, setPhase] = useState('intro')   // intro | reveal | done
  const [flipped, setFlipped] = useState(new Set())

  const cards = state.pendingCards

  useEffect(() => {
    if (!cards) setPage('shop')
  }, [])

  if (!cards) return null

  function startReveal() {
    setPhase('reveal')
    setFlipped(new Set())
  }

  function flipCard(i) {
    if (phase !== 'reveal') return
    setFlipped(prev => {
      const next = new Set(prev)
      next.add(i)
      if (next.size === cards.length) {
        setTimeout(() => setPhase('done'), 400)
      }
      return next
    })
  }

  function revealAll() {
    const all = new Set(cards.map((_, i) => i))
    setFlipped(all)
    setTimeout(() => setPhase('done'), 400)
  }

  function confirm() {
    dispatch({ type: 'CONFIRM_CARDS' })
    setPage('collection')
  }

  const best = cards.reduce((b, c) => {
    const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
    return order[c.rarity] > order[b.rarity] ? c : b
  }, cards[0])

  const unflippedCount = cards.length - flipped.size

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">

      {phase === 'intro' && (
        <div className="text-center anim-fade-up">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
            <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
              Pack Opening
            </span>
            <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
          </div>
          <h2
            className="font-display mb-6"
            style={{ fontSize: 'clamp(3rem,10vw,7rem)', color: 'var(--paper)', lineHeight: 0.9 }}
          >
            Ready to<br />
            <em className="not-italic" style={{ color: 'var(--amber)' }}>Rip It?</em>
          </h2>
          <p className="font-body font-light mb-10" style={{ color: 'var(--muted)' }}>
            {cards.length} cards waiting inside — click each one to reveal it.
          </p>
          <button
            onClick={startReveal}
            className="px-12 py-4 font-mono text-sm tracking-[0.2em] uppercase"
            style={{ background: 'var(--amber)', color: 'var(--ink)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Open Pack →
          </button>
        </div>
      )}

      {(phase === 'reveal' || phase === 'done') && (
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-8 px-2">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {flipped.size} / {cards.length} revealed
            </span>
            {unflippedCount > 0 && phase === 'reveal' && (
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                  👆 Click a card to flip it
                </span>
                <button
                  onClick={revealAll}
                  className="font-mono text-xs uppercase tracking-wider px-4 py-1.5 transition-all duration-200"
                  style={{ border: '1px solid var(--line)', color: 'var(--muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)' }}
                >
                  Reveal All →
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {cards.map((card, i) => (
              <FlipCard
                key={card.instanceId}
                card={card}
                flipped={flipped.has(i)}
                onClick={() => flipCard(i)}
              />
            ))}
          </div>

          {phase === 'done' && (
            <div className="text-center anim-fade-up">
              <div className="mb-6">
                <span
                  className="font-mono text-xs tracking-widest uppercase px-4 py-2"
                  style={{
                    color: RARITY_CONFIG[best.rarity].color,
                    border: `1px solid ${RARITY_CONFIG[best.rarity].color}55`,
                    background: RARITY_CONFIG[best.rarity].color + '18',
                  }}
                >
                  Best Pull: {best.name} — {RARITY_CONFIG[best.rarity].label}
                </span>
              </div>
              <button
                onClick={confirm}
                className="px-10 py-3.5 font-mono text-sm tracking-[0.2em] uppercase"
                style={{ background: 'var(--amber)', color: 'var(--ink)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Add to Collection →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
