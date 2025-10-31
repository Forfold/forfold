import { Typography } from '@mui/material'
import { ViewLayout } from '../Main/ViewLayout'

export default function Home() {
  return (
    <ViewLayout withAvatar withFooter>
      <Typography
        variant="h3"
        component="h1"
        sx={{ pb: 2.5, textAlign: 'center', fontWeight: 'bolder' }}
      >
        Nathaniel Cook
      </Typography>

      <Typography variant="h6" component="h2" sx={{ pb: 2.5 }}>
        I design, build, and maintain complex front-end systems and APIs — and I produce and edit
        audio.
      </Typography>

      <Typography sx={{ pb: 1.5 }}>
        I&apos;m a senior software engineer focused on delivering a great user experience. I design
        and ship tools that help teams see what their systems are doing, in production, in real
        time.
      </Typography>
      <Typography>
        I also have a certificate in Audio Engineering Principals. I focus on drum recordings,
        mixing, vocal narration, and voice acting. Visit my About page to learn more about me, or
        contact me below for more information!
      </Typography>
    </ViewLayout>
  )
}
