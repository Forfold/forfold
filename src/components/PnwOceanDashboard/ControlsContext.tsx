import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import {
  BAR_PANEL_DEFAULTS,
  DEFAULT_DATUM,
  MAX_HISTORY_DAYS,
  PICKER_DEFAULTS,
} from './constants'
import type { DatumCode, PnwOceanDashboardProps } from './types'
import { ESTUARY_STATION_OPTIONS, stationMeta } from './stationInfo'
import { clampDate, computeDefaultRange, toISO } from './utils'

export type SliderRange = [number, number]

const DAY_MS = 24 * 60 * 60 * 1000
export const DATE_RANGE_WINDOW_DAYS = MAX_HISTORY_DAYS

type ControlsContextValue = {
  range: { start: Date; end: Date }
  setRange: React.Dispatch<React.SetStateAction<{ start: Date; end: Date }>>
  barPanels: string[]
  setBarPanels: React.Dispatch<React.SetStateAction<string[]>>
  estuaryStationId?: string
  setEstuaryStationId: React.Dispatch<React.SetStateAction<string | undefined>>
  datum: DatumCode
  setDatum: React.Dispatch<React.SetStateAction<DatumCode>>
  showSuspect: boolean
  setShowSuspect: React.Dispatch<React.SetStateAction<boolean>>
  isoRange: { start: string; end: string }
  rangeSlider: SliderRange
  handleBarPanelSelectionChange: (next: string[]) => void
  handleRemoveBarPanel: (stationId: string) => void
}

const ControlsContext = createContext<ControlsContextValue | null>(null)

export function useDashboardControls() {
  const ctx = useContext(ControlsContext)
  if (!ctx) {
    throw new Error('useDashboardControls must be used within PnwControlsProvider')
  }
  return ctx
}

type ControlsProviderProps = {
  children: ReactNode
  initialProps: PnwOceanDashboardProps
}

export function PnwControlsProvider({ children, initialProps }: ControlsProviderProps) {
  const value = useProvideControls(initialProps)
  return <ControlsContext.Provider value={value}>{children}</ControlsContext.Provider>
}

function useProvideControls(initialProps: PnwOceanDashboardProps): ControlsContextValue {
  const [range, setRange] = useState(() => {
    const initial = computeDefaultRange(initialProps)
    const now = new Date()
    const minDate = new Date(now.getTime() - DATE_RANGE_WINDOW_DAYS * DAY_MS)
    return {
      start: clampDate(initial.start, minDate, now),
      end: clampDate(initial.end, minDate, now),
    }
  })

  const [barPanels, setBarPanels] = useState<string[]>(() => {
    const hasCustomDefaults = Boolean(initialProps.defaultStations?.length)
    const defaults = hasCustomDefaults ? initialProps.defaultStations! : PICKER_DEFAULTS
    const buoys = defaults.filter((stationId) => stationMeta.get(stationId)?.provider === 'NDBC')
    if (buoys.length) {
      return hasCustomDefaults ? buoys : buoys.slice(0, 1)
    }
    return BAR_PANEL_DEFAULTS.slice(0, 1)
  })

  const [estuaryStationId, setEstuaryStationId] = useState<string | undefined>(() => {
    const defaults = initialProps.defaultStations ?? PICKER_DEFAULTS
    const lastCoops = defaults
      .filter((stationId) => stationMeta.get(stationId)?.provider === 'COOPS_OBS')
      .pop()
    return lastCoops ?? ESTUARY_STATION_OPTIONS[0]?.id
  })

  const [datum, setDatum] = useState<DatumCode>(initialProps.defaultDatum ?? DEFAULT_DATUM)
  const [showSuspect, setShowSuspect] = useState(false)

  const handleBarPanelSelectionChange = useCallback((next: string[]) => {
    setBarPanels(next)
  }, [])

  const handleRemoveBarPanel = useCallback((stationId: string) => {
    setBarPanels((prev) => prev.filter((id) => id !== stationId))
  }, [])

  const isoRange = useMemo(
    () => ({ start: toISO(range.start), end: toISO(range.end) }),
    [range.end, range.start]
  )

  const rangeSlider = useMemo<SliderRange>(
    () => [range.start.getTime(), range.end.getTime()],
    [range.end, range.start]
  )

  return {
    range,
    setRange,
    barPanels,
    setBarPanels,
    estuaryStationId,
    setEstuaryStationId,
    datum,
    setDatum,
    showSuspect,
    setShowSuspect,
    isoRange,
    rangeSlider,
    handleBarPanelSelectionChange,
    handleRemoveBarPanel,
  }
}
