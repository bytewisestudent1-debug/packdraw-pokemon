import { useState, useEffect, useRef } from 'react'
import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'
import { CARDS, RARITY_CONFIG, TYPE_CONFIG } from '../data/cards'
import Card from '../components/Card'

// ── Pure helpers ──────────────────────────────────────────────────────────────

function calcDamage(attacker, defender, atkIdx) {
  const atk = attacker.attacks[atkIdx]
  if (!atk) return { damage: 5, isCrit: false, isWeakness: false }
  const base = parseInt(atk.damage) || 0
  const effective = base === 0 ? 5 : base
  const attackerEmoji = TYPE_CONFIG[attacker.type]?.emoji
  const isWeakness = defender.weakness === attackerEmoji
  const isCrit = Math.random() < 0.10
  const variance = 0.88 + Math.random() * 0.24
  const damage = Math.round(effective * variance * (isCrit ? 1.5 : 1) * (isWeakness ? 2 : 1))
  return { damage: Math.max(1, damage), isCrit, isWeakness }
}

function aiPick(card, playerHpPct) {
  const atks = card.attacks.slice(0, 2)
  if (atks.length === 1) return 0
  const dmgs = atks.map(a => parseInt(a.damage) || 0)
  if (playerHpPct < 0.3 && Math.random() < 0.7) return dmgs[0] >= dmgs[1] ? 0 : 1
  return Math.floor(Math.random() * atks.length)
}

function randomOpponent() {
  return CARDS[Math.floor(Math.random() * CARDS.length)]
}

function battleReward(rarity, streak) {
  const base = { common: 25, uncommon: 65, rare: 140, epic: 350, legendary: 900 }
  return (base[rarity] || 25) + Math.max(0, streak - 1) * 50
}

// ── Reusable UI pieces ────────────────────────────────────────────────────────

function HpBar({ current, max }) {
  const pct = Math.max(0, (current / max) * 100)
  const color = pct > 50 ? '#22C55E' : pct > 25 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ width: 180 }}>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>HP</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {Math.max(0, current)}/{max}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.5s ease, background 0.4s ease' }}
        />
      </div>
    </div>
  )
}

function BattleLog({ messages }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages])

  const colorFor = msg => {
    if (msg.includes('SUPER EFFECTIVE')) return '#F59E0B'
    if (msg.includes('CRIT'))            return '#F472B6'
    if (msg.includes('fainted'))         return '#EF4444'
    if (msg.includes('💚') || msg.includes('healed')) return '#4ADE80'
    if (msg.includes('⚔️'))              return '#34D399'
    if (msg.startsWith('→'))             return 'var(--paper)'
    return 'var(--muted)'
  }

  return (
    <div
      ref={ref}
      className="px-4 py-3 rounded-xl overflow-y-auto"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)', height: 110 }}
    >
      {messages.map((msg, i) => (
        <div key={i} className="font-mono text-xs leading-relaxed" style={{ color: colorFor(msg) }}>
          {msg}
        </div>
      ))}
    </div>
  )
}

// ── Hub ───────────────────────────────────────────────────────────────────────

function Hub({ stats, onEnter, setPage }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16 text-center">
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
        <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
          Battle Arena
        </span>
        <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
      </div>

      <h1
        className="font-display mb-5"
        style={{ fontSize: 'clamp(4rem,12vw,8rem)', color: 'var(--paper)', lineHeight: 0.88 }}
      >
        Battle.
      </h1>
      <p className="font-body font-light mb-8" style={{ color: 'var(--muted)', maxWidth: 380, margin: '0 auto 32px' }}>
        Pick a Pokémon from your collection and fight AI opponents to earn coins.
        Type weaknesses deal <strong style={{ color: 'var(--paper)' }}>2×</strong> damage.
        Critical hits deal <strong style={{ color: 'var(--paper)' }}>1.5×</strong>.
      </p>

      {/* Rewards table */}
      <div
        className="text-left mx-auto mb-8 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', maxWidth: 380 }}
      >
        <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
          Win Rewards
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            ['Common', '25🪙', '#9CA3AF'],
            ['Uncommon', '65🪙', '#34D399'],
            ['Rare', '140🪙', '#60A5FA'],
            ['Holo Rare', '350🪙', '#FBBF24'],
            ['Secret Rare', '900🪙', '#F472B6'],
          ].map(([r, coins, color]) => (
            <div key={r} className="flex justify-between">
              <span className="font-mono text-xs" style={{ color }}>{r}</span>
              <span className="font-mono text-xs font-bold" style={{ color }}>{coins}</span>
            </div>
          ))}
          <div className="col-span-2 font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
            + 50🪙 per consecutive win
          </div>
        </div>
      </div>

      {/* Battle stats */}
      {(stats.wins > 0 || stats.losses > 0) && (
        <div className="flex justify-center gap-10 mb-8">
          {[
            { label: 'Wins',        value: stats.wins,       color: '#22C55E' },
            { label: 'Losses',      value: stats.losses,     color: '#EF4444' },
            { label: 'Best Streak', value: stats.bestStreak, color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="font-mono text-xs uppercase" style={{ color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {stats.noCards ? (
        <div>
          <p className="font-body font-light mb-5" style={{ color: '#EF4444' }}>
            You need at least one card to battle!
          </p>
          <button
            onClick={() => setPage('shop')}
            className="px-8 py-4 font-mono text-sm tracking-widest uppercase"
            style={{ background: 'var(--amber)', color: 'var(--ink)' }}
          >
            Go to Shop →
          </button>
        </div>
      ) : (
        <button
          onClick={onEnter}
          className="px-14 py-4 font-mono text-sm tracking-[0.2em] uppercase transition-opacity duration-200"
          style={{ background: 'var(--amber)', color: 'var(--ink)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Enter the Arena ⚔️
        </button>
      )}
    </div>
  )
}

// ── Pokémon Select ────────────────────────────────────────────────────────────

function Select({ collection, onPick, onBack }) {
  const [chosen, setChosen] = useState(null)

  // Deduplicate by id, keep highest rarity copy
  const rarityOrder = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 }
  const unique = Object.values(
    collection.reduce((m, c) => {
      if (!m[c.id] || rarityOrder[c.rarity] > rarityOrder[m[c.id].rarity]) m[c.id] = c
      return m
    }, {})
  ).sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="font-mono text-xs uppercase tracking-wider transition-colors duration-200"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← Back
        </button>
      </div>

      <h2
        className="font-display mb-1"
        style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--paper)' }}
      >
        Choose Your Fighter.
      </h2>
      <p className="font-body text-sm font-light mb-8" style={{ color: 'var(--muted)' }}>
        {unique.length} unique Pokémon available · Type advantages matter!
      </p>

      <div className="flex flex-wrap gap-4 mb-8">
        {unique.map(card => (
          <div
            key={card.id}
            onClick={() => setChosen(card)}
            className="cursor-pointer transition-transform duration-150 hover:scale-105"
            style={{
              outline: chosen?.id === card.id ? '3px solid #E8A045' : '3px solid transparent',
              borderRadius: 13,
            }}
          >
            <Card card={card} />
          </div>
        ))}
      </div>

      <div
        className="sticky bottom-6 flex items-center gap-5 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', backdropFilter: 'blur(8px)' }}
      >
        {chosen ? (
          <>
            <span style={{ fontSize: 28 }}>{TYPE_CONFIG[chosen.type]?.emoji}</span>
            <div className="flex-1">
              <div className="font-display text-xl" style={{ color: 'var(--paper)' }}>{chosen.name}</div>
              <div className="font-mono text-xs" style={{ color: RARITY_CONFIG[chosen.rarity].color }}>
                {RARITY_CONFIG[chosen.rarity].label} · {chosen.type} · {chosen.hp} HP
              </div>
            </div>
            <button
              onClick={() => onPick(chosen)}
              className="px-8 py-3 font-mono text-sm tracking-widest uppercase"
              style={{ background: 'var(--amber)', color: 'var(--ink)' }}
            >
              Battle! ⚔️
            </button>
          </>
        ) : (
          <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            Select a Pokémon above to continue…
          </span>
        )}
      </div>
    </div>
  )
}

// ── Fight ─────────────────────────────────────────────────────────────────────

function Fight({ battle, streak, onAttack, onHeal, onRun }) {
  const {
    playerCard, opponentCard,
    playerHp, opponentHp, playerMaxHp, opponentMaxHp,
    log, playerTurn, processing,
    shakingPlayer, shakingOpponent,
    healUsed,
  } = battle

  const typeConf = TYPE_CONFIG[playerCard.type]
  const healAmount = Math.round(playerMaxHp * 0.30)
  const healDisabled = !playerTurn || processing || healUsed

  return (
    <div
      className="max-w-2xl mx-auto px-4 pb-8 flex flex-col gap-4"
      style={{ paddingTop: 88, minHeight: '100vh' }}
    >
      {/* Streak */}
      {streak > 1 && (
        <div className="text-center">
          <span
            className="font-mono text-xs px-3 py-1.5 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            🔥 {streak} Win Streak!
          </span>
        </div>
      )}

      {/* Opponent */}
      <div
        className={`flex flex-col items-center gap-3 ${shakingOpponent ? 'card-shake' : ''}`}
        style={{ transition: 'opacity 0.3s' }}
      >
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Opponent — {RARITY_CONFIG[opponentCard.rarity].label}
        </div>
        <Card card={opponentCard} />
        <HpBar current={opponentHp} max={opponentMaxHp} />
      </div>

      {/* Battle log */}
      <BattleLog messages={log} />

      {/* Player */}
      <div className={`flex flex-col items-center gap-3 ${shakingPlayer ? 'card-shake' : ''}`}>
        <HpBar current={playerHp} max={playerMaxHp} />
        <Card card={playerCard} />
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Your Pokémon
        </div>
      </div>

      {/* Attacks */}
      <div className="grid grid-cols-2 gap-3">
        {playerCard.attacks.slice(0, 2).map((atk, i) => {
          const disabled = !playerTurn || processing
          const dmgNum = parseInt(atk.damage) || 0
          return (
            <button
              key={i}
              onClick={() => !disabled && onAttack(i)}
              disabled={disabled}
              className="px-4 py-3 text-left rounded-xl transition-all duration-200"
              style={{
                background: disabled ? 'var(--line)' : 'var(--surface)',
                border: `1.5px solid ${disabled ? 'transparent' : typeConf?.cardBg2 || 'var(--line)'}`,
                color: disabled ? 'var(--muted)' : 'var(--paper)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                boxShadow: !disabled ? `0 0 12px ${typeConf?.cardBg2}30` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-body font-semibold text-sm">{atk.name}</span>
                <span
                  className="font-mono font-bold text-base"
                  style={{ color: disabled ? 'var(--muted)' : (typeConf?.cardBg1 || 'var(--amber)') }}
                >
                  {dmgNum === 0 ? '–' : atk.damage}
                </span>
              </div>
              <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {'⬡'.repeat(Math.min(atk.cost, 5))} energy
              </div>
            </button>
          )
        })}
      </div>

      {/* Heal button */}
      <button
        onClick={() => !healDisabled && onHeal()}
        disabled={healDisabled}
        className="w-full py-3 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-3"
        style={{
          background: healUsed
            ? 'var(--line)'
            : healDisabled
              ? 'var(--line)'
              : 'rgba(74,222,128,0.1)',
          border: `1.5px solid ${healUsed ? 'transparent' : healDisabled ? 'transparent' : '#4ADE80'}`,
          color: healUsed ? 'var(--muted)' : healDisabled ? 'var(--muted)' : '#4ADE80',
          cursor: healDisabled ? 'not-allowed' : 'pointer',
          opacity: healDisabled ? 0.55 : 1,
          boxShadow: !healDisabled ? '0 0 14px rgba(74,222,128,0.18)' : 'none',
        }}
      >
        <span style={{ fontSize: 16 }}>💚</span>
        {healUsed
          ? 'Heal Used'
          : `Heal (+${healAmount} HP) · 1 use per battle`}
      </button>

      {/* Run + processing indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onRun}
          className="font-mono text-xs uppercase tracking-wider transition-colors duration-200"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          🏃 Run Away
        </button>
        {processing && (
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            {opponentCard.name} is thinking…
          </span>
        )}
      </div>
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────────────────────

function Results({ battle, streak, onRematch, onSwitch, onHub }) {
  const won = battle.result === 'win'
  const rarCfg = RARITY_CONFIG[battle.opponentCard.rarity]

  return (
    <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
      <div style={{ fontSize: 56, marginBottom: 12 }}>{won ? '🏆' : '💀'}</div>
      <h2
        className="font-display mb-4"
        style={{ fontSize: 'clamp(3.5rem,10vw,6rem)', color: won ? '#22C55E' : '#EF4444', lineHeight: 0.88 }}
      >
        {won ? 'Victory!' : 'Defeated!'}
      </h2>

      {won && (
        <div className="mb-8">
          <div
            className="inline-block font-mono px-8 py-4 rounded-xl mb-4"
            style={{ background: 'rgba(232,160,69,0.12)', border: '1px solid rgba(232,160,69,0.3)' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--amber)' }}>
              +{battle.coinsEarned} 🪙
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Defeated {battle.opponentCard.name} ({rarCfg.label})
            </div>
          </div>

          {streak > 1 && (
            <div className="font-mono text-sm mb-2" style={{ color: '#FBBF24' }}>
              🔥 {streak}-win streak! Next win earns more coins.
            </div>
          )}
          {battle.opponentCard.rarity === 'legendary' && (
            <div className="font-mono text-xs" style={{ color: '#F472B6' }}>
              ⭐ Legendary defeated — incredible!
            </div>
          )}
        </div>
      )}

      {!won && (
        <p className="font-body font-light mb-8" style={{ color: 'var(--muted)' }}>
          {battle.playerCard.name} tried its best. Pick a stronger Pokémon and try again!
        </p>
      )}

      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={onRematch}
          className="w-full max-w-xs px-10 py-3.5 font-mono text-sm tracking-widest uppercase"
          style={{ background: 'var(--amber)', color: 'var(--ink)' }}
        >
          Rematch with {battle.playerCard.name}
        </button>
        <button
          onClick={onSwitch}
          className="w-full max-w-xs px-10 py-3.5 font-mono text-sm tracking-widest uppercase transition-all duration-200"
          style={{ border: '1px solid var(--line)', color: 'var(--paper)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(237,233,227,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
        >
          Switch Pokémon
        </button>
        <button
          onClick={onHub}
          className="font-mono text-xs uppercase tracking-wider mt-1 transition-colors duration-200"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← Battle Hub
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Battle({ setPage }) {
  const { state, dispatch } = useGame()
  const toast = useToast()

  const [screen, setScreen] = useState('hub')       // hub | select | fight | results
  const [pickedCard, setPickedCard] = useState(null)
  const [battle, setBattle] = useState(null)
  const [streak, setStreak] = useState(0)

  // Ref so async setTimeout sees fresh battle state
  const battleRef = useRef(null)
  useEffect(() => { battleRef.current = battle }, [battle])

  // Opponent attack fires whenever processing becomes true
  useEffect(() => {
    if (!battle?.processing) return

    const timer = setTimeout(() => {
      const b = battleRef.current
      if (!b) return

      // AI heal: use it when HP < 40% and haven't healed yet (60% chance to use)
      const opHpPct = b.opponentHp / b.opponentMaxHp
      if (!b.opponentHealUsed && opHpPct < 0.40 && Math.random() < 0.60) {
        const healAmt = Math.round(b.opponentMaxHp * 0.30)
        const newOpHp = Math.min(b.opponentMaxHp, b.opponentHp + healAmt)
        const msgs = [
          `${b.opponentCard.name} used Recover! 💚`,
          `→ healed ${healAmt} HP`,
        ]
        setBattle(prev => prev ? {
          ...prev, opponentHp: newOpHp, opponentHealUsed: true,
          processing: false, playerTurn: true,
          log: [...prev.log, ...msgs].slice(-8),
        } : prev)
        return
      }

      const atkIdx = aiPick(b.opponentCard, b.playerHp / b.playerMaxHp)
      const { damage, isCrit, isWeakness } = calcDamage(b.opponentCard, b.playerCard, atkIdx)
      const atkName = b.opponentCard.attacks[atkIdx]?.name || 'Tackle'
      const newPlayerHp = Math.max(0, b.playerHp - damage)

      const msgs = [`${b.opponentCard.name} used ${atkName}!`]
      let dmg = `→ ${damage} damage`
      if (isWeakness) dmg += ' — SUPER EFFECTIVE! ×2'
      if (isCrit) dmg += ' ⚡ CRIT!'
      msgs.push(dmg)

      if (newPlayerHp <= 0) {
        msgs.push(`${b.playerCard.name} fainted!`)
        setBattle(prev => prev ? {
          ...prev, playerHp: 0, shakingPlayer: true, processing: false, playerTurn: false,
          result: 'lose', log: [...prev.log, ...msgs].slice(-8),
        } : prev)
        dispatch({ type: 'RECORD_BATTLE', won: false })
        setStreak(0)
        setTimeout(() => {
          setBattle(prev => prev ? { ...prev, shakingPlayer: false } : prev)
          setTimeout(() => setScreen('results'), 500)
        }, 450)
      } else {
        setBattle(prev => prev ? {
          ...prev, playerHp: newPlayerHp, shakingPlayer: true,
          processing: false, playerTurn: true,
          log: [...prev.log, ...msgs].slice(-8),
        } : prev)
        setTimeout(() => setBattle(prev => prev ? { ...prev, shakingPlayer: false } : prev), 450)
      }
    }, 950)

    return () => clearTimeout(timer)
  }, [battle?.processing])

  // ── Actions ───────────────────────────────────────

  function startBattle(card) {
    const opponent = randomOpponent()
    setPickedCard(card)
    setBattle({
      playerCard: card,
      opponentCard: opponent,
      playerHp: card.hp, playerMaxHp: card.hp,
      opponentHp: opponent.hp, opponentMaxHp: opponent.hp,
      log: ['⚔️ Battle start! Choose your attack.'],
      playerTurn: true, processing: false,
      shakingPlayer: false, shakingOpponent: false,
      result: null, coinsEarned: 0,
      healUsed: false, opponentHealUsed: false,
    })
    setScreen('fight')
  }

  function handleAttack(atkIdx) {
    const b = battleRef.current
    if (!b || !b.playerTurn || b.processing) return

    const { damage, isCrit, isWeakness } = calcDamage(b.playerCard, b.opponentCard, atkIdx)
    const atkName = b.playerCard.attacks[atkIdx]?.name || 'Tackle'
    const newOpHp = Math.max(0, b.opponentHp - damage)

    const msgs = [`${b.playerCard.name} used ${atkName}!`]
    let dmg = `→ ${damage} damage`
    if (isWeakness) dmg += ' — SUPER EFFECTIVE! ×2'
    if (isCrit) dmg += ' ⚡ CRIT!'
    msgs.push(dmg)

    if (newOpHp <= 0) {
      msgs.push(`${b.opponentCard.name} fainted!`)
      const earned = battleReward(b.opponentCard.rarity, streak)
      setBattle(prev => prev ? {
        ...prev, opponentHp: 0, shakingOpponent: true,
        processing: false, playerTurn: false, result: 'win', coinsEarned: earned,
        log: [...prev.log, ...msgs].slice(-8),
      } : prev)
      dispatch({ type: 'AWARD_COINS', amount: earned })
      dispatch({ type: 'RECORD_BATTLE', won: true })
      setStreak(s => s + 1)
      toast(`Victory! +${earned} 🪙`, 'coin')
      setTimeout(() => {
        setBattle(prev => prev ? { ...prev, shakingOpponent: false } : prev)
        setTimeout(() => setScreen('results'), 600)
      }, 450)
    } else {
      setBattle(prev => prev ? {
        ...prev, opponentHp: newOpHp, shakingOpponent: true,
        playerTurn: false, processing: true,
        log: [...prev.log, ...msgs].slice(-8),
      } : prev)
    }
  }

  function handleHeal() {
    const b = battleRef.current
    if (!b || !b.playerTurn || b.processing || b.healUsed) return

    const healAmt = Math.round(b.playerMaxHp * 0.30)
    const newHp = Math.min(b.playerMaxHp, b.playerHp + healAmt)
    const msgs = [
      `${b.playerCard.name} used Recover! 💚`,
      `→ healed ${healAmt} HP`,
    ]
    setBattle(prev => prev ? {
      ...prev, playerHp: newHp, healUsed: true,
      playerTurn: false, processing: true,
      log: [...prev.log, ...msgs].slice(-8),
    } : prev)
  }

  // ── Route ─────────────────────────────────────────

  const { collection } = state

  if (screen === 'hub') {
    return (
      <Hub
        stats={{
          wins: state.battleWins,
          losses: state.battleLosses,
          bestStreak: state.bestStreak,
          noCards: collection.length === 0,
        }}
        onEnter={() => setScreen('select')}
        setPage={setPage}
      />
    )
  }

  if (screen === 'select') {
    return (
      <Select
        collection={collection}
        onPick={card => startBattle(card)}
        onBack={() => setScreen('hub')}
      />
    )
  }

  if (screen === 'fight' && battle) {
    return (
      <Fight
        battle={battle}
        streak={streak}
        onAttack={handleAttack}
        onHeal={handleHeal}
        onRun={() => { setStreak(0); setScreen('hub') }}
      />
    )
  }

  if (screen === 'results' && battle) {
    return (
      <Results
        battle={battle}
        streak={streak}
        onRematch={() => startBattle(pickedCard)}
        onSwitch={() => setScreen('select')}
        onHub={() => { setStreak(0); setScreen('hub') }}
      />
    )
  }

  return null
}
