import { Box, Typography, Chip, Stack, Divider, Card, CardContent } from '@mui/material'
import { ViewLayout } from '../Main/ViewLayout'

export function About() {
  return (
    <ViewLayout withAvatar withFooter>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Intro / headline */}
        <Box>
          <Typography
            variant="h2"
            sx={(theme) => ({
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: 1.3,
              color: theme.palette.text.primary,
            })}
          >
            Hi, I’m Nate.
          </Typography>

          <Typography
            variant="body2"
            component="h3"
            sx={(theme) => ({
              fontSize: '1rem',
              lineHeight: 1.6,
              color: theme.palette.text.primary,
              mt: 1.5,
            })}
          >
            I build front-end experiences, connect and maintain esoteric systems, and help sound
            feel finished. I’m a senior software engineer, an audio person, and — in my own words —
            a technological entomologist 👾
          </Typography>
        </Box>

        <Divider flexItem />

        {/* What I do (engineering + audio) */}
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h3"
              sx={(theme) => ({
                fontSize: '1.125rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              })}
            >
              Engineering
            </Typography>

            <Typography
              sx={(theme) => ({
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
              })}
            >
              I work in React, TypeScript, and Go, mostly on observability and reliability tooling.
              I like taking noisy data (logs, traces, alerts, weird internal APIs), shaping it into
              something humans can actually read, and giving teams a UI that helps them feel in
              control instead of on fire.
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
              <Chip
                label="React & TypeScript"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip
                label="Scheduling & Alerting"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip
                label="Observability & Tracing"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip label="Go & APIs" size="small" sx={{ fontSize: '0.75rem', fontWeight: 500 }} />
              <Chip
                label="Developer UX"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="h3"
              sx={(theme) => ({
                fontSize: '1.125rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              })}
            >
              Audio
            </Typography>

            <Typography
              sx={(theme) => ({
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
              })}
            >
              I record and mix music and spoken word under the name “Forfold.” I care way too much
              about drum tone, vocal clarity, and trying to make things feel as best they can. I
              work out of a Focusrite 18i20 chain and with various microphones, such as the well
              known SM-58, or it’s fancier cousin, the SM7B.
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
              <Chip label="Mixing" size="small" sx={{ fontSize: '0.75rem', fontWeight: 500 }} />
              <Chip
                label="Drum Production"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip
                label="Vocal Cleanup"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip label="Recording" size="small" sx={{ fontSize: '0.75rem', fontWeight: 500 }} />
            </Stack>
          </Box>
        </Stack>

        <Divider flexItem />

        {/* Personality / vibe */}
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h3"
              sx={(theme) => ({
                fontSize: '1.125rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              })}
            >
              What I’m like
            </Typography>

            <Typography
              sx={(theme) => ({
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
              })}
            >
              I care a lot about details. I refactor components until they’re simple to use and easy
              to trust. I’ll sit with a snare track for an hour to get the parallel compression
              sounding just right. I like taking messy systems and making them feel accessible and
              easy to use. My priorities are stability & clarity.
            </Typography>
          </Box>

          <Box>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip
                label="Pacific Northwest"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip
                label="Tone Obsessed"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip
                label="Nature Lover"
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
              <Chip label="Cooking" size="small" sx={{ fontSize: '0.75rem', fontWeight: 500 }} />
            </Stack>
          </Box>
        </Stack>

        <Divider flexItem />

        {/* Projects / things I'm building */}
        <Stack spacing={2}>
          <Typography
            variant="h3"
            sx={(theme) => ({
              fontSize: '1.125rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
            })}
          >
            Current Projects and Ideas
          </Typography>

          <Card
            variant="outlined"
            sx={(theme) => ({
              borderColor: theme.palette.divider,
              borderRadius: 2,
            })}
          >
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                })}
              >
                eBird dashboard experiment
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                })}
              >
                A map + table view of regional bird activity over time (USA).
                <br />
                The goal is to surface patterns that aren’t obvious on the public site — exploring
                migration patterns by species at their own pace, using crowdsourced sighting data by
                state.
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={(theme) => ({
              borderColor: theme.palette.divider,
              borderRadius: 2,
            })}
          >
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                })}
              >
                MIDYAKI
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                })}
              >
                Nathaniel’s two-piece band with the great CJ Linkous, working together to make their
                debut album, <i>Heron, Over There</i>. More information soon!
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={(theme) => ({
              borderColor: theme.palette.divider,
              borderRadius: 2,
            })}
          >
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                })}
              >
                Observability UI work
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                })}
              >
                Professionally, working on internal tooling for exploring logs and tracing data.
                Recreating the Kibana experience in a unified console for use with other systems
                such as managed containers or incident management. Also working on a system map by
                application using tracing data provided by other core teams at Target.
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Quiet note / human note */}
        {/* <Divider flexItem />
        <Box>
          <Typography
            variant="h3"
            sx={(theme) => ({
              fontSize: '1.125rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
            })}
          >
            Off the record
          </Typography>

          <Typography
            sx={(theme) => ({
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: theme.palette.text.secondary,
            })}
          >
            I write a lot of darker poetry. If you’re into that, check it out here.
          </Typography>
        </Box> */}
      </Box>
    </ViewLayout>
  )
}
