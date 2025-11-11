import { COOPS_BASE_URL, NDBC_PROXY_CHAIN, NDBC_REALTIME_URL } from './constants'
import type { CoopsObs, CoopsPred, DatumCode, NdbcRow, TimePoint } from './types'
import { parseNdbcText, prepTimeSeries, toQueryDateTime } from './utils'

const REQUEST_TIMEOUT = 25000

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Request failed ${response.status}`)
    }
    return response
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchNdbcText(url: string) {
  const response = await fetchWithTimeout(url)
  return response.text()
}

function buildProxyUrl(proxy: string, target: string) {
  if (!proxy) return target
  if (proxy.includes('{url}')) {
    return proxy.replace('{url}', encodeURIComponent(target))
  }
  if (proxy.includes('allorigins')) {
    return `${proxy}${encodeURIComponent(target)}`
  }
  if (/url=?$/i.test(proxy) || proxy.endsWith('?url=')) {
    return `${proxy}${encodeURIComponent(target)}`
  }
  return proxy.endsWith('/') ? `${proxy}${target}` : `${proxy}${target}`
}

export async function fetchNdbc(
  stationId: string,
  startISO?: string,
  endISO?: string
): Promise<NdbcRow[]> {
  const url = `${NDBC_REALTIME_URL}/${stationId}.txt`
  const attempts = [undefined, ...NDBC_PROXY_CHAIN]
  const errors: string[] = []

  for (const proxy of attempts) {
    const target = proxy ? buildProxyUrl(proxy, url) : url
    try {
      const text = await fetchNdbcText(target)
      return parseNdbcText(text, startISO, endISO)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  throw new Error(`NDBC fetch failed for ${stationId}: ${errors.join(' | ')}`)
}

type CoopsParams = {
  product: 'water_level' | 'predictions'
  station: string
  startISO: string
  endISO: string
  datum: DatumCode
  timeZone?: 'gmt' | 'lst_ldt'
  interval?: '1' | '6' | 'hilo'
}

function buildCoopsUrl({
  product,
  station,
  startISO,
  endISO,
  datum,
  timeZone = 'gmt',
  interval,
}: CoopsParams) {
  const search = new URLSearchParams()
  search.set('product', product)
  search.set('station', station)
  search.set('datum', datum)
  search.set('begin_date', toQueryDateTime(new Date(startISO)))
  search.set('end_date', toQueryDateTime(new Date(endISO)))
  search.set('time_zone', timeZone)
  if (interval) {
    search.set('interval', interval)
  }
  return `${COOPS_BASE_URL}&${search.toString()}`
}

export async function fetchCoopsObs(
  station: string,
  startISO: string,
  endISO: string,
  datum: DatumCode
): Promise<TimePoint[]> {
  const url = buildCoopsUrl({
    product: 'water_level',
    station,
    startISO,
    endISO,
    datum,
  })

  const response = await fetchWithTimeout(url)
  const json = (await response.json()) as CoopsObs & { error?: { message: string } }
  if ('error' in json) {
    throw new Error(json.error?.message ?? 'CO-OPS obs error')
  }

  const series: TimePoint[] = (json.data ?? []).map((row) => ({
    t: `${row.t.replace(' ', 'T')}:00Z`,
    v: Number.parseFloat(row.v),
    qc: row.f,
  }))

  return prepTimeSeries(series, startISO, endISO)
}

export async function fetchCoopsPred(
  station: string,
  startISO: string,
  endISO: string,
  datum: DatumCode,
  timeZone: 'gmt' | 'lst_ldt' = 'gmt'
): Promise<TimePoint[]> {
  const url = buildCoopsUrl({
    product: 'predictions',
    station,
    startISO,
    endISO,
    datum,
    timeZone,
    interval: '1',
  })

  const response = await fetchWithTimeout(url)
  const json = (await response.json()) as CoopsPred & { error?: { message: string } }
  if ('error' in json) {
    throw new Error(json.error?.message ?? 'CO-OPS pred error')
  }

  const series: TimePoint[] = (json.predictions ?? []).map((row) => {
    const base = `${row.t.replace(' ', 'T')}:00`
    const iso = timeZone === 'gmt' ? `${base}Z` : new Date(base).toISOString()
    return { t: iso, v: Number.parseFloat(row.v) }
  })

  return prepTimeSeries(series, startISO, endISO)
}
