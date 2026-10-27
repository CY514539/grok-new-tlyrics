import { useState } from 'react'
import Player from './components/Player'
import type { CanonicalMediaSnapshot } from './types'

const mockSnapshot: CanonicalMediaSnapshot = {
  vehicleId: 'mock-vehicle-001',
  accountId: 'demo',
  trackFingerprint: 'fp_dongfengpo',
  trackInstanceId: 'inst_dfp',
  generation: 1,
  title: '东风破',
  artist: '周杰伦',
  album: '叶惠美',
  durationSec: 310,
  playbackState: 'playing',
  timeAnchor: {
    serverTimeMs: Date.now() - 8000,
    elapsedAtAnchorMs: 8000,
    isReliable: true,
  },
  lyricsMappingId: null,
  lyricsStatus: 'ready',
  updatedAt: Date.now(),
}

const mockLrc = `[00:12.20]一盏离愁 孤单留在江南
[00:18.50]我在门外 也在门里
[00:25.10]谁在门外 哦 不过是外人
[00:31.80]你清晨 一杯红茶
[00:38.20]浇灭了一江秋意
[00:44.60]一盏离愁 孤单留在江南
[00:51.00]你在门外 也在门里
[00:57.50]谁在门外 哦 不过是外人
[01:04.20]你清晨 一杯红茶
[01:10.80]浇灭了一江秋意
[01:17.40]一盏离愁 孤单留在江南
[01:24.00]我在门外 也在门里
[01:30.60]谁在门外 哦 不过是外人
[01:37.20]你清晨 一杯红茶
[01:43.80]浇灭了一江秋意
[01:50.40]东风破
[01:57.00]东风破
[02:03.60]一盏离愁 孤单留在江南
[02:10.20]我在门外 也在门里
[02:16.80]谁在门外 哦 不过是外人
[02:23.40]你清晨 一杯红茶
[02:30.00]浇灭了一江秋意`

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
