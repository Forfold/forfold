import { Box, Link, Typography } from '@mui/material'
import { ProfilePhoto } from '../ProfilePhoto'

export function Engineering() {
  return (
    <Box
      sx={{
        display: 'flex',
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

      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" component="h2" sx={{ pb: 2 }}>
          Nathaniel Cook
        </Typography>

        <Typography>
          I am currently working with Target as a senior software engineer on the metrics and
          logging platform team (Measurement), primarily utilizing React and Typescript.
        </Typography>

        <br />

        <Typography>
          I also have experience in Go, PSQL, Graphql, CI/CD, Kubernetes, Docker, GCP, and other
          miscellaneous tools.
        </Typography>

        <br />

        <Typography>
          I love working with React, and I thrive in small team environments working with Agile or
          Kanban methodologies to quickly make decisions and deliver quality code.
        </Typography>

        <br />

        <Link href="https://www.linkedin.com/in/nathanieljcook/" target="_blank">
          My LinkedIn ↗️
        </Link>
      </Box>
    </Box>
  )
}
