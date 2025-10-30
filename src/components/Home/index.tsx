import { Box, SxProps, Typography } from '@mui/material'
import { ProfilePhoto } from '../ProfilePhoto'
import React from 'react'

export default function Home() {
  return (
    <React.Fragment>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 4,
        }}
      >
        <Box
          sx={{
            minWidth: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <ProfilePhoto />
        </Box>

        <HomeText />
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
          <ProfilePhoto />
        </Box>
        <HomeText styleProps={{ textAlign: 'center' }} />
      </Box>
    </React.Fragment>
  )
}

function HomeText({ styleProps }: { styleProps?: SxProps }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h4" component="h2" sx={{ pb: 2, ...styleProps }}>
        Nathaniel Cook
      </Typography>
      <Typography variant="h6" component="h3" sx={{ pb: 2 }}>
        I design, build, and maintain complex front-end systems and APIs — and I produce and edit
        audio.
      </Typography>

      <Typography sx={{ pb: 1 }}>
        I&apos;m a senior software engineer focused on delivering a great user experience. I design
        and ship tools that help teams see what their systems are doing, in production, in real
        time.
      </Typography>
      <Typography>
        I also have a certificate in Audio Engineering Principals. I focus on drum recordings,
        mixing, vocal narration, and voice acting. Contact me for more information!
      </Typography>
    </Box>
  )
}
