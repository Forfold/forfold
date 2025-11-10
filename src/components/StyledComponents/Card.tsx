import { Card as MuiCard, type CardProps } from '@mui/material'
import { type ReactNode } from 'react'

interface StyledCard extends CardProps {
  title?: string
  children: ReactNode
}

export function Card(props: StyledCard) {
  return (
    <MuiCard
      variant="outlined"
      sx={(theme) => ({
        borderColor: theme.palette.divider,
        borderWidth: '2.5px',
        flex: 1, // fill what's left between toolbar spacer and footer
        minHeight: 0, // allow internal scroll
        width: '100%',
        borderRadius: 8,
        overflow: 'auto', // internal scrolling happens here
      })}
    >
      {props.children}
    </MuiCard>
  )
}
