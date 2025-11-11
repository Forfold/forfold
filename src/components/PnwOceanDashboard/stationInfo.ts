import { STATIONS } from './constants'

export const stationMeta = new Map(STATIONS.map((station) => [station.id, station]))

export const NDBC_STATION_OPTIONS = STATIONS.filter((station) => station.provider === 'NDBC')
export const ESTUARY_STATION_OPTIONS = STATIONS.filter(
  (station) => station.provider === 'COOPS_OBS'
)

export function describeStation(stationId: string) {
  return stationMeta.get(stationId)?.label ?? stationId
}

export function stripProviderSuffix(label: string) {
  return label.replace(/\s*\((?:NDBC|CO-OPS[^)]*)\)\s*$/, '').trim()
}

export function formatStationChipLabel(stationId: string) {
  const station = stationMeta.get(stationId)
  if (!station) return stationId
  const segments = station.label.split('·').map((segment) => segment.trim())
  if (segments.length <= 1) return station.label
  const idPart = segments[0]
  const namePart = segments.slice(1).join(' · ')
  if (!namePart) return idPart
  return `${idPart} · ${namePart}`
}
