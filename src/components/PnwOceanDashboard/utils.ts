import { DEFAULT_HISTORY_DAYS, MAX_HISTORY_DAYS } from './constants'
import type { NdbcRow, PnwOceanDashboardProps, TimePoint } from './types'

const MISSING = new Set(['MM', '9999', '999.0', '99.00', '', undefined as unknown as string])

const REQUIRED_COLUMNS = ['YY', 'MM', 'DD', 'hh', 'mm']

export function parseNdbcText(text: string, startISO?: string, endISO?: string): NdbcRow[] {
  const rows: NdbcRow[] = []
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const headerLine =
    lines.find(
      (line) =>
        line.startsWith('#') &&
        REQUIRED_COLUMNS.every((col) => line.toUpperCase().includes(col.toUpperCase()))
    ) ?? null

  if (!headerLine) {
    return rows
  }

  const columns = headerLine
    .replace(/^#\s*/, '')
    .trim()
    .split(/\s+/)
    .map((col) => col.trim())
  const columnIndex = new Map(columns.map((col, idx) => [col, idx]))

  if (!REQUIRED_COLUMNS.every((col) => columnIndex.has(col))) {
    return rows
  }

  const contentLines = lines.filter((line) => !line.startsWith('#'))
  if (!contentLines.length) {
    return rows
  }

  const toNumber = (token?: string): number | undefined => {
    if (!token || MISSING.has(token)) return undefined
    const value = Number(token)
    return Number.isFinite(value) ? value : undefined
  }

  const start = startISO ? Date.parse(startISO) : undefined
  const end = endISO ? Date.parse(endISO) : undefined

  for (let i = 0; i < contentLines.length; i += 1) {
    const parts = contentLines[i].trim().split(/\s+/)
    if (parts.length < columns.length) continue

    const yyToken = parts[columnIndex.get('YY')!]
    let yearNum = Number(yyToken)
    if (yyToken.length === 2) {
      yearNum += yearNum < 70 ? 2000 : 1900
    }
    const month = Number(parts[columnIndex.get('MM')!]) - 1
    const day = Number(parts[columnIndex.get('DD')!])
    const hour = Number(parts[columnIndex.get('hh')!])
    const minute = Number(parts[columnIndex.get('mm')!])

    const time = Date.UTC(yearNum, month, day, hour, minute)
    if (Number.isNaN(time)) continue
    if (start && time < start) continue
    if (end && time > end) continue

    const row: NdbcRow = {
      time: new Date(time).toISOString(),
      WVHT: toNumber(parts[columnIndex.get('WVHT') ?? -1]),
      DPD: toNumber(parts[columnIndex.get('DPD') ?? -1]),
      APD: toNumber(parts[columnIndex.get('APD') ?? -1]),
      WDIR: toNumber(parts[columnIndex.get('WDIR') ?? -1]),
      WSPD: toNumber(parts[columnIndex.get('WSPD') ?? -1]),
      GST: toNumber(parts[columnIndex.get('GST') ?? -1]),
      PRES: toNumber(parts[columnIndex.get('PRES') ?? -1]),
      ATMP: toNumber(parts[columnIndex.get('ATMP') ?? -1]),
      WTMP: toNumber(parts[columnIndex.get('WTMP') ?? -1]),
    }

    rows.push(row)
  }

  return rows
}

export function prepTimeSeries(
  points: TimePoint[],
  startISO?: string,
  endISO?: string
): TimePoint[] {
  const start = startISO ? Date.parse(startISO) : undefined
  const end = endISO ? Date.parse(endISO) : undefined
  return points.filter((point) => {
    const time = Date.parse(point.t)
    if (Number.isNaN(time)) return false
    if (start && time < start) return false
    if (end && time > end) return false
    return Number.isFinite(point.v)
  })
}

export function toQueryDate(date: Date): string {
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

export function toQueryDateTime(date: Date): string {
  const base = toQueryDate(date)
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  return `${base} ${hh}:${min}`
}

export function lttb(points: TimePoint[], threshold = 4000): TimePoint[] {
  if (points.length <= threshold) return points
  const bucketSize = (points.length - 2) / (threshold - 2)
  const sampled: TimePoint[] = [points[0]]
  let a = 0

  for (let i = 0; i < threshold - 2; i += 1) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1
    const rangeEnd = Math.floor((i + 2) * bucketSize) + 1
    const range = points.slice(rangeStart, rangeEnd)

    let avgX = 0
    let avgY = 0
    range.forEach((point) => {
      const x = Date.parse(point.t)
      avgX += x
      avgY += point.v
    })
    avgX /= range.length || 1
    avgY /= range.length || 1

    const bucketRangeStart = Math.floor(i * bucketSize) + 1
    const bucketRangeEnd = Math.floor((i + 1) * bucketSize) + 1
    const bucket = points.slice(bucketRangeStart, bucketRangeEnd)

    let maxArea = -1
    let nextPoint = bucket[0]

    bucket.forEach((point) => {
      const ax = Date.parse(points[a].t)
      const ay = points[a].v
      const bx = Date.parse(point.t)
      const by = point.v
      const area = Math.abs((ax - avgX) * (by - ay) - (ax - bx) * (avgY - ay))
      if (area > maxArea) {
        maxArea = area
        nextPoint = point
      }
    })

    sampled.push(nextPoint)
    a = points.indexOf(nextPoint)
  }

  sampled.push(points[points.length - 1])
  return sampled
}

export function toSeriesTuples(points: TimePoint[]): [number, number][] {
  return points.map((point) => [Date.parse(point.t), point.v])
}

export function mergeResidual(obs: TimePoint[], pred: TimePoint[]): TimePoint[] {
  const predMap = new Map(pred.map((point) => [point.t, point.v]))
  const merged: TimePoint[] = []
  obs.forEach((point) => {
    const predValue = predMap.get(point.t)
    if (typeof predValue === 'number') {
      merged.push({ t: point.t, v: Number((point.v - predValue).toFixed(3)) })
    }
  })
  return merged
}

export function formatRangeLabel(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
  })
  return `${formatter.format(start)} → ${formatter.format(end)} PST`
}

export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date.getTime() < min.getTime()) return new Date(min)
  if (date.getTime() > max.getTime()) return new Date(max)
  return date
}

export function toISO(date: Date): string {
  return new Date(date).toISOString()
}

export function computeDefaultRange(props: PnwOceanDashboardProps) {
  const DAY_MS = 24 * 60 * 60 * 1000
  const end = props.endISO ? new Date(props.endISO) : new Date()
  const maxDomainStart = new Date(end.getTime() - MAX_HISTORY_DAYS * DAY_MS)
  const defaultDays = props.defaultDays ?? DEFAULT_HISTORY_DAYS
  const defaultStartCandidate = props.startISO
    ? new Date(props.startISO)
    : new Date(end.getTime() - defaultDays * DAY_MS)
  const start = clampDate(defaultStartCandidate, maxDomainStart, end)
  return { start, end, domainStart: maxDomainStart, domainEnd: end }
}

export function formatDateTimeLocalInput(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function parseDateTimeLocalInput(value: string) {
  if (!value) return undefined
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return undefined
  const [year, month, day] = datePart.split('-').map((segment) => Number(segment))
  const [hour, minute] = timePart.split(':').map((segment) => Number(segment))
  if ([year, month, day, hour, minute].some((segment) => Number.isNaN(segment))) return undefined
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0)
}
