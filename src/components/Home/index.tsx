import { Box, Typography } from '@mui/material'
import { ProfilePhoto } from '../ProfilePhoto'

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 4,
        color: 'white',
      }}
    >
      {/* left: avatar + basic info */}
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

      {/* right: main text */}
      <Box sx={{ flex: 1, minWidth: 260, maxWidth: 700 }}>
        <Typography variant="h5" component="h2" sx={{ pb: 2 }}>
          I create and edit complex systems and audio.
        </Typography>

        <Typography variant="body1">
          I&apos;m a senior software engineer focused on observability, reliability, and developer
          experience. I design and ship tools that help teams see what their systems are doing, in
          production, in real time.
          <br />
          <br />I also do audio engineering: drum recording, vocal cleanup, mix work, and general
          “make it sound like a record instead of a demo” energy.
        </Typography>
      </Box>
    </Box>
  )
}
