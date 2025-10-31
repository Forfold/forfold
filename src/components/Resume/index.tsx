import {
  Box,
  Typography,
  Stepper,
  Step,
  StepContent,
  Chip,
  Paper,
  Stack,
  useTheme,
} from '@mui/material'
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import GitHubIcon from '@mui/icons-material/GitHub'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { ViewLayout } from '../Main/ViewLayout'

export function Resume() {
  const theme = useTheme()
  const borderColor = theme.palette.secondary.main

  const experience = [
    {
      title: 'Senior Software Engineer – Measurement (Metrics & Logging Platform)',
      company: 'Target',
      location: 'Remote / Portland, OR',
      dates: 'Apr 2020 – Present',
      details: [
        'Build and evolve Target’s internal metrics & logging platform (“Measurement”), surfacing observability for engineering teams through a unified user experience platform across teams at Target called "TAP Console" (Target Application Platform Console).',
        'Rewrite/modernize Kibana-style workflows directly into TAP Console for feature parity, so engineers don’t have to context-switch tools.',
        'Own and ship module-federated / micro frontend experiences that stitch multiple systems into one coherent UI.',
        'Integrated GoAlert (Target’s open source on-call scheduling + escalation and alert notification tool) into TAP Console, so teams can see who’s on call and page them in context.',
        'Previous experience mentoring interns and Technology Leadership Program engineers through pairing, status updates, and product architecture walk-throughs.',
      ],
      tech: [
        'React',
        'TypeScript',
        'Material UI',
        'Apollo',
        'GraphQL (Go)',
        'Cypress',
        'Playwright',
        'Go',
        'PostgreSQL',
        'Terraform',
        'Kubernetes',
        'Docker',
        'GCP',
        'Azure',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Target',
      location: 'Minneapolis, MN',
      dates: 'Jun 2017 – Apr 2020',
      details: [
        'Contributed to GoAlert, Target’s open source on-call scheduling / escalation / alerting platform.',
        'Improved operational visibility and incident response for internal teams.',
        'Paired with interns and new engineers to level up their React / GraphQL / on-call tooling experience.',
      ],
      tech: ['React', 'Material UI', 'Redux', 'Relay', 'GraphQL', 'Cypress', 'Go', 'PostgreSQL'],
    },
    {
      title: 'Software Engineer, Technology Leadership Program (TLP)',
      company: 'Target',
      location: 'Minneapolis, MN',
      dates: 'Jun 2016 – Jun 2017',
      details: [
        'Completed Target’s Technology Leadership Program: two 6-month rotations across Enterprise Inventory and an internal web app team (later GoAlert).',
        'Enterprise Inventory: ran load/perf testing with JMeter on Kafka-producing/consuming services to prep APIs for peak season.',
        'GoAlert: built the core views and CRUD operations using React + Redux + Relay + GraphQL.',
      ],
      tech: [
        'React',
        'Redux',
        'Relay',
        'GraphQL',
        'JMeter',
        'Kafka',
        'QA / Selenium w/ JUnit',
        'Agile / Scrum',
      ],
    },
    {
      title: 'Software Engineering Intern',
      company: 'Target',
      location: 'Minneapolis, MN',
      dates: 'Jun 2015 – Aug 2015',
      details: [
        'Worked on a scrum team in inventory & merchandising to enhance internal inventory tracking apps.',
        'Learned Agile/Scrum workflows, Javascript fundamentals, and building test coverage with Selenium and JUnit.',
      ],
      tech: ['Javascript', 'Selenium', 'JUnit', 'Agile/Scrum'],
    },
    {
      title: 'Floor Staff',
      company: 'Regal Entertainment Group',
      location: 'Estero, FL',
      dates: 'Sep 2014 – May 2015',
      details: [
        'Customer-facing service, cash handling, concessions, and inventory stocking in a fast, high-traffic environment.',
      ],
      tech: ['Communication', 'Organization'],
    },
    {
      title: 'Server / Trainer',
      company: 'Breakaway Sports Pub',
      location: 'Fort Myers, FL',
      dates: 'Dec 2011 – Sep 2014',
      details: [
        'Served guests, handled cash, trained new hires, and helped maintain smooth front-of-house operations in a fast paced environment.',
      ],
      tech: ['Communication', 'Organization'],
    },
  ]

  const coreSkills = [
    'React',
    'TypeScript',
    'JavaScript',
    'Material UI',
    'GraphQL',
    'Apollo',
    'Go',
    'PostgreSQL',
    'Kubernetes',
    'Docker',
    'Terraform',
    'CI/CD',
    'OpenTelemetry / Observability',
    'Cypress / Playwright',
    'GCP / Azure',
  ]

  const education = [
    {
      school: 'Florida Gulf Coast University',
      degree: 'B.S. — Software Engineering',
      dates: '2012 – 2016',
    },
    {
      school: 'Edison State College',
      degree: 'General Studies',
      dates: '2011 – 2012',
    },
  ]

  return (
    <ViewLayout withAvatar>
      {/* HEADER / SUMMARY */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          p: { xs: 2, sm: 3 },
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            pb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem' },
          }}
        >
          Nathaniel Cook
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          spacing={1.5}
          sx={{ color: theme.palette.text.secondary, pb: 2, textAlign: 'center' }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnRoundedIcon fontSize="small" />
            <Typography variant="body2">Portland, OR</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PhoneRoundedIcon fontSize="small" />
            <Typography variant="body2">(612) 839-3536</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <EmailRoundedIcon fontSize="small" />
            <Typography variant="body2">prod.forfold@gmail.com</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <GitHubIcon fontSize="small" />
            <Typography variant="body2">github.com/Auchindoun</Typography>
          </Stack>
        </Stack>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
          }}
        >
          Senior Software Engineer on Target’s Measurement team, focused on developing and
          maintaining the user experience for the metrics and logging platforms.
          <div style={{ marginBottom: '8px' }} />I love working with React, and I thrive in small
          team environments working with Agile or Kanban methodologies to quickly make decisions and
          deliver quality code.
        </Typography>
      </Paper>

      {/* EXPERIENCE SECTION */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <WorkOutlineRoundedIcon fontSize="small" />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
            }}
          >
            Experience
          </Typography>
        </Stack>

        <Stepper
          orientation="vertical"
          nonLinear
          sx={{
            // hide default connector stub
            '& .MuiStepConnector-line': {
              display: 'none',
            },

            '& .MuiStep-root': {
              paddingBottom: theme.spacing(3),
            },

            '& .MuiStepLabel-root': {
              alignItems: 'flex-start',
            },

            // step circle styling
            '& .MuiStepIcon-root': {
              color: borderColor + ' !important',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '50%',
              border: `1px solid ${borderColor}`,
            },
            '& .MuiStepIcon-text': {
              fill: theme.palette.text.secondary,
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          }}
        >
          {experience.map((job, idx) => (
            <Step
              key={idx}
              active
              expanded
              sx={{
                pb: 3,
                '& .MuiStepLabel-label': {
                  width: '100%',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', pl: 0.5, pb: 0.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    lineHeight: 1.4,
                  }}
                >
                  {job.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4,
                  }}
                >
                  {job.company} · {job.location}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {job.dates}
                </Typography>
              </Box>

              <StepContent
                sx={{
                  ml: 1.25,
                  pl: 2,
                  mt: 1,
                  borderLeft: `3px dashed ${borderColor}`,
                }}
              >
                {/* bullets */}
                <Box sx={{ mb: 0.25, mt: 0.25 }}>
                  {job.details.map((line, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        lineHeight: 1.5,
                        pb: 1,
                      }}
                    >
                      • {line}
                    </Typography>
                  ))}
                </Box>

                {/* tech chips */}
                {job.tech.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
                    {job.tech.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* SKILLS SECTION */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <WorkOutlineRoundedIcon fontSize="small" />
          Skills & Tooling
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            border: `1px solid ${borderColor}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {coreSkills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* EDUCATION SECTION */}
      <Box sx={{ mb: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <SchoolRoundedIcon fontSize="small" />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
            }}
          >
            Education
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {education.map((ed, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                {ed.school}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                }}
              >
                {ed.degree}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {ed.dates}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </ViewLayout>
  )
}
