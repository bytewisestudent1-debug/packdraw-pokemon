import { useState, useEffect } from 'react'

const DURATION_MS = 2000

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const start = performance.now()

    const frame = (now) => {
      const pct = Math.min(((now - start) / DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        requestAnimationFrame(frame)
      } else {
        setTimeout(() => {
          setFading(true)
          setTimeout(onDone, 600)
        }, 300)
      }
    }

    const raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <div className="text-center anim-fade-up">
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center"
            style={{ border: '1.5px solid var(--amber)' }}
          >
            <div className="w-4 h-4 rounded-sm" style={{ background: 'var(--amber)' }} />
          </div>
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
          <span className="font-mono text-xs tracking-[0.35em] uppercase" style={{ color: 'var(--amber)' }}>
            PackDraw
          </span>
          <div className="w-10 h-px" style={{ background: 'var(--amber)' }} />
        </div>

        {/* Headline */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(4rem, 13vw, 9rem)',
            color: 'var(--paper)',
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
          }}
        >
          Pokémon
        </h1>

        <p className="font-body font-light mt-3 mb-12" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
          Cards · Collection · Battle
        </p>

        {/* Progress bar */}
        <div className="w-52 mx-auto">
          <div className="h-px mb-3" style={{ background: 'var(--line)' }}>
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: 'var(--amber)',
                transition: 'width 0.08s linear',
              }}
            />
          </div>
          <p className="font-mono text-xs" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {progress >= 100 ? 'Ready.' : 'Loading…'}
          </p>
        </div>
      </div>
    </div>
  )
}
