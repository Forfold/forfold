import { Card, CardContent, Typography } from '@mui/material'

export function DashboardHeaderCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pacific Northwest ocean snapshot
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Wave and wind panels aggregate near real-time NDBC (National Data Buoy Center) buoy feeds.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          The estuary chart compares CO-OPS (Center for Operational Oceanographic Products and
          Services) observations with predictions for the estuary station you pick.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The upriver view shows forecasted water levels for Portland, Oregon and Vancouver,
          Washington.
        </Typography>
      </CardContent>
    </Card>
  )
}
