import { useState, useEffect } from 'react'
import { useGame } from '../store/GameContext'
import { RARITY_CONFIG } from '../data/cards'
import Card from '../components/Card'
import CardBack from '../components/CardBack'

function FlipCard({ card, flipped }) {
  return (
    <div className="flip-card" style={{ width: 160, height: 224 }}>
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
  const [flipIdx, setFlipIdx] = useState(-1)

  const cards = state.pendingCards

  useEffect(() => {
    if (!cards) setPage('shop')
  }, [])

  if (!cards) return null

  function startReveal() {
    setPhase('reveal')
    cards.forEach((_, i) => {
      setTimeout(() => setFlipIdx(i), i * 650)
    })
    setTimeout(() => setPhase('done'), cards.length * 650 + 400)
  }

  function confirm() {
    dispatch({ type: 'CONFIRM_CARDS' })
    setPage('collection')
  }

  const best = cards.reduce((b, c) => {
    const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
    return order[c.rarity] > order[b.rarity] ? c : b
  }, cards[0])

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
            {cards.length} cards waiting inside.
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
          <div className="text-center mb-8">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {Math.min(flipIdx + 1, cards.length)} / {cards.length} revealed
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {cards.map((card, i) => (
              <FlipCard key={card.instanceId} card={card} flipped={i <= flipIdx} />
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
