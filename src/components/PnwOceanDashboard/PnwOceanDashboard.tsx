import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as echarts from 'echarts'
import type { EChartsOption, LineSeriesOption, YAXisComponentOption } from 'echarts'
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useQueries, useQuery } from '@tanstack/react-query'
import { ESTUARY_DATUM_CAPABLE, UPRIVER_STATIONS, CRD_SUPPORTED_STATIONS } from './constants'
import type { DatumCode, NdbcRow, PnwOceanDashboardProps, TimePoint } from './types'
import { fetchCoopsObs, fetchCoopsPred, fetchNdbc, NdbcFetchError } from './data'
import {
  clampDate,
  formatRangeLabel,
  lttb,
  mergeResidual,
  parseDateTimeLocalInput,
  toSeriesTuples,
} from './utils'
import { describeStation, stationMeta, stripProviderSuffix } from './stationInfo'
import {
  DATE_RANGE_WINDOW_DAYS,
  PnwControlsProvider,
  type SliderRange,
  useDashboardControls,
} from './ControlsContext'
import { ChartCard } from './components/ChartCard'
import { DashboardControlsDrawer } from './components/DashboardControlsDrawer'
import { DashboardControlsPanel } from './components/DashboardControlsPanel'
import { DashboardHeaderCard } from './components/DashboardHeaderCard'
import { MapCard } from './components/MapCard'
import { StationLabelWithTooltip } from './components/StationLabelWithTooltip'
import { BUOY_COLOR_PALETTE } from './colors'

const DAY_MS = 24 * 60 * 60 * 1000

const BAR_CARD_VARIANTS = ['wave', 'period', 'wind'] as const
type BarCardVariant = (typeof BAR_CARD_VARIANTS)[number]
type BarCardFlags = Record<BarCardVariant, boolean>
type BarCardVisibilityState = Record<string, BarCardFlags>

type ChartThemeTokens = {
  backgroundColor: string
  textColor: string
  mutedTextColor: string
  axisLineColor: string
  gridLineColor: string
  tooltipBackground: string
  tooltipBorderColor: string
  dataZoomHandleColor: string
  dataZoomTrackColor: string
}

const stationPaletteIndex = (stationId: string, paletteLength: number) => {
  if (paletteLength <= 0) {
    return 0
  }
  let hash = 0
  for (let i = 0; i < stationId.length; i += 1) {
    hash = (hash * 31 + stationId.charCodeAt(i)) % 2147483647
  }
  return hash % paletteLength
}

const createLineColorStyles = (
  color: string
): Pick<LineSeriesOption, 'color' | 'lineStyle' | 'itemStyle' | 'emphasis'> => ({
  color,
  lineStyle: { width: 2, color },
  itemStyle: { color },
  emphasis: {
    focus: 'series',
    lineStyle: { width: 3, color },
  },
})

const BAR_CARD_FLAGS_DEFAULT: BarCardFlags = {
  wave: true,
  period: true,
  wind: true,
}

const createBarCardFlags = (): BarCardFlags => ({ ...BAR_CARD_FLAGS_DEFAULT })

const hasActiveBarCards = (flags: BarCardFlags | undefined) =>
  BAR_CARD_VARIANTS.some((variant) => Boolean(flags?.[variant]))
type DashboardWithDrawerProps = PnwOceanDashboardProps & {
  controlsDrawerOpen?: boolean
  onCloseControlsDrawer?: () => void
}

const EMPTY_SERIES_MSG = 'No data in range.'

function formatDashboardError(error: unknown) {
  if (!error) return undefined
  if (error instanceof NdbcFetchError) {
    const detail = error.attemptSummary
      ? `Proxy attempts failed (${error.attemptSummary}).`
      : 'All proxy attempts failed.'
    return `Can't reach NDBC feed for ${describeStation(error.stationId)}. ${detail} Try refreshing or temporarily deselecting that buoy.`
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return undefined
}

type EChartCanvasProps = {
  option: EChartsOption
  height: number
}

function EChartCanvas({ option, height }: EChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined
    const chart = echarts.init(node)
    chartRef.current = chart

    const handleWindowResize = () => chart.resize()
    let resizeObserver: ResizeObserver | null = null

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => chart.resize())
      resizeObserver.observe(node)
    } else {
      window.addEventListener('resize', handleWindowResize)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.unobserve(node)
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', handleWindowResize)
      }
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true, lazyUpdate: false })
  }, [option])

  return <Box ref={containerRef} sx={{ width: '100%', height }} />
}

function PanelEmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}

function ChartLoadingState({ height }: { height: number }) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={32} />
    </Box>
  )
}

function isSuspectValue(metric: keyof NdbcRow, value: number) {
  if (!Number.isFinite(value)) return true
  switch (metric) {
    case 'WVHT':
      return value < 0 || value > 25
    case 'DPD':
    case 'APD':
      return value <= 0 || value > 30
    case 'WSPD':
    case 'GST':
      return value < 0 || value > 60
    default:
      return false
  }
}

function toMetricSeries(
  rows: NdbcRow[] | undefined,
  metric: keyof NdbcRow,
  includeSuspect: boolean
): TimePoint[] {
  if (!rows) return []
  const series: TimePoint[] = []
  rows.forEach((row) => {
    const value = row[metric]
    if (typeof value !== 'number') return
    if (!includeSuspect && isSuspectValue(metric, value)) return
    series.push({ t: row.time, v: value })
  })
  return lttb(series)
}

function buildLineOption(
  {
    range,
    series,
    yAxes,
  }: {
    range: SliderRange
    series: LineSeriesOption[]
    yAxes?: YAXisComponentOption[]
  },
  chartTheme: ChartThemeTokens
): EChartsOption {
  const normalizedYAxes: YAXisComponentOption[] = (yAxes ?? [{ type: 'value' }]).map((axis) => {
    const defaultAlign = axis.position === 'right' ? 'left' : 'right'
    const existingLabel = axis.axisLabel ?? {}
    const axisLine = axis.axisLine ?? {}
    const axisLineStyle = axisLine.lineStyle ?? {}
    const splitLine = axis.splitLine ?? {}
    const splitLineStyle = splitLine.lineStyle ?? {}
    return {
      ...axis,
      axisLabel: {
        ...existingLabel,
        margin: existingLabel.margin ?? 12,
        align: existingLabel.align ?? defaultAlign,
        color: existingLabel.color ?? chartTheme.textColor,
      },
      axisLine: {
        ...axisLine,
        lineStyle: { ...axisLineStyle, color: chartTheme.axisLineColor },
      },
      splitLine: {
        ...splitLine,
        show: splitLine.show ?? true,
        lineStyle: { ...splitLineStyle, color: chartTheme.gridLineColor },
      },
    } as YAXisComponentOption
  })

  return {
    backgroundColor: chartTheme.backgroundColor,
    textStyle: { color: chartTheme.textColor },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: { color: chartTheme.axisLineColor },
        label: {
          backgroundColor: chartTheme.tooltipBackground,
          borderColor: chartTheme.tooltipBorderColor,
          borderWidth: 1,
          color: chartTheme.textColor,
        },
      },
      backgroundColor: chartTheme.tooltipBackground,
      borderColor: chartTheme.tooltipBorderColor,
      textStyle: { color: chartTheme.textColor },
    },
    grid: { left: 50, right: 20, top: 24, bottom: 40 },
    xAxis: {
      type: 'time',
      min: range[0],
      max: range[1],
      axisLabel: { inside: false, margin: 12, color: chartTheme.textColor },
      axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
      splitLine: { show: true, lineStyle: { color: chartTheme.gridLineColor } },
    },
    yAxis: normalizedYAxes,
    series,
    dataZoom: [
      { type: 'inside', filterMode: 'none', minSpan: 10 },
      {
        type: 'slider',
        height: 12,
        bottom: 10,
        textStyle: { color: chartTheme.textColor },
        borderColor: chartTheme.axisLineColor,
        handleStyle: { color: chartTheme.dataZoomHandleColor },
        fillerColor: chartTheme.dataZoomTrackColor,
        backgroundColor: chartTheme.backgroundColor,
        moveHandleStyle: { color: chartTheme.dataZoomHandleColor },
      },
    ],
    legend: {
      top: 0,
      textStyle: { color: chartTheme.textColor },
      inactiveColor: chartTheme.mutedTextColor,
    },
  }
}

const buildEmptyChartOption = (chartTheme: ChartThemeTokens): EChartsOption => ({
  backgroundColor: chartTheme.backgroundColor,
  title: {
    text: EMPTY_SERIES_MSG,
    left: 'center',
    top: 'middle',
    textStyle: { color: chartTheme.mutedTextColor },
  },
})

export function PnwOceanDashboard(props: DashboardWithDrawerProps) {
  const { controlsDrawerOpen, onCloseControlsDrawer, ...initialProps } = props
  return (
    <PnwControlsProvider initialProps={initialProps}>
      <DashboardContent
        controlsDrawerOpen={controlsDrawerOpen}
        onCloseControlsDrawer={onCloseControlsDrawer}
      />
    </PnwControlsProvider>
  )
}

function DashboardContent({
  controlsDrawerOpen = false,
  onCloseControlsDrawer,
}: {
  controlsDrawerOpen?: boolean
  onCloseControlsDrawer?: () => void
}) {
  const {
    range,
    setRange,
    barPanels,
    estuaryStationId,
    datum,
    showSuspect,
    isoRange,
    rangeSlider,
    handleRemoveBarPanel,
  } = useDashboardControls()

  const [barCardVisibility, setBarCardVisibility] = useState<BarCardVisibilityState>(() => {
    const initial: BarCardVisibilityState = {}
    barPanels.forEach((stationId) => {
      initial[stationId] = createBarCardFlags()
    })
    return initial
  })

  useEffect(() => {
    setBarCardVisibility((prev) => {
      let changed = false
      const next: BarCardVisibilityState = {}
      barPanels.forEach((stationId) => {
        const existing = prev[stationId]
        if (existing) {
          next[stationId] = existing
        } else {
          next[stationId] = createBarCardFlags()
          changed = true
        }
      })
      if (Object.keys(prev).length !== Object.keys(next).length) {
        changed = true
      }
      return changed ? next : prev
    })
  }, [barPanels])

  const handleCloseBarCard = useCallback(
    (stationId: string, variant: BarCardVariant) => {
      setBarCardVisibility((prev) => {
        const stationFlags = prev[stationId]
        if (!stationFlags?.[variant]) return prev
        const nextFlags: BarCardFlags = { ...stationFlags, [variant]: false }
        if (hasActiveBarCards(nextFlags)) {
          return { ...prev, [stationId]: nextFlags }
        }
        const { [stationId]: _removed, ...rest } = prev
        handleRemoveBarPanel(stationId)
        return rest
      })
    },
    [handleRemoveBarPanel]
  )

  const pickerMaxDate = new Date()
  const pickerMinDate = new Date(pickerMaxDate.getTime() - DATE_RANGE_WINDOW_DAYS * DAY_MS)
  const theme = useTheme()
  const showInlineControls = useMediaQuery(theme.breakpoints.up('md'))
  const drawerOpen = Boolean(!showInlineControls && controlsDrawerOpen)
  const chartTheme = useMemo<ChartThemeTokens>(() => {
    const isDark = theme.palette.mode === 'dark'
    return {
      backgroundColor: theme.palette.background.paper,
      textColor: theme.palette.text.primary,
      mutedTextColor: theme.palette.text.secondary,
      axisLineColor: alpha(theme.palette.divider, isDark ? 0.85 : 0.6),
      gridLineColor: alpha(isDark ? '#FFFFFF' : theme.palette.text.primary, isDark ? 0.18 : 0.08),
      tooltipBackground: alpha(
        isDark ? theme.palette.background.default : '#FFFFFF',
        isDark ? 0.98 : 0.92
      ),
      tooltipBorderColor: alpha(isDark ? '#FFFFFF' : theme.palette.divider, isDark ? 0.3 : 0.5),
      dataZoomHandleColor: theme.palette.primary.main,
      dataZoomTrackColor: alpha(theme.palette.primary.main, isDark ? 0.3 : 0.18),
    }
  }, [theme])

  useEffect(() => {
    if (showInlineControls && controlsDrawerOpen) {
      onCloseControlsDrawer?.()
    }
  }, [controlsDrawerOpen, onCloseControlsDrawer, showInlineControls])

  const handleDrawerClose = useCallback(() => {
    onCloseControlsDrawer?.()
  }, [onCloseControlsDrawer])
  const ndbcStations = barPanels
  const estuaryStation = estuaryStationId ? stationMeta.get(estuaryStationId) : undefined

  const estuaryCardTitle = useMemo(() => {
    if (!estuaryStation) return 'Estuary'
    const label = `Estuary · ${stripProviderSuffix(estuaryStation.label)}`
    return <StationLabelWithTooltip stationId={estuaryStation.id} label={label} variant="h5" />
  }, [estuaryStation])

  const ndbcQueries = useQueries({
    queries: ndbcStations.map((stationId) => ({
      queryKey: ['ndbc', stationId, isoRange.start, isoRange.end],
      queryFn: () => fetchNdbc(stationId, isoRange.start, isoRange.end),
      enabled: !!stationId,
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  })

  const ndbcLoadingByStation = useMemo(() => {
    const map: Record<string, boolean> = {}
    ndbcStations.forEach((stationId, idx) => {
      map[stationId] = Boolean(ndbcQueries[idx]?.isLoading)
    })
    return map
  }, [ndbcQueries, ndbcStations])

  const estuaryDatum = useMemo<DatumCode | undefined>(() => {
    if (!estuaryStationId) return undefined
    const allowed = ESTUARY_DATUM_CAPABLE[estuaryStationId]
    if (!allowed?.length) {
      return datum === 'CRD' ? 'MLLW' : datum
    }
    if (datum === 'CRD') {
      if (allowed.includes('CRD')) return 'CRD'
      const fallback = allowed.find((code) => code !== 'CRD')
      return fallback ?? allowed[0]
    }
    return allowed.includes(datum) ? datum : allowed[0]
  }, [datum, estuaryStationId])
  const estuaryObsQuery = useQuery({
    queryKey: ['coops', 'obs', estuaryStationId, estuaryDatum, isoRange.start, isoRange.end],
    queryFn: () => {
      if (!estuaryStationId || !estuaryDatum) {
        throw new Error('Missing estuary station or datum for observations fetch.')
      }
      return fetchCoopsObs(estuaryStationId, isoRange.start, isoRange.end, estuaryDatum)
    },
    enabled: Boolean(estuaryStationId && estuaryDatum),
  })
  const estuaryPredQuery = useQuery({
    queryKey: ['coops', 'pred', estuaryStationId, estuaryDatum, isoRange.start, isoRange.end],
    queryFn: () => {
      if (!estuaryStationId || !estuaryDatum) {
        throw new Error('Missing estuary station or datum for predictions fetch.')
      }
      return fetchCoopsPred(estuaryStationId, isoRange.start, isoRange.end, estuaryDatum, 'gmt')
    },
    enabled: Boolean(estuaryStationId && estuaryDatum),
  })

  const upriverQueries = useQueries({
    queries: UPRIVER_STATIONS.map((stationId) => ({
      queryKey: ['upriver', stationId, datum, isoRange.start, isoRange.end],
      queryFn: () =>
        fetchCoopsPred(
          stationId,
          isoRange.start,
          isoRange.end,
          datum === 'CRD' && CRD_SUPPORTED_STATIONS.has(stationId)
            ? 'CRD'
            : datum === 'CRD'
              ? 'NAVD88'
              : datum,
          'lst_ldt'
        ),
    })),
  })

  const estuaryObsFiltered = useMemo(() => {
    if (!estuaryStationId || !estuaryObsQuery.data) return []
    if (showSuspect) return estuaryObsQuery.data
    return estuaryObsQuery.data.filter((point) => !point.qc || point.qc === '0')
  }, [estuaryStationId, estuaryObsQuery.data, showSuspect])

  const estuaryResidual = useMemo(() => {
    if (!estuaryStationId || !estuaryObsFiltered.length || !estuaryPredQuery.data?.length) return []
    return mergeResidual(estuaryObsFiltered, estuaryPredQuery.data)
  }, [estuaryStationId, estuaryObsFiltered, estuaryPredQuery.data])

  const handleDateFieldChange =
    (field: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => {
      const parsedValue = parseDateTimeLocalInput(event.currentTarget.value)
      if (!parsedValue) return
      const clampedValue = clampDate(parsedValue, pickerMinDate, pickerMaxDate)
      setRange((prev) => {
        if (field === 'start') {
          const nextStart = clampedValue
          const nextEnd = prev.end < nextStart ? nextStart : prev.end
          return { start: nextStart, end: nextEnd }
        }
        const nextEnd = clampedValue
        const nextStart = prev.start > nextEnd ? nextEnd : prev.start
        return { start: nextStart, end: nextEnd }
      })
    }

  const waveSeries = useMemo(() => {
    const result: Record<string, { WVHT: TimePoint[]; DPD: TimePoint[]; WSPD: TimePoint[] }> = {}
    ndbcStations.forEach((stationId, idx) => {
      const data = ndbcQueries[idx]?.data
      result[stationId] = {
        WVHT: toMetricSeries(data, 'WVHT', showSuspect),
        DPD: toMetricSeries(data, 'DPD', showSuspect),
        WSPD: toMetricSeries(data, 'WSPD', showSuspect),
      }
    })
    return result
  }, [ndbcStations, ndbcQueries, showSuspect])
  const getBuoyColor = useCallback((stationId: string) => {
    const paletteIndex = stationPaletteIndex(stationId, BUOY_COLOR_PALETTE.length)
    return BUOY_COLOR_PALETTE[paletteIndex]
  }, [])

  const buildWaveHeightChartOption = useCallback(
    (stationId: string) => {
      const color = getBuoyColor(stationId)
      const wvht = waveSeries[stationId]?.WVHT ?? []
      if (!wvht.length) {
        return buildEmptyChartOption(chartTheme)
      }
      const colorStyles = createLineColorStyles(color)
      return buildLineOption(
        {
          range: rangeSlider,
          series: [
            {
              name: 'Wave Height (m)',
              type: 'line',
              showSymbol: false,
              ...colorStyles,
              data: toSeriesTuples(wvht),
              smooth: true,
            },
          ],
          yAxes: [{ type: 'value', name: 'Wave Height (m)' }],
        },
        chartTheme
      )
    },
    [chartTheme, getBuoyColor, rangeSlider, waveSeries]
  )

  const buildPeriodChartOption = useCallback(
    (stationId: string) => {
      const color = getBuoyColor(stationId)
      const dpd = waveSeries[stationId]?.DPD ?? []
      if (!dpd.length) {
        return buildEmptyChartOption(chartTheme)
      }
      const colorStyles = createLineColorStyles(color)
      return buildLineOption(
        {
          range: rangeSlider,
          series: [
            {
              name: 'Dominant Period (s)',
              type: 'line',
              showSymbol: false,
              ...colorStyles,
              data: toSeriesTuples(dpd),
              smooth: true,
            },
          ],
          yAxes: [{ type: 'value', name: 'Period (s)' }],
        },
        chartTheme
      )
    },
    [chartTheme, getBuoyColor, rangeSlider, waveSeries]
  )

  const buildWindChartOption = useCallback(
    (stationId: string) => {
      const color = getBuoyColor(stationId)
      const wind = waveSeries[stationId]?.WSPD ?? []
      if (!wind.length) {
        return buildEmptyChartOption(chartTheme)
      }
      const colorStyles = createLineColorStyles(color)
      return buildLineOption(
        {
          range: rangeSlider,
          series: [
            {
              name: 'Wind Speed (m/s)',
              type: 'line',
              showSymbol: false,
              ...colorStyles,
              data: toSeriesTuples(wind),
              smooth: true,
            },
          ],
        },
        chartTheme
      )
    },
    [chartTheme, getBuoyColor, rangeSlider, waveSeries]
  )

  const barPanelCards = useMemo(() => {
    if (!barPanels.length) {
      return [
        <Grid key="bar-empty" size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
          <ChartCard
            header={{ title: 'Bar Conditions', subheader: 'Wave + wind' }}
            contentProps={{ sx: { justifyContent: 'center' } }}
          >
            <PanelEmptyState message="Select a buoy in Controls to create a Bar Conditions panel." />
          </ChartCard>
        </Grid>,
      ]
    }

    return barPanels.flatMap((stationId) => {
      const stationLabel = describeStation(stationId)
      const stationCards = barCardVisibility[stationId] ?? BAR_CARD_FLAGS_DEFAULT
      const stationLoading = ndbcLoadingByStation[stationId] ?? false
      if (!hasActiveBarCards(stationCards)) {
        return []
      }
      const barTitleLabel = `Bar Conditions · ${stationLabel}`
      const renderBarCardTitle = () => (
        <StationLabelWithTooltip stationId={stationId} label={barTitleLabel} variant="h5" />
      )

      const renderCloseButton = (variant: BarCardVariant) => {
        const tooltipLabel =
          variant === 'wave'
            ? 'Hide wave height card'
            : variant === 'period'
              ? 'Hide dominant period card'
              : 'Hide winds card'
        return (
          <Tooltip title={tooltipLabel}>
            <IconButton
              size="small"
              aria-label={`${tooltipLabel} for ${stationLabel}`}
              onClick={() => handleCloseBarCard(stationId, variant)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }

      const baseCardSx = {
        transition: 'background-color 200ms ease',
      }

      const cards: ReactNode[] = []

      if (stationCards.wave) {
        cards.push(
          <Grid
            key={`${stationId}-wave`}
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', width: '100%' }}
          >
            <ChartCard
              header={{
                title: renderBarCardTitle(),
                subheader: 'Wave Height',
                action: renderCloseButton('wave'),
              }}
              sx={baseCardSx}
            >
              {stationLoading ? (
                <ChartLoadingState height={240} />
              ) : (
                <Box sx={{ flexGrow: 1 }}>
                  <EChartCanvas option={buildWaveHeightChartOption(stationId)} height={240} />
                </Box>
              )}
            </ChartCard>
          </Grid>
        )
      }

      if (stationCards.period) {
        cards.push(
          <Grid
            key={`${stationId}-period`}
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', width: '100%' }}
          >
            <ChartCard
              header={{
                title: renderBarCardTitle(),
                subheader: 'Dominant Period',
                action: renderCloseButton('period'),
              }}
              sx={baseCardSx}
            >
              {stationLoading ? (
                <ChartLoadingState height={220} />
              ) : (
                <Box sx={{ flexGrow: 1 }}>
                  <EChartCanvas option={buildPeriodChartOption(stationId)} height={220} />
                </Box>
              )}
            </ChartCard>
          </Grid>
        )
      }

      if (stationCards.wind) {
        cards.push(
          <Grid
            key={`${stationId}-wind`}
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', width: '100%' }}
          >
            <ChartCard
              header={{
                title: renderBarCardTitle(),
                subheader: 'Winds',
                action: renderCloseButton('wind'),
              }}
              sx={baseCardSx}
            >
              {stationLoading ? (
                <ChartLoadingState height={220} />
              ) : (
                <Box sx={{ flexGrow: 1 }}>
                  <EChartCanvas option={buildWindChartOption(stationId)} height={220} />
                </Box>
              )}
            </ChartCard>
          </Grid>
        )
      }

      return cards
    })
  }, [
    barCardVisibility,
    barPanels,
    buildWaveHeightChartOption,
    buildPeriodChartOption,
    buildWindChartOption,
    ndbcLoadingByStation,
    handleCloseBarCard,
  ])

  const estuaryChartOption = useMemo(() => {
    if (!estuaryStationId) {
      return buildEmptyChartOption(chartTheme)
    }
    if (!estuaryObsFiltered.length && !estuaryPredQuery.data?.length) {
      return buildEmptyChartOption(chartTheme)
    }
    const obsSeries = lttb(estuaryObsFiltered)
    const predSeries = lttb(estuaryPredQuery.data ?? [])
    const residualSeries = lttb(estuaryResidual)

    const series: LineSeriesOption[] = []
    if (obsSeries.length) {
      series.push({
        name: 'Observed',
        type: 'line',
        data: toSeriesTuples(obsSeries),
        showSymbol: false,
        itemStyle: { color: '#1D3557' },
      })
    }
    if (predSeries.length) {
      series.push({
        name: 'Predicted',
        type: 'line',
        data: toSeriesTuples(predSeries),
        showSymbol: false,
        itemStyle: { color: '#457B9D' },
      })
    }
    if (residualSeries.length) {
      series.push({
        name: 'Residual',
        type: 'line',
        data: toSeriesTuples(residualSeries),
        showSymbol: false,
        itemStyle: { color: '#E63946' },
        yAxisIndex: 1,
      })
    }

    return buildLineOption(
      {
        range: rangeSlider,
        series,
        yAxes: [
          { type: 'value', name: 'Water Level (m)' },
          { type: 'value', name: 'Residual (m)', position: 'right' },
        ],
      },
      chartTheme
    )
  }, [
    chartTheme,
    estuaryStationId,
    estuaryObsFiltered,
    estuaryPredQuery.data,
    estuaryResidual,
    rangeSlider,
  ])

  const upriverChartOption = useMemo(() => {
    const series: LineSeriesOption[] = []
    upriverQueries.forEach((query, idx) => {
      const stationId = UPRIVER_STATIONS[idx]
      const data = lttb(query.data ?? [])
      if (!data.length) return
      series.push({
        name: `${stationId} Prediction`,
        type: 'line',
        data: toSeriesTuples(data),
        showSymbol: false,
      })
    })

    if (!series.length) {
      return buildEmptyChartOption(chartTheme)
    }

    return buildLineOption({ range: rangeSlider, series }, chartTheme)
  }, [chartTheme, rangeSlider, upriverQueries])

  const estuaryLoading = Boolean(
    estuaryStationId && estuaryDatum && (estuaryObsQuery.isLoading || estuaryPredQuery.isLoading)
  )
  const upriverLoading = upriverQueries.some((query) => query.isLoading)

  const estuaryError =
    estuaryStationId && estuaryDatum ? estuaryObsQuery.error || estuaryPredQuery.error : undefined

  const firstError =
    ndbcQueries.find((query) => query.error)?.error ||
    estuaryError ||
    upriverQueries.find((query) => query.error)?.error
  const firstErrorMessage = formatDashboardError(firstError)
  const rangeLabel = formatRangeLabel(range.start, range.end)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
      {!showInlineControls && (
        <DashboardControlsDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          pickerMinDate={pickerMinDate}
          pickerMaxDate={pickerMaxDate}
          onDateFieldChange={handleDateFieldChange}
        />
      )}
      <Grid container spacing={{ xs: 1, md: 2 }}>
        <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Stack spacing={2}>
            {showInlineControls && (
              <DashboardControlsPanel
                pickerMinDate={pickerMinDate}
                pickerMaxDate={pickerMaxDate}
                onDateFieldChange={handleDateFieldChange}
                rangeLabel={rangeLabel}
              />
            )}

            <MapCard />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Stack spacing={2}>
            {firstErrorMessage && <Alert severity="error">{firstErrorMessage}</Alert>}

            <Grid container spacing={{ xs: 1, md: 2 }} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <DashboardHeaderCard />
              </Grid>

              {barPanelCards}

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <ChartCard
                  header={{
                    title: estuaryCardTitle,
                    subheader: estuaryDatum
                      ? `Datum ${estuaryDatum}`
                      : 'Choose a CO-OPS gauge in Controls',
                  }}
                >
                  {estuaryStationId && estuaryDatum ? (
                    estuaryLoading ? (
                      <ChartLoadingState height={320} />
                    ) : (
                      <Box sx={{ flexGrow: 1 }}>
                        <EChartCanvas option={estuaryChartOption} height={320} />
                      </Box>
                    )
                  ) : (
                    <PanelEmptyState message="Choose a CO-OPS estuary gauge in Controls to compare observed vs. predicted water levels." />
                  )}
                </ChartCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <ChartCard
                  header={{
                    title: 'Upriver Predictions',
                    subheader: 'Stations fixed to Portland (9439221) · Vancouver (9440083)',
                  }}
                >
                  {upriverLoading ? (
                    <ChartLoadingState height={320} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <EChartCanvas option={upriverChartOption} height={320} />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Times shown in local (LST/LDT) per CO-OPS response.
                  </Typography>
                </ChartCard>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
