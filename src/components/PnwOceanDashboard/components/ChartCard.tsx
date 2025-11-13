import {
  Card,
  CardContent,
  CardHeader,
  type CardContentProps,
  type CardHeaderProps,
  type CardProps,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import type { ReactNode } from 'react'

type SxItem = boolean | SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>)

const CHART_CARD_SX: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
}

const CHART_CARD_CONTENT_SX: SystemStyleObject<Theme> = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
}

const isSxArray = (value: SxProps<Theme>): value is readonly SxItem[] => Array.isArray(value)

const mergeSx = (base: SystemStyleObject<Theme>, override?: SxProps<Theme>): SxProps<Theme> => {
  if (override === undefined) {
    return base
  }

  if (isSxArray(override)) {
    return [base, ...override] as SxProps<Theme>
  }

  return [base, override] as SxProps<Theme>
}

type ChartCardProps = {
  header: CardHeaderProps
  contentProps?: CardContentProps
  children: ReactNode
} & Omit<CardProps, 'children'>

export function ChartCard({ header, contentProps, children, sx, ...cardProps }: ChartCardProps) {
  const { sx: headerSx, title, disableTypography, ...restHeaderProps } = header
  const { sx: contentSx, ...restContentProps } = contentProps ?? {}
  const cardSx = mergeSx(CHART_CARD_SX, sx)
  const cardContentSx = mergeSx(CHART_CARD_CONTENT_SX, contentSx)
  const shouldDisableTypography =
    disableTypography ??
    (title !== undefined &&
      title !== null &&
      typeof title !== 'string' &&
      typeof title !== 'number')

  return (
    <Card variant="outlined" sx={cardSx} {...cardProps}>
      <CardHeader
        {...restHeaderProps}
        title={title}
        disableTypography={shouldDisableTypography}
        sx={headerSx}
      />
      <CardContent {...restContentProps} sx={cardContentSx}>
        {children}
      </CardContent>
    </Card>
  )
}
