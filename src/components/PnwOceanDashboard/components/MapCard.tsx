import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ChartCard } from './ChartCard'

type MapCardProps = {
  title?: ReactNode
  subheader?: ReactNode
  children?: ReactNode
}

export function MapCard({
  title = 'Map',
  subheader = 'Coming soon',
  children,
}: MapCardProps) {
  return (
    <ChartCard header={{ title, subheader }}>
      {children ?? (
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
            NOAA basemap placeholder
          </Typography>
        </Box>
      )}
    </ChartCard>
  )
}
