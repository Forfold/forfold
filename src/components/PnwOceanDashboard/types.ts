export type DatumCode = 'MLLW' | 'NAVD88' | 'CRD'

export type TimePoint = {
  t: string
  v: number
  qc?: string
}

export type NdbcRow = {
  time: string
  WVHT?: number
  DPD?: number
  APD?: number
  WDIR?: number
  WSPD?: number
  GST?: number
  PRES?: number
  ATMP?: number
  WTMP?: number
}

export type CoopsObs = {
  data: Array<{ t: string; v: string; f?: string }>
}

export type CoopsPred = {
  predictions: Array<{ t: string; v: string; type?: 'H' | 'L' }>
}

export type StationDefinition = {
  id: string
  label: string
  provider: 'NDBC' | 'COOPS_OBS' | 'COOPS_PRED'
  group: 'ocean' | 'estuary' | 'upriver'
  defaultSelected?: boolean
  datumOptions?: DatumCode[]
}

export type PnwOceanDashboardProps = {
  defaultStations?: string[]
  defaultDatum?: DatumCode
  defaultDays?: number
  startISO?: string
  endISO?: string
}
