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

const mockVersions = [
  { id: 'v1', title: '醉迷情人', artist: '陳慧琳', duration: '3:12', synced: true, inUse: true },
  { id: 'v2', title: '醉迷情人 (Live)', artist: '陳慧琳', duration: '3:45', synced: true, inUse: false },
  { id: 'v3', title: '醉迷情人', artist: '陳慧琳', duration: '3:10', synced: false, inUse: false },
]

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
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [translateOn, setTranslateOn] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center')

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
  }

  return (
    <>
      <div className="lyrics" style={{ textAlign: align, fontSize: `${fontSize}%` }}>
        <div className="prev">{prev?.text || '\u00a0'}</div>
        <div className="curr">{curr?.text || '\u00a0'}</div>
        <div className="next">{next?.text || '\u00a0'}</div>
      </div>

      <div className="bottom-panel">
        <div className="controls">
          <button className="btn" onClick={toggleTheme}>{theme === 'light' ? '☀' : '☾'}</button>
          <button className="btn" onClick={() => setModal('version')}>Lyrics Version</button>
          <button className="btn" onClick={() => setOffsetMs(o => o - 500)}>⏪</button>
          <span style={{ fontSize: '0.8rem', minWidth: 48, textAlign: 'center' }}>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button className="modal-close" onClick={() => setModal(null)}>×</button>

            {modal === 'version' && (
              <>
                <h3>Lyrics Version</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mockVersions.map(v => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{v.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.artist} · {v.duration} · {v.synced ? 'Synced' : 'Plain'}</div>
                      </div>
                      {selectedVersion === v.id
                        ? <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>In use</span>
                        : <button className="btn" onClick={() => setSelectedVersion(v.id)}>Use</button>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {modal === 'sync' && (
              <>
                <h3>Share Lyrics Live</h3>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 160, height: 160, margin: '0 auto 12px', background: '#fff', border: '1px solid #eee', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#999' }}>
                    QR Code
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scan to follow on phone</div>
                  <div style={{ marginTop: 12, fontSize: '0.8rem', wordBreak: 'break-all', background: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8 }}>
                    https://view.t-lyrics.com/s/demo
                  </div>
                </div>
              </>
            )}

            {modal === 'translate' && (
              <>
                <h3>Translate Lyrics</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span>Show translation</span>
                  <button className="btn" onClick={() => setTranslateOn(!translateOn)}>{translateOn ? 'On' : 'Off'}</button>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <select className="btn" style={{ flex: 1 }}><option>Auto detect</option><option>繁體中文</option><option>English</option></select>
                  <span>→</span>
                  <select className="btn" style={{ flex: 1 }}><option>简体中文</option><option>English</option><option>日本語</option></select>
                </div>
              </>
            )}

            {modal === 'settings' && (
              <>
                <h3>Lyrics Settings</h3>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Font size</span><span>{fontSize}%</span>
                  </div>
                  <input type="range" min="70" max="140" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 6 }}>Alignment</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['left', 'center', 'right'] as const).map(a => (
                      <button key={a} className="btn" style={{ flex: 1, background: align === a ? 'var(--accent)' : undefined, color: align === a ? '#fff' : undefined }} onClick={() => setAlign(a)}>
                        {a === 'left' ? '≡' : a === 'center' ? '≡' : '≡'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  颜色与布局设置将在后续完善。
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
