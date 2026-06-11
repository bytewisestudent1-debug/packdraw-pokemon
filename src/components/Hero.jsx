export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-28 pb-20 relative overflow-hidden">

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(237,233,227,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(237,233,227,0.03) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Decorative concentric circles — top right */}
      <div
        className="absolute anim-float"
        style={{ right: '8%', top: '20%', width: 320, height: 320, pointerEvents: 'none' }}
      >
        {[320, 240, 160, 80].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: '1px solid rgba(232,160,69,0.08)',
              top: (320 - size) / 2,
              left: (320 - size) / 2,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        <div
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            background: 'var(--amber)',
            opacity: 0.5,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10 anim-fade-up delay-0">
          <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--amber)' }}
          >
            Design × Code × Ship
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="font-display leading-[0.88] tracking-tight mb-8"
          style={{ fontSize: 'clamp(4rem, 11vw, 9.5rem)', color: 'var(--paper)' }}
        >
          <span className="block anim-fade-up delay-1">Where</span>
          <span className="block anim-fade-up delay-2" style={{ color: 'var(--amber)', fontStyle: 'italic' }}>
            Vision
          </span>
          <span className="block anim-fade-up delay-3">Becomes</span>
          <span className="block text-stroke anim-fade-up delay-4">Interface.</span>
        </h1>

        {/* Divider */}
        <div
          className="w-full h-px mb-8 anim-line delay-5"
          style={{ background: 'var(--line)' }}
        />

        {/* Subtext + CTAs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 anim-fade-up delay-5">
          <p
            className="text-lg max-w-md leading-relaxed font-body font-light"
            style={{ color: 'var(--muted)' }}
          >
            Forma bridges the gap between design tools and production code.
            Build components, export systems, and ship faster — without the friction.
          </p>

          <div className="flex items-center gap-4 shrink-0">
            <button
              className="px-8 py-3.5 text-sm font-mono tracking-[0.15em] uppercase transition-colors duration-200"
              style={{ background: 'var(--amber)', color: 'var(--ink)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Start Building
            </button>
            <button
              className="px-8 py-3.5 text-sm font-mono tracking-[0.15em] uppercase transition-colors duration-200"
              style={{ border: '1px solid var(--line)', color: 'var(--paper)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(237,233,227,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap gap-12 mt-16 pt-8 anim-fade-up delay-6"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          {[
            { value: '10K+', label: 'Components' },
            { value: '500+', label: 'Design Systems' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-2xl mb-1" style={{ color: 'var(--amber)' }}>
                {stat.value}
              </div>
              <div
                className="text-xs tracking-[0.25em] uppercase font-body"
                style={{ color: 'var(--muted)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
