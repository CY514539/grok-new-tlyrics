import { useState, useEffect } from 'react'
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

const colorPresets = {
  day: [
    { bg: '#f5f6f8', curr: '#1d1d1f', next: '#6e6e73', label: 'Default' },
    { bg: '#ffffff', curr: '#000000', next: '#555555', label: 'High Contrast' },
    { bg: '#f0f4ff', curr: '#1e3a8a', next: '#64748b', label: 'Blue' },
  ],
  night: [
    { bg: '#000000', curr: '#ffffff', next: '#86868b', label: 'Default' },
    { bg: '#111111', curr: '#f5f5f7', next: '#aaaaaa', label: 'Soft' },
    { bg: '#0a0a1a', curr: '#a5b4fc', next: '#6b7280', label: 'Night Blue' },
  ],
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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light')
  const [panel, setPanel] = useState<string | null>(null)
  const [offsetMs, setOffsetMs] = useState(() => Number(localStorage.getItem('offsetMs')) || 0)
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [translateOn, setTranslateOn] = useState(false)
  const [fromLang, setFromLang] = useState('auto')
  const [toLang, setToLang] = useState('zh-CN')
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 100)
  const [lineSpacing, setLineSpacing] = useState(() => Number(localStorage.getItem('lineSpacing')) || 100)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(() => (localStorage.getItem('align') as any) || 'center')
  const [colorIndex, setColorIndex] = useState(() => Number(localStorage.getItem('colorIndex')) || 0)
  const [copied, setCopied] = useState(false)

  const colors = colorPresets[theme === 'dark' ? 'night' : 'day'][colorIndex] || colorPresets.day[0]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem('offsetMs', String(offsetMs)) }, [offsetMs])
  useEffect(() => { localStorage.setItem('fontSize', String(fontSize)) }, [fontSize])
  useEffect(() => { localStorage.setItem('lineSpacing', String(lineSpacing)) }, [lineSpacing])
  useEffect(() => { localStorage.setItem('align', align) }, [align])
  useEffect(() => { localStorage.setItem('colorIndex', String(colorIndex)) }, [colorIndex])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const copyLink = () => {
    navigator.clipboard?.writeText('https://view.t-lyrics.com/s/demo')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className="lyrics" style={{ textAlign: align, fontSize: `${fontSize}%`, lineHeight: lineSpacing / 80 }}>
        <div className="prev" style={{ color: colors.next }}>{prev?.text || '\u00a0'}</div>
        <div className="curr" style={{ color: colors.curr }}>{curr?.text || '\u00a0'}</div>
        <div className="next" style={{ color: colors.next }}>{next?.text || '\u00a0'}</div>
      </div>

      <div className="bottom-panel">
        <div className="controls">
          <button className={`btn ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme}>{theme === 'light' ? '☀' : '☾'}</button>
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
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Font size</span><span>{fontSize}%</span>
                  </div>
                  <input type="range" min="60" max="200" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Smaller</span><span>Default</span><span>Larger</span>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Line spacing</span><span>{lineSpacing}%</span>
                  </div>
                  <input type="range" min="70" max="180" value={lineSpacing} onChange={e => setLineSpacing(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>Alignment</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['left', 'center', 'right'] as const).map(a => (
                      <button key={a} className={`btn ${align === a ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setAlign(a)}>
                        {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: '0.85rem' }}>Colors</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {colorPresets[theme === 'dark' ? 'night' : 'day'].map((c, i) => (
                      <div
                        key={i}
                        className="color-swatch"
                        style={{ background: c.curr, outline: colorIndex === i ? '2px solid var(--accent)' : undefined }}
                        onClick={() => setColorIndex(i)}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn" style={{ width: '100%', marginTop: 8 }} onClick={() => { setFontSize(100); setLineSpacing(100); setAlign('center'); setColorIndex(0) }}>
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
