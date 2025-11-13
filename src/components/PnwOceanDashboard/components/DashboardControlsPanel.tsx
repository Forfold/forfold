import { type ChangeEvent } from 'react'
import { Card, CardContent, CardHeader } from '@mui/material'
import { DashboardControls } from './DashboardControls'

type DashboardControlsPanelProps = {
  pickerMinDate: Date
  pickerMaxDate: Date
  onDateFieldChange: (key: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => void
  rangeLabel: string
}

export function DashboardControlsPanel({
  pickerMinDate,
  pickerMaxDate,
  onDateFieldChange,
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
        />
      </CardContent>
    </Card>
  )
}
