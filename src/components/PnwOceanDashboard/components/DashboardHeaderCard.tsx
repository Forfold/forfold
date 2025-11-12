import { Stack, Typography } from '@mui/material'

import { ChartCard } from './ChartCard'

export function DashboardHeaderCard() {
  return (
    <ChartCard header={{ title: 'Pacific Northwest ocean snapshot' }}>
      <Stack spacing={1.25} sx={{ mt: -2 }}>
        <Typography variant="body2" color="text.secondary">
          › <b>Wave and wind panels</b> aggregate near real-time NDBC (National Data Buoy Center)
          buoy feeds.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          › <b>The estuary chart</b> compares CO-OPS (Center for Operational Oceanographic Products
          and Services) observations with predictions for the estuary station you pick.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          › <b>The upriver view</b> shows forecasted water levels for Portland, Oregon and
          Vancouver, Washington.
        </Typography>
      </Stack>
    </ChartCard>
  )
}
