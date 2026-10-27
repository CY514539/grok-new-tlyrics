import { useEffect, useState } from 'react'
import type { CanonicalMediaSnapshot } from '../types'

export function useLocalProgress(snapshot: CanonicalMediaSnapshot) {
  const [progressMs, setProgressMs] = useState(0)

  useEffect(() => {
    if (!snapshot.timeAnchor || snapshot.playbackState !== 'playing') {
      const anchor = snapshot.timeAnchor
      setProgressMs(anchor ? anchor.elapsedAtAnchorMs : 0)
      return
    }

    const anchor = snapshot.timeAnchor
    const start = performance.now()
    const baseElapsed = anchor.elapsedAtAnchorMs

    let raf: number
    const tick = () => {
      const now = performance.now()
      const elapsed = baseElapsed + (now - start)
      setProgressMs(elapsed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [snapshot.trackInstanceId, snapshot.playbackState, snapshot.timeAnchor, snapshot.generation])

  return progressMs
}
