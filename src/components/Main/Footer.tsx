import { Box, Typography } from '@mui/material'

export function Footer() {
  return (
    <Box sx={{ position: 'fixed', bottom: 6, right: '3%', color: 'black' }}>
      <Typography variant="caption" sx={{ textAlign: 'end' }}>
        Contact me at{' '}
        <a
          href="mailto:prod.forfold@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'black' }}
        >
          prod.forfold@gmail.com
        </a>
      </Typography>
    </Box>
  )
}
