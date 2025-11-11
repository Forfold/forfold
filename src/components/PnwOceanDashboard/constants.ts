import type { DatumCode, StationDefinition } from './types'

export const NDBC_REALTIME_URL = 'https://www.ndbc.noaa.gov/data/realtime2'
export const COOPS_BASE_URL =
  'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?application=codex&units=metric&format=json'

const runtimeProxy = import.meta.env?.VITE_NDBC_PROXY as string | undefined
export const NDBC_PROXY_CHAIN = [
  runtimeProxy,
  'https://cors.isomorphic-git.org/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.allorigins.win/raw?url=',
].filter(Boolean) as string[]

export const DEFAULT_DATUM: DatumCode = 'MLLW'
export const DATUM_OPTIONS: DatumCode[] = ['MLLW', 'NAVD88', 'CRD']
export const DEFAULT_HISTORY_DAYS = 10
export const MAX_HISTORY_DAYS = 30

export const STATIONS: StationDefinition[] = [
  { id: '46087', label: '46087 · Neah Bay (NDBC)', provider: 'NDBC', group: 'ocean' },
  { id: '46041', label: '46041 · Cape Elizabeth (NDBC)', provider: 'NDBC', group: 'ocean' },
  {
    id: '46029',
    label: '46029 · Columbia River Bar (NDBC)',
    provider: 'NDBC',
    group: 'ocean',
    defaultSelected: true,
  },
  {
    id: '46243',
    label: '46243 · Clatsop Spit (NDBC)',
    provider: 'NDBC',
    group: 'ocean',
    defaultSelected: true,
  },
  {
    id: '9444090',
    label: '9444090 · Port Angeles (CO-OPS)',
    provider: 'COOPS_OBS',
    group: 'ocean',
  },
  {
    id: '9439040',
    label: '9439040 · Astoria Tongue Point (CO-OPS)',
    provider: 'COOPS_OBS',
    group: 'estuary',
    defaultSelected: true,
  },
  {
    id: '9439221',
    label: '9439221 · Portland (CO-OPS predictions)',
    provider: 'COOPS_PRED',
    group: 'upriver',
  },
  {
    id: '9440083',
    label: '9440083 · Vancouver, WA (CO-OPS predictions)',
    provider: 'COOPS_PRED',
    group: 'upriver',
  },
]

export const BAR_PANEL_DEFAULTS = ['46029', '46243']
export const PICKER_DEFAULTS = ['46029', '46243', '9439040']

export const UPRIVER_STATIONS = ['9439221', '9440083']
export const ESTUARY_STATION = '9439040'
export const ESTUARY_DATUM_CAPABLE: Record<string, DatumCode[]> = {
  '9439040': ['MLLW', 'NAVD88'],
}

export const CRD_SUPPORTED_STATIONS = new Set(['9439221', '9440083'])
