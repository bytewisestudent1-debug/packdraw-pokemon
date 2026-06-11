const features = [
  {
    number: '01',
    tag: 'Foundation',
    title: 'Design Token System',
    description:
      'Manage colors, typography, spacing, and motion as a single source of truth. Every token syncs instantly across your entire system.',
  },
  {
    number: '02',
    tag: 'Structure',
    title: 'Component Architecture',
    description:
      'Build atomic, composable components with variants, states, and responsive behaviors that translate directly into clean, maintainable code.',
  },
  {
    number: '03',
    tag: 'Output',
    title: 'Code Export Engine',
    description:
      'Export to React, Vue, or plain HTML/CSS — production-ready, accessible markup with zero manual cleanup or translation overhead.',
  },
]

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 7h10M7 2l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FeatureCard({ feature }) {
  return (
    <div
      className="group p-10 transition-colors duration-300 cursor-default"
      style={{
        background: 'var(--ink)',
        borderRight: '1px solid var(--line)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-8">
        <span
          className="font-mono text-xs tracking-[0.2em] uppercase px-2.5 py-1"
          style={{
            color: 'var(--muted)',
            border: '1px solid var(--line)',
          }}
        >
          {feature.tag}
        </span>
        <span
          className="font-display text-5xl transition-colors duration-300"
          style={{ color: 'var(--line)', fontWeight: 300 }}
        >
          {feature.number}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display text-2xl leading-snug mb-4 transition-colors duration-300"
        style={{ color: 'var(--paper)' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed font-body font-light" style={{ color: 'var(--muted)' }}>
        {feature.description}
      </p>

      {/* Learn more */}
      <div
        className="mt-8 flex items-center gap-2 text-xs font-mono transition-colors duration-300"
        style={{ color: 'rgba(232,160,69,0.5)' }}
      >
        <span>Learn more</span>
        <ArrowIcon />
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section className="px-8 md:px-16 py-32">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 pb-10"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
              <span
                className="font-mono text-xs tracking-[0.3em] uppercase"
                style={{ color: 'var(--amber)' }}
              >
                Capabilities
              </span>
            </div>
            <h2
              className="font-display leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--paper)' }}
            >
              The Full Stack
              <br />
              <em className="not-italic" style={{ color: 'var(--muted)' }}>
                of Creation.
              </em>
            </h2>
          </div>

          <p
            className="text-sm leading-relaxed max-w-xs font-body font-light hidden md:block text-right"
            style={{ color: 'var(--muted)' }}
          >
            Every tool you need — from initial token
            <br />
            to deployed, production-ready component.
          </p>
        </div>

        {/* Cards grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ border: '1px solid var(--line)' }}
        >
          {features.map((f) => (
            <FeatureCard key={f.number} feature={f} />
          ))}
        </div>

        {/* Bottom label */}
        <div className="flex items-center justify-center mt-12 gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            And much more
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>
      </div>
    </section>
  )
}
