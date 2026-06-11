import { useState } from 'react'

export default function CTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section className="px-8 md:px-16 py-32">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative overflow-hidden p-12 md:p-20"
          style={{ border: '1px solid var(--line)' }}
        >
          {/* Background orb */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: '-80px',
              top: '-80px',
              width: 400,
              height: 400,
              background:
                'radial-gradient(circle at center, rgba(232,160,69,0.07) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              right: '-40px',
              top: '-40px',
              width: 280,
              height: 280,
              border: '1px solid rgba(232,160,69,0.06)',
              borderRadius: '50%',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-14">

            {/* Left copy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px" style={{ background: 'var(--amber)' }} />
                <span
                  className="font-mono text-xs tracking-[0.3em] uppercase"
                  style={{ color: 'var(--amber)' }}
                >
                  Early Access
                </span>
              </div>
              <h2
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', color: 'var(--paper)' }}
              >
                Ready to build
                <br />
                <em className="not-italic" style={{ color: 'var(--amber)' }}>
                  differently?
                </em>
              </h2>
              <p
                className="mt-5 text-sm leading-relaxed font-body font-light max-w-sm"
                style={{ color: 'var(--muted)' }}
              >
                Join 2,000+ designers and developers already on the waitlist.
                Be first when we open the doors.
              </p>
            </div>

            {/* Right form */}
            <div className="w-full md:min-w-[340px] md:max-w-sm">
              {submitted ? (
                <div
                  className="p-6 text-center"
                  style={{ border: '1px solid var(--line)' }}
                >
                  <div className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--amber)' }}>
                    You're on the list
                  </div>
                  <p className="text-sm font-body font-light" style={{ color: 'var(--muted)' }}>
                    We'll reach out to{' '}
                    <span style={{ color: 'var(--paper)' }}>{email}</span> soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-transparent px-5 py-3.5 text-sm font-mono transition-colors duration-200 outline-none"
                    style={{
                      border: '1px solid var(--line)',
                      color: 'var(--paper)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(232,160,69,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-3.5 text-sm font-mono tracking-[0.15em] uppercase transition-opacity duration-200"
                    style={{ background: 'var(--amber)', color: 'var(--ink)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Request Access →
                  </button>
                  <p
                    className="text-xs font-mono text-center"
                    style={{ color: 'rgba(107,101,96,0.6)' }}
                  >
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
