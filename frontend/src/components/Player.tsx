import { useState } from 'react'
import type { CanonicalMediaSnapshot } from '../types'
import { useLocalProgress } from '../hooks/useLocalProgress'
import { parseLrc } from '../utils/lrc'

interface Props {
  snapshot: CanonicalMediaSnapshot
  lrc: string
}

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
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

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [modal, setModal] = useState<string | null>(null)
  const [offsetMs, setOffsetMs] = useState(0)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
  }

  return (
    <>
      <div className="lyrics">
        <div className="prev">{prev?.text || '\u00a0'}</div>
        <div className="curr">{curr?.text || '\u00a0'}</div>
        <div className="next">{next?.text || '\u00a0'}</div>
      </div>

      <div className="bottom-panel">
        <div className="controls">
          <button className="btn" onClick={toggleTheme} title="日夜模式">
            {theme === 'light' ? '☀' : '☾'}
          </button>
          <button className="btn" onClick={() => setModal('version')}>Lyrics Version</button>
          <button className="btn" onClick={() => setOffsetMs(o => o - 500)}>⏪</button>
          <span style={{ fontSize: '0.8rem', minWidth: 40, textAlign: 'center' }}>
            {offsetMs >= 0 ? '+' : ''}{(offsetMs / 1000).toFixed(1)}s
          </span>
          <button className="btn" onClick={() => setOffsetMs(o => o + 500)}>⏩</button>
          <button className="btn" onClick={() => setModal('sync')}>Sync</button>
          <button className="btn" onClick={() => setModal('translate')}>Translate</button>
          <button className="btn" onClick={() => setModal('settings')}>Settings</button>
        </div>

        <div className="song-info">
          <div>
            <div className="song-title">{snapshot.title || '未知歌曲'}</div>
            <div className="song-artist">{snapshot.artist} · {snapshot.album}</div>
          </div>
          <div className="live-badge"><span className="live-dot" /> Live</div>
        </div>

        <div className="progress-bar">
          <span>{formatTime(progressMs)}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>×</button>
            {modal === 'version' && <h3>Lyrics Version</h3>}
            {modal === 'sync' && <h3>Share Lyrics Live</h3>}
            {modal === 'translate' && <h3>Translate Lyrics</h3>}
            {modal === 'settings' && <h3>Lyrics Settings</h3>}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {modal === 'version' && '选择不同歌词版本（后续实现）'}
              {modal === 'sync' && '手机扫码同步观看（二维码占位）'}
              {modal === 'translate' && '实时翻译当前歌词'}
              {modal === 'settings' && '字体大小、颜色、对齐方式调整'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
