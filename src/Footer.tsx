import React from 'react'
import { Box, Typography } from '@mui/material'

interface FooterProps {
  tabValue: number
}

export default function Footer({ tabValue }: FooterProps) {
  return (
    <Box sx={{ position: 'fixed', bottom: 8, right: '2%' }}>
      <Typography variant='caption' sx={{ textAlign: 'end' }}>
        {tabValue === 0 && (
          <React.Fragment>
              Contact me at {' '}
            <a
              href="mailto:prod.forfold@gmail.com"
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'white' }}
            >
              prod.forfold@gmail.com
            </a>
          </React.Fragment>
        )}
        {tabValue === 1 && (
          <React.Fragment>
            View my full profile at {' '}
            <a
              href="https://soundcloud.com/forfold"
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'white' }}
            >
              soundcloud.com/forfold
            </a> {' // '}Contact me at&nbsp;
            <a
              href="mailto:prod.forfold@gmail.com"
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'white' }}
            >
              prod.forfold@gmail.com
            </a>
          </React.Fragment>
        )}
        {tabValue === 2 && (
          <React.Fragment>
            Click a photo to enlrage // Contact me at {' '}
            <a
              href="mailto:prod.forfold@gmail.com"
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'white' }}
            >
              prod.forfold@gmail.com
            </a>
          </React.Fragment>
        )}
      </Typography>
    </Box>
  )
}