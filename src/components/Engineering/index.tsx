import { Typography } from '@mui/material'
import { ViewLayout } from '../Main/ViewLayout'

export function Engineering() {
  return (
    <ViewLayout withAvatar withFooter>
      <Typography
        variant="h3"
        component="h2"
        sx={{ pb: 2.5, textAlign: 'center', fontWeight: 'bolder' }}
      >
        Nathaniel Cook
      </Typography>

      <Typography sx={{ pb: 1.5 }}>
        I am currently working with Target as a senior software engineer on the metrics and logging
        platform team (Measurement), primarily utilizing React and Typescript.
      </Typography>

      <Typography sx={{ pb: 1.5 }}>
        I also have experience in Go, PSQL, Graphql, CI/CD, Kubernetes, Docker, GCP, and other
        miscellaneous tools.
      </Typography>

      <Typography>
        I love working with React, and I thrive in small team environments working with Agile or
        Kanban methodologies to quickly make decisions and deliver quality code.
      </Typography>
    </ViewLayout>
  )
}
