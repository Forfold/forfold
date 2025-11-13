import { Tooltip, Typography } from '@mui/material'
import type { TooltipProps, TypographyProps } from '@mui/material'
import { stationMeta } from '../stationInfo'
import type { StationDefinition } from '../types'

type StationLabelWithTooltipProps = {
  stationId: string
  label: string
  tooltip?: string
  placement?: TooltipProps['placement']
  truncate?: boolean
  variant?: TypographyProps['variant']
  color?: TypographyProps['color']
}

const PROVIDER_LABELS: Record<StationDefinition['provider'], string> = {
  NDBC: 'NDBC Buoy',
  COOPS_OBS: 'CO-OPS Gauge',
  COOPS_PRED: 'CO-OPS Prediction',
}

const TRUNCATED_SX: TypographyProps['sx'] = {
  display: 'block',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const DEFAULT_PLACEMENT: TooltipProps['placement'] = 'right'

const buildTooltipLabel = (stationId: string, fallbackLabel?: string) => {
  const station = stationMeta.get(stationId)
  if (!station) {
    return fallbackLabel ?? `Station ${stationId}`
  }
  const providerLabel = PROVIDER_LABELS[station.provider]
  return `${providerLabel ? providerLabel + ' ' : ''}${stationId}`
}

export function StationLabelWithTooltip({
  stationId,
  label,
  tooltip,
  placement = DEFAULT_PLACEMENT,
  truncate = true,
  variant = 'inherit',
  color,
}: StationLabelWithTooltipProps) {
  const tooltipLabel = tooltip ?? buildTooltipLabel(stationId, label)

  return (
    <Tooltip
      title={tooltipLabel}
      placement={placement}
      slotProps={{
        tooltip: {
          sx: (theme) => ({
            backgroundColor: theme.palette.primary.main,
          }),
        },
      }}
    >
      <Typography
        component="span"
        variant={variant}
        color={color}
        sx={{
          ...(truncate ? TRUNCATED_SX : undefined),
          width: 'fit-content',
        }}
      >
        {label}
      </Typography>
    </Tooltip>
  )
}
