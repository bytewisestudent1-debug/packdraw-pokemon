import { useState, useEffect } from 'react'
import { useGame } from '../store/GameContext'
import { useToast } from '../store/ToastContext'

function msUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}

function formatCountdown(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function rewardLabel(reward) {
  if (reward.coins) return `+${reward.coins} 🪙`
  if (reward.pack === 'booster') return '1 Booster Pack 📦'
  return '?'
}

function QuestCard({ quest, onClaim }) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100)

  const barColor = quest.claimed
    ? '#4B5563'
    : quest.completed
      ? '#22C55E'
      : '#E8A045'

  return (
    <div
      className="p-5 rounded-xl transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${quest.claimed ? 'var(--line)' : quest.completed ? '#22C55E55' : 'var(--line)'}`,
        boxShadow: quest.completed && !quest.claimed ? '0 0 18px rgba(34,197,94,0.15)' : 'none',
        opacity: quest.claimed ? 0.55 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{
            background: quest.claimed
              ? 'var(--line)'
              : quest.completed
                ? 'rgba(34,197,94,0.15)'
                : 'rgba(232,160,69,0.12)',
            border: `1px solid ${quest.claimed ? 'transparent' : quest.completed ? '#22C55E44' : 'rgba(232,160,69,0.25)'}`,
          }}
        >
          {quest.claimed ? '✓' : quest.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-display text-lg leading-tight" style={{ color: quest.claimed ? 'var(--muted)' : 'var(--paper)' }}>
              {quest.label}
            </span>
            <span
              className="font-mono text-xs px-2.5 py-1 rounded-full flex-shrink-0"
              style={{
                background: quest.claimed ? 'var(--line)' : 'rgba(232,160,69,0.12)',
                color: quest.claimed ? 'var(--muted)' : 'var(--amber)',
                border: `1px solid ${quest.claimed ? 'transparent' : 'rgba(232,160,69,0.25)'}`,
              }}
            >
              {rewardLabel(quest.reward)}
            </span>
          </div>

          <p className="font-body text-xs font-light mb-3" style={{ color: 'var(--muted)' }}>
            {quest.desc}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            <span className="font-mono text-xs w-12 text-right flex-shrink-0" style={{ color: 'var(--muted)' }}>
              {quest.progress}/{quest.target}
            </span>
          </div>
        </div>
      </div>

      {/* Claim button */}
      {quest.completed && !quest.claimed && (
        <button
          onClick={() => onClaim(quest.id)}
          className="w-full mt-4 py-2.5 font-mono text-sm tracking-widest uppercase rounded-lg transition-opacity duration-200"
          style={{ background: '#22C55E', color: '#111' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Claim Reward ✓
        </button>
      )}
      {quest.claimed && (
        <div className="mt-3 font-mono text-xs text-center" style={{ color: 'var(--muted)' }}>
          Claimed
        </div>
      )}
    </div>
  )
}

export default function Quests() {
  const { state, dispatch } = useGame()
  const toast = useToast()
  const [countdown, setCountdown] = useState(msUntilMidnight())

  useEffect(() => {
    const id = setInterval(() => setCountdown(msUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  const quests = state.dailyQuests || []
  const completedCount = quests.filter(q => q.completed).length
  const claimedCount = quests.filter(q => q.claimed).length

  function claimQuest(questId) {
    const quest = quests.find(q => q.id === questId)
    dispatch({ type: 'CLAIM_QUEST', questId })
    const reward = quest?.reward
    if (reward?.coins) toast(`Quest complete! +${reward.coins} 🪙`, 'coin')
    else if (reward?.pack) toast('Quest complete! Got a Booster Pack!', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
        <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
          Daily Quests
        </span>
      </div>
      <div className="flex items-end justify-between mb-8">
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(3rem,9vw,6rem)', color: 'var(--paper)', lineHeight: 0.88 }}
        >
          Quests.
        </h1>
        <div className="text-right pb-1">
          <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Resets in</div>
          <div className="font-mono text-lg font-bold" style={{ color: 'var(--amber)' }}>
            {formatCountdown(countdown)}
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      >
        <div className="flex gap-1">
          {quests.map((q, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background: q.claimed ? '#22C55E' : q.completed ? '#22C55E88' : 'var(--line)',
              }}
            />
          ))}
        </div>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          {claimedCount}/{quests.length} claimed
          {completedCount > claimedCount && (
            <span style={{ color: '#22C55E' }}> · {completedCount - claimedCount} ready to claim!</span>
          )}
        </span>
      </div>

      {/* Quest cards */}
      {quests.length === 0 ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <p className="font-body font-light" style={{ color: 'var(--muted)' }}>
            Loading quests… try refreshing the page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onClaim={claimQuest} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="font-mono text-xs text-center mt-8" style={{ color: 'var(--muted)' }}>
        New quests appear every day at midnight · Complete all 3 for maximum rewards
      </p>
    </div>
  )
}
