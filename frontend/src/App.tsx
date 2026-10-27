import { useState } from 'react'
import Player from './components/Player'
import type { CanonicalMediaSnapshot } from './types'

// 示例 Snapshot（后续从 WebSocket 获取）
const mockSnapshot: CanonicalMediaSnapshot = {
  vehicleId: 'mock-vehicle-001',
  accountId: 'demo',
  trackFingerprint: 'fp_demo',
  trackInstanceId: 'inst_001',
  generation: 1,
  title: '七里香',
  artist: '周杰伦',
  album: '七里香',
  durationSec: 270,
  playbackState: 'playing',
  timeAnchor: {
    serverTimeMs: Date.now() - 15000,
    elapsedAtAnchorMs: 15000,
    isReliable: true,
  },
  lyricsMappingId: null,
  lyricsStatus: 'ready',
  updatedAt: Date.now(),
}

const mockLrc = `[00:12.50]七里香
[00:18.20]漫步在这个夏天的夜晚
[00:24.80]让风吹过我的头发
[00:31.10]我想起你的笑容`

export default function App() {
  const [snapshot] = useState(mockSnapshot)

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', opacity: 0.7, marginBottom: '2rem' }}>T-Lyrics</h1>
      <Player snapshot={snapshot} lrc={mockLrc} />
    </div>
  )
}
