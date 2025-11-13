import type { DatumCode, StationDefinition } from './types'

export type NdbcProxy = {
  id: string
  url: string
}

export const NDBC_REALTIME_URL = 'https://www.ndbc.noaa.gov/data/realtime2'
export const COOPS_BASE_URL =
  'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?application=codex&units=metric&format=json'

const runtimeProxy = (import.meta.env?.VITE_NDBC_PROXY as string | undefined)?.trim()
const proxyDefinitions: Array<NdbcProxy | undefined> = [
  runtimeProxy ? { id: 'runtime', url: runtimeProxy } : undefined,
  { id: 'r.jina.ai', url: 'https://r.jina.ai/https://' },
  { id: 'isomorphic-git', url: 'https://cors.isomorphic-git.org/' },
  { id: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' },
  { id: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
]
export const NDBC_PROXY_CHAIN = proxyDefinitions.filter((entry): entry is NdbcProxy =>
  Boolean(entry?.url)
)

export const DEFAULT_DATUM: DatumCode = 'MLLW'
export const DATUM_OPTIONS: DatumCode[] = ['MLLW', 'NAVD88', 'CRD']
export const DEFAULT_HISTORY_DAYS = 10
export const MAX_HISTORY_DAYS = 30

export const STATIONS: StationDefinition[] = [
  { id: '46087', label: 'Neah Bay', provider: 'NDBC', group: 'ocean' },
  { id: '46041', label: 'Cape Elizabeth', provider: 'NDBC', group: 'ocean' },
  {
    id: '46029',
    label: 'Columbia River Bar',
    provider: 'NDBC',
    group: 'ocean',
    defaultSelected: true,
  },
  {
    id: '46243',
    label: 'Clatsop Spit',
    provider: 'NDBC',
    group: 'ocean',
    defaultSelected: true,
  },
  {
    id: '9444090',
    label: 'Port Angeles',
    provider: 'COOPS_OBS',
    group: 'ocean',
  },
  {
    id: '9439040',
    label: 'Astoria Tongue Point',
    provider: 'COOPS_OBS',
    group: 'estuary',
    defaultSelected: true,
  },
  {
    id: '9439221',
    label: 'Portland (CO-OPS predictions)',
    provider: 'COOPS_PRED',
    group: 'upriver',
  },
  {
    id: '9440083',
    label: 'Vancouver, WA (CO-OPS predictions)',
    provider: 'COOPS_PRED',
    group: 'upriver',
  },
]

export const BAR_PANEL_DEFAULTS = ['46029', '46243']
export const PICKER_DEFAULTS = ['46029', '46243', '9439040']

export const UPRIVER_STATIONS = ['9439221', '9440083']
export const ESTUARY_DATUM_CAPABLE: Record<string, DatumCode[]> = {
  '9439040': ['MLLW', 'NAVD88'],
}

export const CRD_SUPPORTED_STATIONS = new Set(['9439221', '9440083'])
