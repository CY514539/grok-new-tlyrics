import type { CanonicalMediaSnapshot } from '../types'
import { useLocalProgress } from '../hooks/useLocalProgress'
import { parseLrc } from '../utils/lrc'

interface Props {
  snapshot: CanonicalMediaSnapshot
  lrc: string
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem' }}>{snapshot.title || '未知歌曲'}</h2>
        <p style={{ opacity: 0.7, margin: '0.5rem 0' }}>{snapshot.artist}</p>
        <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>
          {snapshot.playbackState === 'playing' ? '播放中' : '已暂停'} · {Math.floor(progressMs / 1000)}s
        </p>
      </div>

      <div style={{ fontSize: '1.8rem', lineHeight: 2.2, minHeight: 200 }}>
        <div style={{ opacity: 0.4 }}>{prev?.text || '\u00a0'}</div>
        <div style={{ fontWeight: 600, color: '#fff', fontSize: '2.2rem' }}>{curr?.text || '\u00a0'}</div>
        <div style={{ opacity: 0.4 }}>{next?.text || '\u00a0'}</div>
      </div>
    </div>
  )
}
