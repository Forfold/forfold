import { type ReactNode } from 'react'
import { Box } from '@mui/material'
import { ProfilePhoto } from '../ProfilePhoto'
import { Footer } from './Footer'
import { Card } from '../StyledComponents/Card'

interface ViewLayoutProps {
  children: ReactNode
  withAvatar?: boolean
  withFooter?: boolean
}

export function ViewLayout(props: ViewLayoutProps) {
  return (
    <Card>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {props.withAvatar && (
          <Box sx={{ pb: 2, pt: 2, width: 'fit-content' }}>
            <ProfilePhoto />
          </Box>
        )}

        <Box sx={{ flex: 1, width: 'fit-content', maxWidth: '750px' }}>
          {props.children}
          {props.withFooter && <Footer />}
        </Box>
      </Box>
    </Card>
  )
}
