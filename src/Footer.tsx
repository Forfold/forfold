import React from 'react'
import { Box, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box sx={{ position: 'fixed', bottom: 8, right: '2%' }}>
      <Typography variant='caption' sx={{ textAlign: 'end' }}>
        Contact me at {' '}
        <a
          href="mailto:prod.forfold@gmail.com"
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: 'white' }}
        >
              prod.forfold@gmail.com
        </a>
      </Typography>
    </Box>
  )
}