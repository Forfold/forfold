import { Card, CardContent, Typography } from '@mui/material'

export function DashboardHeaderCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pacific Northwest ocean snapshot
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Wave and wind panels aggregate near-real-time National Data Buoy Center (NDBC) buoy feeds.
          The estuary chart compares Center for Operational Oceanographic Products and Services
          (CO-OPS) observations with predictions for the estuary station you pick. The upriver view
          shows forecasted water levels for Portland, Oregon (OR) and Vancouver, Washington (WA).
        </Typography>
        <Typography variant="body2">
          Use the Controls card to choose stations, set a From/To window within the last 30 days,
          switch the graph unit for consistent vertical datums, and toggle quality control (QC)
          flags when inspecting suspect readings.
        </Typography>
      </CardContent>
    </Card>
  )
}
