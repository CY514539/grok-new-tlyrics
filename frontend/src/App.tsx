import { useState, useEffect } from 'react'
import Player from './components/Player'
import type { CanonicalMediaSnapshot } from './types'

const API_BASE = 'http://localhost:3001'
const WS_URL = 'ws://localhost:3001/ws'

export default function App() {
  const [snapshot, setSnapshot] = useState<CanonicalMediaSnapshot | null>(null)
  const [lrc, setLrc] = useState('')

  useEffect(() => {
    // Initial REST load
    async function loadInitial() {
      try {
        const [snapRes, lrcRes] = await Promise.all([
          fetch(`${API_BASE}/api/snapshot`),
          fetch(`${API_BASE}/api/lyrics`),
        ])
        if (snapRes.ok) setSnapshot(await snapRes.json())
        if (lrcRes.ok) {
          const data = await lrcRes.json()
          setLrc(data.lrc || '')
        }
      } catch (e) {
        console.error('Initial load failed', e)
      }
    }
    loadInitial()

    // WebSocket for live updates
    const ws = new WebSocket(WS_URL)
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'snapshot' && msg.data) {
          setSnapshot(msg.data)
        }
      } catch {}
    }
    ws.onerror = () => console.warn('WS error')

    return () => ws.close()
  }, [])

  if (!snapshot) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">T-Lyrics</div>
        <button className="vehicle-select">MODEL Y ▾</button>
      </header>

      <main className="main">
        <Player snapshot={snapshot} lrc={lrc} />
      </main>
    </div>
  )
}
