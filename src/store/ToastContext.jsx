import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

const COLORS = {
  coin:    { bg: '#D97706', text: '#fff', icon: '🪙' },
  success: { bg: '#16A34A', text: '#fff', icon: '✓'  },
  error:   { bg: '#DC2626', text: '#fff', icon: '✕'  },
  info:    { bg: '#2563EB', text: '#fff', icon: 'ℹ'  },
}

function ToastItem({ message, type = 'info' }) {
  const cfg = COLORS[type] || COLORS.info
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl font-mono text-sm"
      style={{
        background: cfg.bg,
        color: cfg.text,
        minWidth: 200,
        maxWidth: 320,
        animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        className="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ bottom: 24, right: 24 }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} message={t.message} type={t.type} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
