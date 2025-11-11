import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption, LineSeriesOption, YAXisComponentOption } from 'echarts'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  BAR_PANEL_DEFAULTS,
  DATUM_OPTIONS,
  DEFAULT_DATUM,
  DEFAULT_HISTORY_DAYS,
  ESTUARY_DATUM_CAPABLE,
  MAX_HISTORY_DAYS,
  PICKER_DEFAULTS,
  STATIONS,
  UPRIVER_STATIONS,
  CRD_SUPPORTED_STATIONS,
} from './constants'
import type { DatumCode, NdbcRow, PnwOceanDashboardProps, TimePoint } from './types'
import { fetchCoopsObs, fetchCoopsPred, fetchNdbc, NdbcFetchError } from './data'
import { clampDate, formatRangeLabel, lttb, mergeResidual, toISO, toSeriesTuples } from './utils'

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_RANGE_WINDOW_DAYS = MAX_HISTORY_DAYS

const stationMeta = new Map(STATIONS.map((station) => [station.id, station]))
const NDBC_STATION_OPTIONS = STATIONS.filter((station) => station.provider === 'NDBC')
const ESTUARY_STATION_OPTIONS = STATIONS.filter((station) => station.provider === 'COOPS_OBS')

const BUOY_COLOR_PALETTE = ['#0E7C7B', '#F4A261', '#1D3557', '#FFB703']
const BUOY_PANEL_COLORS = ['#E0F2F1', '#FFF3E0', '#E3F2FD', '#FFF9C4']
const CHART_CARD_SX = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
} as const
const CHART_CARD_CONTENT_SX = { flexGrow: 1, display: 'flex', flexDirection: 'column' } as const

type PanelCoverageStatus = 'ready' | 'caution' | 'blocked'

type PanelCoverageEntry = {
  id: 'bar' | 'estuary' | 'upriver'
  label: string
  status: PanelCoverageStatus
  message: string
}

const GRAPH_UNIT_TOOLTIPS: Record<DatumCode, string> = {
  MLLW: 'Mean Lower Low Water: standard NOAA tidal reference along the coast.',
  NAVD88: 'North American Vertical Datum 1988: stable inland elevation baseline.',
  CRD: 'Columbia River Datum: CO-OPS vertical reference for upriver predictions.',
}

function describeStation(stationId: string) {
  return stationMeta.get(stationId)?.label ?? stationId
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

function computeDefaultRange(props: PnwOceanDashboardProps) {
  const end = props.endISO ? new Date(props.endISO) : new Date()
  const maxDomainStart = new Date(end.getTime() - MAX_HISTORY_DAYS * DAY_MS)
  const defaultDays = props.defaultDays ?? DEFAULT_HISTORY_DAYS
  const defaultStartCandidate = props.startISO
    ? new Date(props.startISO)
    : new Date(end.getTime() - defaultDays * DAY_MS)
  const start = clampDate(defaultStartCandidate, maxDomainStart, end)
  return { start, end, domainStart: maxDomainStart, domainEnd: end }
}

type SliderRange = [number, number]

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

function BarStationSelector({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const handleToggle = (stationId: string) => {
    const next = value.includes(stationId)
      ? value.filter((id) => id !== stationId)
      : [...value, stationId]
    onChange(next)
  }

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">
        Bar Conditions buoys · National Data Buoy Center (NDBC)
      </FormLabel>
      <FormGroup>
        {NDBC_STATION_OPTIONS.map((station) => (
          <FormControlLabel
            key={station.id}
            control={
              <Checkbox
                checked={value.includes(station.id)}
                onChange={() => handleToggle(station.id)}
              />
            }
            label={stripProviderSuffix(station.label)}
          />
        ))}
      </FormGroup>
      <FormHelperText>
        Select multiple buoys to render parallel Bar Conditions panels. Removal updates both the
        list and the panels below.
      </FormHelperText>
    </FormControl>
  )
}

function EstuaryStationSelector({
  value,
  onChange,
}: {
  value?: string
  onChange: (next: string) => void
}) {
  const hasOptions = ESTUARY_STATION_OPTIONS.length > 0

  return (
    <FormControl component="fieldset" disabled={!hasOptions}>
      <FormLabel component="legend">
        Estuary gauge · Center for Operational Oceanographic Products and Services (CO-OPS)
      </FormLabel>
      {hasOptions ? (
        <RadioGroup
          value={value ?? ''}
          onChange={(event) => {
            const next = event.target.value
            if (next) onChange(next)
          }}
          name="estuary-stations"
        >
          {ESTUARY_STATION_OPTIONS.map((station) => (
            <FormControlLabel
              key={station.id}
              value={station.id}
              control={<Radio />}
              label={stripProviderSuffix(station.label)}
            />
          ))}
        </RadioGroup>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No CO-OPS gauges configured.
        </Typography>
      )}
      <FormHelperText>
        {hasOptions
          ? 'Pick one Center for Operational Oceanographic Products and Services (CO-OPS) gauge to populate the Estuary panel.'
          : 'Add a CO-OPS gauge in constants.ts to enable this panel.'}
      </FormHelperText>
    </FormControl>
  )
}

function stripProviderSuffix(label: string) {
  return label.replace(/\s*\((?:NDBC|CO-OPS[^)]*)\)\s*$/, '').trim()
}

function formatStationChipLabel(stationId: string) {
  const station = stationMeta.get(stationId)
  if (!station) return stationId
  const segments = station.label.split('·').map((segment) => segment.trim())
  if (segments.length <= 1) return station.label
  const idPart = segments[0]
  const namePart = segments.slice(1).join(' · ')
  if (!namePart) return idPart
  return `${idPart} · ${namePart}`
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

function PanelCoverageLegend({ entries }: { entries: PanelCoverageEntry[] }) {
  if (!entries.length) return null

  return (
    <Box>
      <FormLabel sx={{ display: 'block', mb: 1 }}>Panel coverage</FormLabel>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {entries.map((entry) => (
          <Chip
            key={entry.id}
            size="small"
            color={
              entry.status === 'ready'
                ? 'success'
                : entry.status === 'caution'
                  ? 'warning'
                  : 'default'
            }
            icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
            label={`${entry.label}: ${entry.message}`}
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Stack>
    </Box>
  )
}

function DatumToggle({
  datum,
  onChange,
}: {
  datum: DatumCode
  onChange: (next: DatumCode) => void
}) {
  return (
    <Box>
      <FormLabel sx={{ mb: 1, pr: 2 }}>Graph unit</FormLabel>
      <ToggleButtonGroup
        exclusive
        value={datum}
        onChange={(_event, value) => {
          const next = value as DatumCode | null
          if (next) {
            onChange(next)
          }
        }}
        size="small"
      >
        {DATUM_OPTIONS.map((option) => (
          <Tooltip key={option} title={GRAPH_UNIT_TOOLTIPS[option]} arrow enterTouchDelay={50}>
            <ToggleButton value={option}>{option}</ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        CRD applies to upriver stations only.
      </Typography>
    </Box>
  )
}

function QcToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Tooltip title="Toggle to show or hide data points flagged by NOAA quality control (QC).">
      <FormControlLabel
        control={<Switch checked={checked} onChange={(_event, next) => onChange(next)} />}
        label={checked ? 'Show suspect QC flags' : 'Hide suspect QC flags'}
      />
    </Tooltip>
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

function formatDateTimeLocalInput(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function parseDateTimeLocalInput(value: string) {
  if (!value) return undefined
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return undefined
  const [year, month, day] = datePart.split('-').map((segment) => Number(segment))
  const [hour, minute] = timePart.split(':').map((segment) => Number(segment))
  if ([year, month, day, hour, minute].some((segment) => Number.isNaN(segment))) return undefined
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0)
}

export function PnwOceanDashboard(props: PnwOceanDashboardProps) {
  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const initial = computeDefaultRange(props)
    const now = new Date()
    const minDate = new Date(now.getTime() - DATE_RANGE_WINDOW_DAYS * DAY_MS)
    return {
      start: clampDate(initial.start, minDate, now),
      end: clampDate(initial.end, minDate, now),
    }
  })

  const pickerMaxDate = new Date()
  const pickerMinDate = new Date(pickerMaxDate.getTime() - DATE_RANGE_WINDOW_DAYS * DAY_MS)
  const rangeSlider = useMemo<SliderRange>(
    () => [range.start.getTime(), range.end.getTime()],
    [range.start, range.end]
  )

  const [barPanels, setBarPanels] = useState<string[]>(() => {
    const defaults = props.defaultStations ?? PICKER_DEFAULTS
    const buoys = defaults.filter((stationId) => stationMeta.get(stationId)?.provider === 'NDBC')
    if (buoys.length) return buoys
    return BAR_PANEL_DEFAULTS.slice(0, 1)
  })
  const [estuaryStationId, setEstuaryStationId] = useState<string | undefined>(() => {
    const defaults = props.defaultStations ?? PICKER_DEFAULTS
    const lastCoops = defaults
      .filter((stationId) => stationMeta.get(stationId)?.provider === 'COOPS_OBS')
      .pop()
    return lastCoops ?? ESTUARY_STATION_OPTIONS[0]?.id
  })
  const [datum, setDatum] = useState<DatumCode>(props.defaultDatum ?? DEFAULT_DATUM)
  const [showSuspect, setShowSuspect] = useState(false)

  const handleRemoveBarPanel = useCallback((stationId: string) => {
    setBarPanels((prev) => prev.filter((id) => id !== stationId))
  }, [])

  const handleBarPanelSelectionChange = useCallback((next: string[]) => {
    setBarPanels(next)
  }, [])

  const isoRange = useMemo(() => ({ start: toISO(range.start), end: toISO(range.end) }), [range])

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
      const nextValue = parseDateTimeLocalInput(event.target.value)
      if (!nextValue) return
      const clampedValue = clampDate(nextValue, pickerMinDate, pickerMaxDate)
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
          <Card variant="outlined" sx={CHART_CARD_SX}>
            <CardHeader title="Bar Conditions" subheader="Wave + wind" />
            <CardContent sx={CHART_CARD_CONTENT_SX}>
              <PanelEmptyState message="Select a buoy in Controls to create a Bar Conditions panel." />
            </CardContent>
          </Card>
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

      const waveCard = (
        <Grid
          key={`${stationId}-wave`}
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', width: '100%' }}
        >
          <Card
            variant="outlined"
            sx={{
              ...CHART_CARD_SX,
              bgcolor: panelBgColor,
              transition: 'background-color 200ms ease',
            }}
          >
            <CardHeader
              title={`Bar Conditions · ${stationLabel}`}
              subheader="Wave Height & Period"
              action={
                disableRemoval ? (
                  removeButton
                ) : (
                  <Tooltip title="Remove panel">{removeButton}</Tooltip>
                )
              }
            />
            <CardContent sx={CHART_CARD_CONTENT_SX}>
              <Box sx={{ flexGrow: 1 }}>
                <EChartCanvas option={buildWaveChartOption(stationId)} height={260} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )

      const windCard = (
        <Grid
          key={`${stationId}-wind`}
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', width: '100%' }}
        >
          <Card
            variant="outlined"
            sx={{
              ...CHART_CARD_SX,
              bgcolor: panelBgColor,
              transition: 'background-color 200ms ease',
            }}
          >
            <CardHeader title={`Bar Conditions · ${stationLabel}`} subheader="Winds" />
            <CardContent sx={CHART_CARD_CONTENT_SX}>
              <Box sx={{ flexGrow: 1 }}>
                <EChartCanvas option={buildWindChartOption(stationId)} height={220} />
              </Box>
            </CardContent>
          </Card>
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pacific Northwest ocean snapshot
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Wave and wind panels aggregate near-real-time National Data Buoy Center (NDBC) buoy
            feeds. The estuary chart compares Center for Operational Oceanographic Products and
            Services (CO-OPS) observations with predictions for the estuary station you pick. The
            upriver view shows forecasted water levels for Portland, Oregon (OR) and Vancouver,
            Washington (WA).
          </Typography>
          <Typography variant="body2">
            Use the Controls card to choose stations, set a From/To window within the last 30 days,
            switch the graph unit for consistent vertical datums, and toggle quality control (QC)
            flags when inspecting suspect readings.
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Alert sx={{ width: '100%' }} severity="info">
          This view is under construction!
        </Alert>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Controls */}
          <Card variant="outlined">
            <CardHeader
              title="Controls"
              subheader={formatRangeLabel(range.start, range.end)}
              action={
                loading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2">
                      Refreshing National Oceanic and Atmospheric Administration (NOAA) feeds…
                    </Typography>
                  </Stack>
                ) : undefined
              }
              sx={{
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                '& .MuiCardHeader-action': {
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  marginTop: { xs: 1, md: 0 },
                  marginRight: 0,
                },
              }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <FormLabel>Time Range (last {DATE_RANGE_WINDOW_DAYS} days)</FormLabel>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      label="From"
                      type="datetime-local"
                      value={formatDateTimeLocalInput(range.start)}
                      onChange={handleDateFieldChange('start')}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      inputProps={{
                        min: formatDateTimeLocalInput(pickerMinDate),
                        max: formatDateTimeLocalInput(pickerMaxDate),
                      }}
                    />
                    <TextField
                      label="To"
                      type="datetime-local"
                      value={formatDateTimeLocalInput(range.end)}
                      onChange={handleDateFieldChange('end')}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      inputProps={{
                        min: formatDateTimeLocalInput(pickerMinDate),
                        max: formatDateTimeLocalInput(pickerMaxDate),
                      }}
                    />
                  </Stack>
                </Box>

                <BarStationSelector value={barPanels} onChange={handleBarPanelSelectionChange} />
                <EstuaryStationSelector value={estuaryStationId} onChange={setEstuaryStationId} />
                <PanelCoverageLegend entries={panelCoverage} />

                <DatumToggle datum={datum} onChange={setDatum} />
                <QcToggle checked={showSuspect} onChange={setShowSuspect} />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardHeader title="Map" subheader="Coming soon" />
            <CardContent>
              <Box
                sx={{
                  height: 180,
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  NOAA basemap placeholder
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {firstErrorMessage && <Alert severity="error">{firstErrorMessage}</Alert>}

            <Grid container spacing={2} alignItems="stretch">
              {barPanelCards}

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <Card variant="outlined" sx={CHART_CARD_SX}>
                  <CardHeader
                    title={estuaryCardTitle}
                    subheader={
                      estuaryDatum ? `Datum ${estuaryDatum}` : 'Choose a CO-OPS gauge in Controls'
                    }
                    action={
                      <StationChipRow
                        stationIds={estuaryStationId ? [estuaryStationId] : []}
                        emptyLabel="Pick a CO-OPS gauge"
                      />
                    }
                  />
                  <CardContent sx={CHART_CARD_CONTENT_SX}>
                    {estuaryStationId && estuaryDatum ? (
                      <Box sx={{ flexGrow: 1 }}>
                        <EChartCanvas option={estuaryChartOption} height={320} />
                      </Box>
                    ) : (
                      <PanelEmptyState message="Choose a CO-OPS estuary gauge in Controls to compare observed vs. predicted water levels." />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
                <Card variant="outlined" sx={CHART_CARD_SX}>
                  <CardHeader
                    title="Upriver Predictions"
                    subheader="Stations fixed to Portland (9439221) · Vancouver (9440083)"
                    action={<StationChipRow stationIds={UPRIVER_STATIONS} />}
                  />
                  <CardContent sx={CHART_CARD_CONTENT_SX}>
                    <Box sx={{ flexGrow: 1 }}>
                      <EChartCanvas option={upriverChartOption} height={320} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Times shown in local (LST/LDT) per CO-OPS response.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
