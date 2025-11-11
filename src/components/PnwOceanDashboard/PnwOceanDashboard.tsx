import { type ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption, LineSeriesOption, YAXisComponentOption } from 'echarts'
import { Alert, Box, Chip, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  BAR_PANEL_DEFAULTS,
  ESTUARY_DATUM_CAPABLE,
  UPRIVER_STATIONS,
  CRD_SUPPORTED_STATIONS,
} from './constants'
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
import { describeStation, formatStationChipLabel, stationMeta } from './stationInfo'
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
import { type PanelCoverageEntry, type PanelCoverageStatus } from './components/DashboardControls'
import { MapCard } from './components/MapCard'

const DAY_MS = 24 * 60 * 60 * 1000

const BUOY_COLOR_PALETTE = ['#0E7C7B', '#F4A261', '#1D3557', '#FFB703']
const BUOY_PANEL_COLORS = ['#E0F2F1', '#FFF3E0', '#E3F2FD', '#FFF9C4']
type DashboardWithDrawerProps = PnwOceanDashboardProps & {
  controlsDrawerOpen?: boolean
  onCloseControlsDrawer?: () => void
}

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

function StationChipRow({
  stationIds,
  palette = [],
  emptyLabel,
}: {
  stationIds: string[]
  palette?: string[]
  emptyLabel?: string
}) {
  if (!stationIds.length) {
    return emptyLabel ? (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    ) : null
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
      {stationIds.map((stationId, index) => {
        const color = palette[index % palette.length]
        return (
          <Chip
            key={stationId}
            label={formatStationChipLabel(stationId)}
            size="small"
            sx={color ? { bgcolor: color, color: '#fff', fontWeight: 500 } : undefined}
          />
        )
      })}
    </Stack>
  )
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

function buildLineOption({
  range,
  series,
  yAxes,
}: {
  range: SliderRange
  series: LineSeriesOption[]
  yAxes?: YAXisComponentOption[]
}): EChartsOption {
  const normalizedYAxes: YAXisComponentOption[] = (yAxes ?? [{ type: 'value' }]).map((axis) => {
    const defaultAlign = axis.position === 'right' ? 'left' : 'right'
    const existingLabel = axis.axisLabel ?? {}
    return {
      ...axis,
      axisLabel: {
        ...existingLabel,
        margin: existingLabel.margin ?? 12,
        align: existingLabel.align ?? defaultAlign,
      },
    } as YAXisComponentOption
  })

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'time',
      min: range[0],
      max: range[1],
      axisLabel: { inside: false, margin: 12 },
    },
    yAxis: normalizedYAxes,
    series,
    dataZoom: [
      { type: 'inside', filterMode: 'none', minSpan: 10 },
      { type: 'slider', height: 12, bottom: 10 },
    ],
    legend: { top: 0 },
  }
}

const EMPTY_SERIES_MSG = 'No data in range.'

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

  const pickerMaxDate = new Date()
  const pickerMinDate = new Date(pickerMaxDate.getTime() - DATE_RANGE_WINDOW_DAYS * DAY_MS)
  const theme = useTheme()
  const showInlineControls = useMediaQuery(theme.breakpoints.up('md'))
  const drawerOpen = Boolean(!showInlineControls && controlsDrawerOpen)

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
    const segments = estuaryStation.label.split('·').map((segment) => segment.trim())
    const idPart = segments[0]
    const namePart = segments.slice(1).join(' · ')
    if (!idPart) return `Estuary · ${estuaryStation.label}`
    if (!namePart) return `Estuary · ${idPart}`
    return `Estuary · ${namePart} (${idPart})`
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
  const getBuoyColor = useCallback(
    (stationId: string) => {
      const index = barPanels.indexOf(stationId)
      const paletteIndex = index >= 0 ? index % BUOY_COLOR_PALETTE.length : 0
      return BUOY_COLOR_PALETTE[paletteIndex]
    },
    [barPanels]
  )

  const getBuoyPanelColor = useCallback(
    (stationId: string) => {
      const index = barPanels.indexOf(stationId)
      const paletteIndex = index >= 0 ? index % BUOY_PANEL_COLORS.length : 0
      return BUOY_PANEL_COLORS[paletteIndex]
    },
    [barPanels]
  )

  const buildWaveChartOption = useCallback(
    (stationId: string) => {
      const color = getBuoyColor(stationId)
      const wvht = waveSeries[stationId]?.WVHT ?? []
      const dpd = waveSeries[stationId]?.DPD ?? []
      const series: LineSeriesOption[] = []
      if (wvht.length) {
        series.push({
          name: 'Wave Height (m)',
          type: 'line',
          showSymbol: false,
          itemStyle: { color },
          data: toSeriesTuples(wvht),
          smooth: true,
          yAxisIndex: 0,
        })
      }
      if (dpd.length) {
        series.push({
          name: 'Dominant Period (s)',
          type: 'line',
          showSymbol: false,
          lineStyle: { type: 'dashed' },
          itemStyle: { color },
          data: toSeriesTuples(dpd),
          smooth: true,
          yAxisIndex: 1,
        })
      }
      if (!series.length) {
        return { title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' } }
      }
      return buildLineOption({
        range: rangeSlider,
        series,
        yAxes: [
          { type: 'value', name: 'Wave Height (m)' },
          { type: 'value', name: 'Period (s)', position: 'right' },
        ],
      })
    },
    [getBuoyColor, rangeSlider, waveSeries]
  )

  const buildWindChartOption = useCallback(
    (stationId: string) => {
      const color = getBuoyColor(stationId)
      const wind = waveSeries[stationId]?.WSPD ?? []
      if (!wind.length) {
        return { title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' } }
      }
      return buildLineOption({
        range: rangeSlider,
        series: [
          {
            name: 'Wind Speed (m/s)',
            type: 'line',
            showSymbol: false,
            itemStyle: { color },
            data: toSeriesTuples(wind),
            smooth: true,
          },
        ],
      })
    },
    [getBuoyColor, rangeSlider, waveSeries]
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
      const disableRemoval = barPanels.length <= 1
      const panelBgColor = getBuoyPanelColor(stationId)
      const removeButton = (
        <span>
          <IconButton
            size="small"
            aria-label="Remove buoy panel"
            onClick={() => handleRemoveBarPanel(stationId)}
            disabled={disableRemoval}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      )
      const baseCardSx = {
        bgcolor: panelBgColor,
        transition: 'background-color 200ms ease',
      }

      const waveCard = (
        <Grid
          key={`${stationId}-wave`}
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', width: '100%' }}
        >
          <ChartCard
            header={{
              title: `Bar Conditions · ${stationLabel}`,
              subheader: 'Wave Height & Period',
              action: disableRemoval ? (
                removeButton
              ) : (
                <Tooltip title="Remove panel">{removeButton}</Tooltip>
              ),
            }}
            sx={baseCardSx}
          >
            <Box sx={{ flexGrow: 1 }}>
              <EChartCanvas option={buildWaveChartOption(stationId)} height={260} />
            </Box>
          </ChartCard>
        </Grid>
      )

      const windCard = (
        <Grid
          key={`${stationId}-wind`}
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', width: '100%' }}
        >
          <ChartCard
            header={{ title: `Bar Conditions · ${stationLabel}`, subheader: 'Winds' }}
            sx={baseCardSx}
          >
            <Box sx={{ flexGrow: 1 }}>
              <EChartCanvas option={buildWindChartOption(stationId)} height={220} />
            </Box>
          </ChartCard>
        </Grid>
      )

      return [waveCard, windCard]
    })
  }, [
    barPanels,
    buildWaveChartOption,
    buildWindChartOption,
    getBuoyPanelColor,
    handleRemoveBarPanel,
  ])

  const estuaryChartOption = useMemo(() => {
    if (!estuaryStationId) {
      return { title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' } }
    }
    if (!estuaryObsFiltered.length && !estuaryPredQuery.data?.length) {
      return { title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' } }
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

    return buildLineOption({
      range: rangeSlider,
      series,
      yAxes: [
        { type: 'value', name: 'Water Level (m)' },
        { type: 'value', name: 'Residual (m)', position: 'right' },
      ],
    })
  }, [estuaryStationId, estuaryObsFiltered, estuaryPredQuery.data, estuaryResidual, rangeSlider])

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
      return { title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' } }
    }

    return buildLineOption({ range: rangeSlider, series })
  }, [rangeSlider, upriverQueries])

  const hasBarPanelDefaults = useMemo(
    () => BAR_PANEL_DEFAULTS.every((id) => barPanels.includes(id)),
    [barPanels]
  )

  const panelCoverage = useMemo<PanelCoverageEntry[]>(() => {
    const entries: PanelCoverageEntry[] = []
    const barStatus: PanelCoverageStatus = barPanels.length
      ? hasBarPanelDefaults
        ? 'ready'
        : 'caution'
      : 'blocked'
    const barMessage = !barPanels.length
      ? 'Select a buoy to create a Bar Conditions panel.'
      : hasBarPanelDefaults
        ? 'Panels cover the full Columbia River Bar.'
        : 'Add 46029 + 46243 for complete bar coverage.'
    entries.push({ id: 'bar', label: 'Bar Conditions', status: barStatus, message: barMessage })

    const estuaryStatus: PanelCoverageStatus = estuaryStationId ? 'ready' : 'blocked'
    const estuaryMessage = estuaryStationId
      ? `Showing ${describeStation(estuaryStationId)}.`
      : 'Pick a CO-OPS gauge to power the Estuary chart.'
    entries.push({
      id: 'estuary',
      label: 'Estuary',
      status: estuaryStatus,
      message: estuaryMessage,
    })

    entries.push({
      id: 'upriver',
      label: 'Upriver',
      status: 'ready',
      message: 'Stations fixed to Portland (9439221) & Vancouver (9440083).',
    })

    return entries
  }, [barPanels.length, estuaryStationId, hasBarPanelDefaults])

  const estuaryLoading = Boolean(
    estuaryStationId && estuaryDatum && (estuaryObsQuery.isLoading || estuaryPredQuery.isLoading)
  )

  const loading =
    ndbcQueries.some((query) => query.isLoading) ||
    estuaryLoading ||
    upriverQueries.some((query) => query.isLoading)

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
          panelCoverage={panelCoverage}
        />
      )}
      <DashboardHeaderCard />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Alert sx={{ width: '100%' }} severity="info">
          This view is under construction!
        </Alert>
      </Box>
      <Grid container spacing={{ xs: 1, md: 2 }}>
        <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Stack spacing={2}>
            {showInlineControls && (
              <DashboardControlsPanel
                pickerMinDate={pickerMinDate}
                pickerMaxDate={pickerMaxDate}
                onDateFieldChange={handleDateFieldChange}
                panelCoverage={panelCoverage}
                rangeLabel={rangeLabel}
                loading={loading}
              />
            )}

            <MapCard />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Stack spacing={2}>
            {firstErrorMessage && <Alert severity="error">{firstErrorMessage}</Alert>}

            <Grid container spacing={{ xs: 1, md: 2 }} alignItems="stretch">
              {barPanelCards}

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <ChartCard
                  header={{
                    title: estuaryCardTitle,
                    subheader: estuaryDatum
                      ? `Datum ${estuaryDatum}`
                      : 'Choose a CO-OPS gauge in Controls',
                    action: (
                      <StationChipRow
                        stationIds={estuaryStationId ? [estuaryStationId] : []}
                        emptyLabel="Pick a CO-OPS gauge"
                      />
                    ),
                  }}
                >
                  {estuaryStationId && estuaryDatum ? (
                    <Box sx={{ flexGrow: 1 }}>
                      <EChartCanvas option={estuaryChartOption} height={320} />
                    </Box>
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
                    action: <StationChipRow stationIds={UPRIVER_STATIONS} />,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <EChartCanvas option={upriverChartOption} height={320} />
                  </Box>
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
