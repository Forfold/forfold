import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption, LineSeriesOption, YAXisComponentOption } from 'echarts'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Slider,
  CircularProgress,
} from '@mui/material'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  BAR_PANEL_DEFAULTS,
  DATUM_OPTIONS,
  DEFAULT_DATUM,
  DEFAULT_HISTORY_DAYS,
  ESTUARY_STATION,
  MAX_HISTORY_DAYS,
  PICKER_DEFAULTS,
  STATIONS,
  UPRIVER_STATIONS,
  CRD_SUPPORTED_STATIONS,
} from './constants'
import type { DatumCode, NdbcRow, PnwOceanDashboardProps, TimePoint } from './types'
import { fetchCoopsObs, fetchCoopsPred, fetchNdbc } from './data'
import { clampDate, formatRangeLabel, lttb, mergeResidual, toISO, toSeriesTuples } from './utils'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

const stationMeta = new Map(STATIONS.map((station) => [station.id, station]))

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

function StationPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const handleToggle = (stationId: string) => {
    onChange(
      value.includes(stationId) ? value.filter((id) => id !== stationId) : [...value, stationId]
    )
  }

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">Stations</FormLabel>
      <FormGroup>
        {STATIONS.map((station) => (
          <FormControlLabel
            key={station.id}
            control={
              <Checkbox
                checked={value.includes(station.id)}
                onChange={() => handleToggle(station.id)}
              />
            }
            label={station.label}
          />
        ))}
      </FormGroup>
    </FormControl>
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
      <FormLabel sx={{ mb: 1 }}>Datum</FormLabel>
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
          <ToggleButton key={option} value={option}>
            {option}
          </ToggleButton>
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
    <FormControlLabel
      control={<Switch checked={checked} onChange={(_event, next) => onChange(next)} />}
      label={checked ? 'Show suspect QC flags' : 'Hide suspect QC flags'}
    />
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
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'time',
      min: range[0],
      max: range[1],
    },
    yAxis: yAxes ?? [{ type: 'value' }],
    series,
    dataZoom: [
      { type: 'inside', filterMode: 'none', minSpan: 10 },
      { type: 'slider', height: 12, bottom: 10 },
    ],
    legend: { top: 0 },
  }
}

const EMPTY_SERIES_MSG = 'No data in range.'

export function PnwOceanDashboard(props: PnwOceanDashboardProps) {
  const defaults = computeDefaultRange(props)
  const domainStart = defaults.domainStart
  const domainEnd = defaults.domainEnd

  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const initial = computeDefaultRange(props)
    return { start: initial.start, end: initial.end }
  })
  const rangeSlider = useMemo<SliderRange>(
    () => [range.start.getTime(), range.end.getTime()],
    [range.start, range.end]
  )

  const [selectedStations, setSelectedStations] = useState<string[]>(
    props.defaultStations ?? PICKER_DEFAULTS
  )
  const [datum, setDatum] = useState<DatumCode>(props.defaultDatum ?? DEFAULT_DATUM)
  const [showSuspect, setShowSuspect] = useState(false)

  const isoRange = useMemo(() => ({ start: toISO(range.start), end: toISO(range.end) }), [range])

  const ndbcStations = useMemo(
    () => selectedStations.filter((stationId) => stationMeta.get(stationId)?.provider === 'NDBC'),
    [selectedStations]
  )

  const ndbcQueries = useQueries({
    queries: ndbcStations.map((stationId) => ({
      queryKey: ['ndbc', stationId, isoRange.start, isoRange.end],
      queryFn: () => fetchNdbc(stationId, isoRange.start, isoRange.end),
      enabled: !!stationId,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const estuaryDatum = datum === 'CRD' ? 'MLLW' : datum
  const estuaryObsQuery = useQuery({
    queryKey: ['coops', 'obs', ESTUARY_STATION, estuaryDatum, isoRange.start, isoRange.end],
    queryFn: () => fetchCoopsObs(ESTUARY_STATION, isoRange.start, isoRange.end, estuaryDatum),
  })
  const estuaryPredQuery = useQuery({
    queryKey: ['coops', 'pred', ESTUARY_STATION, estuaryDatum, isoRange.start, isoRange.end],
    queryFn: () =>
      fetchCoopsPred(ESTUARY_STATION, isoRange.start, isoRange.end, estuaryDatum, 'gmt'),
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
    if (!estuaryObsQuery.data) return []
    if (showSuspect) return estuaryObsQuery.data
    return estuaryObsQuery.data.filter((point) => !point.qc || point.qc === '0')
  }, [estuaryObsQuery.data, showSuspect])

  const estuaryResidual = useMemo(() => {
    if (!estuaryObsFiltered.length || !estuaryPredQuery.data?.length) return []
    return mergeResidual(estuaryObsFiltered, estuaryPredQuery.data)
  }, [estuaryObsFiltered, estuaryPredQuery.data])

  const brushMarks = useMemo(
    () => [domainStart.getTime(), domainEnd.getTime()],
    [domainStart, domainEnd]
  )

  const handleBrushChange = (_event: Event, value: number | number[]) => {
    if (!Array.isArray(value)) return
    const [startValue, endValue] = value
    if (typeof startValue !== 'number' || typeof endValue !== 'number') return
    if (endValue - startValue < 6 * HOUR_MS) return
    setRange({ start: new Date(startValue), end: new Date(endValue) })
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

  const waveChartOption = useMemo(() => {
    const series: LineSeriesOption[] = []
    ndbcStations.forEach((stationId, idx) => {
      const palette = ['#0E7C7B', '#F4A261', '#1D3557', '#FFB703']
      const color = palette[idx % palette.length]
      const wvht = waveSeries[stationId]?.WVHT ?? []
      const dpd = waveSeries[stationId]?.DPD ?? []
      if (wvht.length) {
        series.push({
          name: `${stationId} WVHT (m)`,
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
          name: `${stationId} DPD (s)`,
          type: 'line',
          showSymbol: false,
          lineStyle: { type: 'dashed' },
          itemStyle: { color },
          data: toSeriesTuples(dpd),
          smooth: true,
          yAxisIndex: 1,
        })
      }
    })

    if (!series.length) {
      return {
        title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' },
      }
    }

    return buildLineOption({
      range: rangeSlider,
      series,
      yAxes: [
        { type: 'value', name: 'Wave Height (m)' },
        { type: 'value', name: 'Period (s)', position: 'right' },
      ],
    })
  }, [ndbcStations, rangeSlider, waveSeries])

  const windChartOption = useMemo(() => {
    const series: LineSeriesOption[] = []
    ndbcStations.forEach((stationId, idx) => {
      const palette = ['#023047', '#219EBC', '#FFB703', '#FB8500']
      const color = palette[idx % palette.length]
      const wind = waveSeries[stationId]?.WSPD ?? []
      if (wind.length) {
        series.push({
          name: `${stationId} Wind (m/s)`,
          type: 'line',
          showSymbol: false,
          itemStyle: { color },
          data: toSeriesTuples(wind),
          smooth: true,
        })
      }
    })

    if (!series.length) {
      return {
        title: { text: EMPTY_SERIES_MSG, left: 'center', top: 'middle' },
      }
    }

    return buildLineOption({ range: rangeSlider, series })
  }, [ndbcStations, rangeSlider, waveSeries])

  const estuaryChartOption = useMemo(() => {
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
  }, [estuaryObsFiltered, estuaryPredQuery.data, estuaryResidual, rangeSlider])

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
    () => BAR_PANEL_DEFAULTS.every((id) => selectedStations.includes(id)),
    [selectedStations]
  )

  const selectionHelper = !hasBarPanelDefaults
    ? 'Tip: include 46029 & 46243 for complete bar coverage.'
    : undefined

  const loading =
    ndbcQueries.some((query) => query.isLoading) ||
    estuaryObsQuery.isLoading ||
    estuaryPredQuery.isLoading ||
    upriverQueries.some((query) => query.isLoading)

  const firstError =
    ndbcQueries.find((query) => query.error)?.error ||
    estuaryObsQuery.error ||
    estuaryPredQuery.error ||
    upriverQueries.find((query) => query.error)?.error
  const firstErrorMessage =
    firstError instanceof Error ? firstError.message : firstError ? String(firstError) : undefined

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Alert sx={{ width: '100%' }} severity="info">
          This view is under construction!
        </Alert>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Controls */}
          <Card variant="outlined">
            <CardHeader title="Controls" subheader={formatRangeLabel(range.start, range.end)} />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <FormLabel>Time Brush (last {MAX_HISTORY_DAYS} days)</FormLabel>
                  <Slider
                    value={rangeSlider}
                    onChange={handleBrushChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => new Date(value).toLocaleString()}
                    min={domainStart.getTime()}
                    max={domainEnd.getTime()}
                    step={HOUR_MS}
                    disableSwap
                    marks={brushMarks.map((mark) => ({ value: mark }))}
                    sx={{ mt: 2 }}
                  />
                </Box>

                <StationPicker value={selectedStations} onChange={setSelectedStations} />
                {selectionHelper && (
                  <Typography variant="caption" color="text.secondary">
                    {selectionHelper}
                  </Typography>
                )}

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
            {loading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">Refreshing NOAA feeds…</Typography>
              </Stack>
            )}

            <Card variant="outlined">
              <CardHeader title="Bar Conditions" subheader="Wave + wind" />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Wave Height & Period
                    </Typography>
                    <ReactECharts option={waveChartOption} style={{ height: 260 }} />
                  </Box>
                  <Divider flexItem />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Winds
                    </Typography>
                    <ReactECharts option={windChartOption} style={{ height: 220 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Estuary · Astoria (9439040)" subheader={`Datum ${estuaryDatum}`} />
              <CardContent>
                <ReactECharts option={estuaryChartOption} style={{ height: 320 }} />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Upriver Predictions" subheader="Portland + Vancouver" />
              <CardContent>
                <ReactECharts option={upriverChartOption} style={{ height: 320 }} />
                <Typography variant="caption" color="text.secondary">
                  Times shown in local (LST/LDT) per CO-OPS response.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
