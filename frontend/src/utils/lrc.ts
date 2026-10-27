export interface LrcLine {
  timeMs: number
  text: string
}

export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = []
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/
  for (const raw of lrc.split('\n')) {
    const m = raw.trim().match(regex)
    if (!m) continue
    const min = parseInt(m[1], 10)
    const sec = parseInt(m[2], 10)
    const ms = parseInt(m[3].padEnd(3, '0'), 10)
    lines.push({
      timeMs: min * 60 * 1000 + sec * 1000 + ms,
      text: m[4].trim(),
    })
  }
  return lines.sort((a, b) => a.timeMs - b.timeMs)
}
