export function timeAgoFromUnix(unixSeconds: string | undefined): string {
  if (!unixSeconds) return '' // we'll handle "Now Playing" separately

  const playedMs = parseInt(unixSeconds, 10) * 1000
  const nowMs = Date.now()
  const diffMs = nowMs - playedMs

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`
  return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
}
