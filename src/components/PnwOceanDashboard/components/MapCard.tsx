import { Box, Typography } from '@mui/material'
import { ChartCard } from './ChartCard'

export function MapCard() {
  return (
    <ChartCard header={{ title: 'Coastal Map', subheader: 'Buoy locations in the PNW' }}>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 180,
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
          Coming soon!
        </Typography>
      </Box>
    </ChartCard>
  )
}
