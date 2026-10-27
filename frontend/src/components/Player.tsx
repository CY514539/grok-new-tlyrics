import type { CanonicalMediaSnapshot } from '../types'
import { useLocalProgress } from '../hooks/useLocalProgress'
import { parseLrc } from '../utils/lrc'

interface Props {
  snapshot: CanonicalMediaSnapshot
  lrc: string
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function Player({ snapshot, lrc }: Props) {
  const progressMs = useLocalProgress(snapshot)
  const lines = parseLrc(lrc)
  const currentIndex = lines.findIndex((line, i) => {
    const next = lines[i + 1]
    return progressMs >= line.timeMs && (!next || progressMs < next.timeMs)
  })

  const prev = currentIndex > 0 ? lines[currentIndex - 1] : null
  const curr = currentIndex >= 0 ? lines[currentIndex] : null
  const next = currentIndex >= 0 && currentIndex < lines.length - 1 ? lines[currentIndex + 1] : null

  const durationMs = (snapshot.durationSec || 0) * 1000
  const progressPercent = durationMs > 0 ? Math.min(100, (progressMs / durationMs) * 100) : 0

  return (
    <>
      <div className="lyrics">
        <div className="prev">{prev?.text || '\u00a0'}</div>
        <div className="curr">{curr?.text || '\u00a0'}</div>
        <div className="next">{next?.text || '\u00a0'}</div>
      </div>

      <div className="bottom-panel">
        <div className="controls">
          <button className="btn">☀</button>
          <button className="btn">♫ Lyrics Version ▾</button>
          <button className="btn">⏪</button>
          <span style={{ fontSize: '0.85rem', padding: '0 4px' }}>{formatTime(progressMs)}</span>
          <button className="btn">⏩</button>
          <button className="btn">↻ Sync</button>
          <button className="btn">文A Translate</button>
          <button className="btn">⚙ Settings</button>
        </div>

        <div className="song-info">
          <div>
            <div className="song-title">{snapshot.title || '未知歌曲'}</div>
            <div className="song-artist">{snapshot.artist} · {snapshot.album}</div>
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            Live
          </div>
        </div>

        <div className="progress-bar">
          <span>{formatTime(progressMs)}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>
    </>
  )
}
