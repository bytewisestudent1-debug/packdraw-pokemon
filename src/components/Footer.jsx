const links = {
  Product: ['Overview', 'Features', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Status'],
  Company: ['About', 'Careers', 'Privacy', 'Terms'],
}

export default function Footer() {
  return (
    <footer
      className="px-8 md:px-16 pt-16 pb-10"
      style={{ borderTop: '1px solid var(--line)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-6 h-6 rounded-sm flex items-center justify-center"
                style={{ border: '1px solid var(--amber)' }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--amber)' }} />
              </div>
              <span className="font-mono text-sm tracking-[0.25em] uppercase" style={{ color: 'var(--paper)' }}>
                Forma
              </span>
            </div>
            <p className="text-sm leading-relaxed font-body font-light" style={{ color: 'var(--muted)' }}>
              The design-to-code platform for teams who ship without compromise.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-10 md:gap-16">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <div
                  className="font-mono text-xs tracking-[0.2em] uppercase mb-5"
                  style={{ color: 'var(--muted)' }}
                >
                  {group}
                </div>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm font-body transition-colors duration-200"
                        style={{ color: 'var(--muted)' }}
                        onMouseEnter={(e) => (e.target.style.color = 'var(--paper)')}
                        onMouseLeave={(e) => (e.target.style.color = 'var(--muted)')}
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <p className="font-mono text-xs" style={{ color: 'rgba(107,101,96,0.5)' }}>
            © 2025 Forma, Inc. All rights reserved.
          </p>
          <p className="font-mono text-xs" style={{ color: 'rgba(107,101,96,0.4)' }}>
            Built with Vite + React + Tailwind
          </p>
        </div>
      </div>
    </footer>
  )
}
