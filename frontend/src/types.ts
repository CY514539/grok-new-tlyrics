export interface TimeAnchor {
  serverTimeMs: number
  elapsedAtAnchorMs: number
  isReliable: boolean
}

export interface CanonicalMediaSnapshot {
  vehicleId: string
  accountId: string
  trackFingerprint: string
  trackInstanceId: string
  generation: number
  title: string | null
  artist: string | null
  album: string | null
  durationSec: number | null
  playbackState: 'playing' | 'paused' | 'stopped' | 'unknown'
  timeAnchor: TimeAnchor | null
  lyricsMappingId: string | null
  lyricsStatus: 'none' | 'loading' | 'ready' | 'error' | 'manual'
  updatedAt: number
}
