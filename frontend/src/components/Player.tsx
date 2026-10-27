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
  { id: 'v1', title: '醉迷情人', artist: '陳慧琳', duration: '3:12', synced: true },
  { id: 'v2', title: '醉迷情人 (Live)', artist: '陳慧琳', duration: '3:45', synced: true },
  { id: 'v3', title: '醉迷情人', artist: '陳慧琳', duration: '3:10', synced: false },
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
  const [panel, setPanel] = useState<string | null>(null)
  const [offsetMs, setOffsetMs] = useState(0)
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [translateOn, setTranslateOn] = useState(false)
  const [fromLang, setFromLang] = useState('auto')
  const [toLang, setToLang] = useState('zh-CN')
  const [fontSize, setFontSize] = useState(100)
  const [lineSpacing, setLineSpacing] = useState(100)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center')
  const [copied, setCopied] = useState(false)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
  }

  const copyLink = () => {
    navigator.clipboard?.writeText('https://view.t-lyrics.com/s/demo')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className="lyrics" style={{ textAlign: align, fontSize: `${fontSize}%`, lineHeight: lineSpacing / 100 }}>
        <div className="prev">{prev?.text || '\u00a0'}</div>
        <div className="curr">{curr?.text || '\u00a0'}</div>
        <div className="next">{next?.text || '\u00a0'}</div>
      </div>

      <div className="bottom-panel">
        <div className="controls">
          <button className="btn" onClick={toggleTheme}>{theme === 'light' ? '☀' : '☾'}</button>
          <button className="btn" onClick={() => setPanel('version')}>Lyrics Version</button>
          <button className="btn" onClick={() => setOffsetMs(o => o - 500)}>⏪</button>
          <span style={{ fontSize: '0.8rem', minWidth: 48, textAlign: 'center' }}>
            {offsetMs >= 0 ? '+' : ''}{(offsetMs / 1000).toFixed(1)}s
          </span>
          <button className="btn" onClick={() => setOffsetMs(o => o + 500)}>⏩</button>
          <button className="btn" onClick={() => setPanel('sync')}>Sync</button>
          <button className="btn" onClick={() => setPanel('translate')}>Translate</button>
          <button className="btn" onClick={() => setPanel('settings')}>Settings</button>
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

      {panel && (
        <>
          <div className="drawer-overlay" onClick={() => setPanel(null)} />
          <div className="drawer">
            <button className="drawer-close" onClick={() => setPanel(null)}>×</button>

            {panel === 'version' && (
              <>
                <h3>Lyrics Version</h3>
                {mockVersions.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{v.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {v.artist} · {v.duration} · {v.synced ? 'Synced LRC' : 'Plain text'}
                      </div>
                    </div>
                    {selectedVersion === v.id
                      ? <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>In use</span>
                      : <button className="btn" onClick={() => { setSelectedVersion(v.id); setPanel(null) }}>Use</button>}
                  </div>
                ))}
                <button className="btn" style={{ width: '100%', marginTop: 14 }} onClick={() => setPanel(null)}>
                  Search manually
                </button>
              </>
            )}

            {panel === 'sync' && (
              <>
                <h3>Share Lyrics Live</h3>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 180, height: 180, margin: '8px auto 12px', background: '#fff', borderRadius: 12, display: 'grid', placeItems: 'center', border: '1px solid #eee', fontSize: '0.75rem', color: '#aaa' }}>
                    QR Code
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Scan to follow on phone or tablet</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input readOnly value="https://view.t-lyrics.com/s/demo" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'inherit', fontSize: '0.8rem' }} />
                    <button className="btn" onClick={copyLink}>{copied ? 'Copied' : 'Copy'}</button>
                  </div>
                  <div style={{ marginTop: 14, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Link valid for 12 hours · Read-only viewer
                  </div>
                </div>
              </>
            )}

            {panel === 'translate' && (
              <>
                <h3>Translate Lyrics</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Show translation</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Keep original lyrics visible</div>
                  </div>
                  <button className={`toggle ${translateOn ? 'on' : ''}`} onClick={() => setTranslateOn(!translateOn)} />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select value={fromLang} onChange={e => setFromLang(e.target.value)} className="btn" style={{ flex: 1 }}>
                    <option value="auto">Auto detect</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                  </select>
                  <span style={{ opacity: 0.4 }}>→</span>
                  <select value={toLang} onChange={e => setToLang(e.target.value)} className="btn" style={{ flex: 1 }}>
                    <option value="zh-CN">简体中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 16 }}>
                  Beta: lyric lines are sent for translation only when enabled.
                </p>
              </>
            )}

            {panel === 'settings' && (
              <>
                <h3>Lyrics Settings</h3>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Font size</span><span>{fontSize}%</span>
                  </div>
                  <input type="range" min="70" max="150" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Smaller</span><span>Default</span><span>Larger</span>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Line spacing</span><span>{lineSpacing}%</span>
                  </div>
                  <input type="range" min="80" max="140" value={lineSpacing} onChange={e => setLineSpacing(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>Alignment</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['left', 'center', 'right'] as const).map(a => (
                      <button key={a} className="btn" style={{ flex: 1, background: align === a ? 'var(--accent)' : undefined, color: align === a ? '#fff' : undefined }} onClick={() => setAlign(a)}>
                        {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: '0.85rem' }}>Day colors</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div className="color-swatch" style={{ background: '#f3f4f6', color: '#333' }}>Background</div>
                    <div className="color-swatch" style={{ background: '#101318' }}>Current</div>
                    <div className="color-swatch" style={{ background: '#24282f' }}>Next</div>
                  </div>
                </div>
                <button className="btn" style={{ width: '100%', marginTop: 8 }} onClick={() => { setFontSize(100); setLineSpacing(100); setAlign('center') }}>
                  Reset to default
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
