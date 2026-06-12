import { useGame } from '../store/GameContext'

export default function Navbar({ page, setPage }) {
  const { state } = useGame()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{
        background: 'rgba(17,16,16,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Logo */}
      <button onClick={() => setPage('shop')} className="flex items-center gap-2.5">
        <div
          className="w-6 h-6 rounded-sm flex items-center justify-center"
          style={{ border: '1px solid var(--amber)' }}
        >
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--amber)' }} />
        </div>
        <span className="font-mono text-sm tracking-[0.22em] uppercase" style={{ color: 'var(--paper)' }}>
          PackDraw
        </span>
      </button>

      {/* Nav */}
      <div className="flex items-center gap-1">
        {[
          { id: 'shop', label: 'Shop' },
          { id: 'collection', label: `Collection${state.collection.length ? ` (${state.collection.length})` : ''}` },
          { id: 'battle', label: '⚔️ Battle' },
          { id: 'stats', label: 'Stats' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-200 rounded"
            style={{
              color: page === item.id ? 'var(--amber)' : 'var(--muted)',
              background: page === item.id ? 'rgba(232,160,69,0.1)' : 'transparent',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Coins */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
      >
        <span style={{ fontSize: 13 }}>🪙</span>
        <span className="font-mono text-sm font-bold" style={{ color: 'var(--amber)' }}>
          {state.coins.toLocaleString()}
        </span>
      </div>
    </nav>
  )
}
