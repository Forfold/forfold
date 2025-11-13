import { type ChangeEvent } from 'react'
import { Card, CardContent, CardHeader } from '@mui/material'
import { DashboardControls, type PanelCoverageEntry } from './DashboardControls'

type DashboardControlsPanelProps = {
  pickerMinDate: Date
  pickerMaxDate: Date
  onDateFieldChange: (key: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => void
  panelCoverage: PanelCoverageEntry[]
  rangeLabel: string
}

export function DashboardControlsPanel({
  pickerMinDate,
  pickerMaxDate,
  onDateFieldChange,
  panelCoverage,
  rangeLabel,
}: DashboardControlsPanelProps) {
  return (
    <Card variant="outlined">
      <CardHeader
        title="Controls"
        subheader={rangeLabel}
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
        <DashboardControls
          pickerMinDate={pickerMinDate}
          pickerMaxDate={pickerMaxDate}
          onDateFieldChange={onDateFieldChange}
          panelCoverage={panelCoverage}
        />
      </CardContent>
    </Card>
  )
}
