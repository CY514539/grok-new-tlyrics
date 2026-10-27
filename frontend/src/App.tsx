import { useState } from 'react'
import Player from './components/Player'
import type { CanonicalMediaSnapshot } from './types'

const mockSnapshot: CanonicalMediaSnapshot = {
  vehicleId: 'mock-vehicle-001',
  accountId: 'demo',
  trackFingerprint: 'fp_demo',
  trackInstanceId: 'inst_001',
  generation: 1,
  title: '醉迷情人',
  artist: '陳慧琳',
  album: '醉迷情人',
  durationSec: 192,
  playbackState: 'playing',
  timeAnchor: {
    serverTimeMs: Date.now() - 32000,
    elapsedAtAnchorMs: 32000,
    isReliable: true,
  },
  lyricsMappingId: null,
  lyricsStatus: 'ready',
  updatedAt: Date.now(),
}

const mockLrc = `[00:12.50]情迷 意亂 紛飛 竟不知你是誰
[00:22.80]來來然後去去 醒醒想再睡睡
[00:33.10]我不知道你是誰
[00:42.40]但我知道我想你`

export default function App() {
  const [snapshot] = useState(mockSnapshot)

  return (
    <div className="app">
      <header className="header">
        <div className="logo">T-Lyrics</div>
        <button className="vehicle-select">MODEL Y ▾</button>
      </header>

      <main className="main">
        <Player snapshot={snapshot} lrc={mockLrc} />
      </main>
    </div>
  )
}
