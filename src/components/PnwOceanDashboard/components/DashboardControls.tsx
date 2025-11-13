import { type ChangeEvent } from 'react'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
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
import type { DatumCode } from '../types'
import { DATUM_OPTIONS } from '../constants'
import { DATE_RANGE_WINDOW_DAYS, useDashboardControls } from '../ControlsContext'
import { ESTUARY_STATION_OPTIONS, NDBC_STATION_OPTIONS, stripProviderSuffix } from '../stationInfo'
import { formatDateTimeLocalInput } from '../utils'

type DashboardControlsProps = {
  pickerMinDate: Date
  pickerMaxDate: Date
  onDateFieldChange: (key: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => void
}

const GRAPH_UNIT_TOOLTIPS: Record<DatumCode, string> = {
  MLLW: 'Mean Lower Low Water: standard NOAA tidal reference along the coast.',
  NAVD88: 'North American Vertical Datum 1988: stable inland elevation baseline.',
  CRD: 'Columbia River Datum: CO-OPS vertical reference for upriver predictions.',
}

export function DashboardControls({
  pickerMinDate,
  pickerMaxDate,
  onDateFieldChange,
}: DashboardControlsProps) {
  const {
    range,
    barPanels,
    estuaryStationId,
    setEstuaryStationId,
    datum,
    setDatum,
    showSuspect,
    setShowSuspect,
    handleBarPanelSelectionChange,
  } = useDashboardControls()

  return (
    <Stack spacing={2}>
      <Box>
        <FormLabel>Time Range (last {DATE_RANGE_WINDOW_DAYS} days)</FormLabel>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="From"
            type="datetime-local"
            value={formatDateTimeLocalInput(range.start)}
            onChange={onDateFieldChange('start')}
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
            onChange={onDateFieldChange('end')}
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
      <DatumToggle datum={datum} onChange={setDatum} />
      <QcToggle checked={showSuspect} onChange={setShowSuspect} />
    </Stack>
  )
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
