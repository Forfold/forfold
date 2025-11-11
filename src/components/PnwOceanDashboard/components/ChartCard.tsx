import { Card, CardContent, CardHeader, type CardContentProps, type CardHeaderProps, type CardProps } from '@mui/material'
import type { ReactNode } from 'react'

const CHART_CARD_SX = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
} as const

const CHART_CARD_CONTENT_SX = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
} as const

type ChartCardProps = {
  header: CardHeaderProps
  contentProps?: CardContentProps
  children: ReactNode
} & Omit<CardProps, 'children'>

export function ChartCard({ header, contentProps, children, sx, ...cardProps }: ChartCardProps) {
  const { sx: headerSx, ...restHeaderProps } = header
  const { sx: contentSx, ...restContentProps } = contentProps ?? {}

  return (
    <Card variant="outlined" sx={[CHART_CARD_SX, sx]} {...cardProps}>
      <CardHeader {...restHeaderProps} sx={headerSx} />
      <CardContent {...restContentProps} sx={[CHART_CARD_CONTENT_SX, contentSx]}>
        {children}
      </CardContent>
    </Card>
  )
}
