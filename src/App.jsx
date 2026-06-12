import { useState } from 'react'
import { GameProvider } from './store/GameContext'
import { ToastProvider } from './store/ToastContext'
import Grain from './components/Grain'
import Navbar from './components/Navbar'
import Shop from './pages/Shop'
import Opening from './pages/Opening'
import Collection from './pages/Collection'
import Stats from './pages/Stats'
import Battle from './pages/Battle'
import Trade from './pages/Trade'
import Quests from './pages/Quests'
import LoadingScreen from './components/LoadingScreen'

function AppContent() {
  const [page, setPage] = useState('shop')
  const [loading, setLoading] = useState(true)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)' }}>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <Grain />
      {page !== 'opening' && <Navbar page={page} setPage={setPage} />}
      <main>
        {page === 'shop'       && <Shop setPage={setPage} />}
        {page === 'opening'    && <Opening setPage={setPage} />}
        {page === 'collection' && <Collection setPage={setPage} />}
        {page === 'stats'      && <Stats setPage={setPage} />}
        {page === 'battle'     && <Battle setPage={setPage} />}
        {page === 'trade'      && <Trade setPage={setPage} />}
        {page === 'quests'     && <Quests setPage={setPage} />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </GameProvider>
  )
}
