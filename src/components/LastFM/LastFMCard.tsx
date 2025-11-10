import { useEffect, useState } from 'react'
import {
  CardHeader,
  CardContent,
  Avatar,
  Box,
  Typography,
  Divider,
  Stack,
  Skeleton,
} from '@mui/material'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'

import type { LastFmRecentTrackResponse, LastFmTrack } from './lastfm.types'
import { timeAgoFromUnix } from './timeAgo'
import { Card } from '../StyledComponents/Card'

const USERNAME = 'Auchindoun'

interface LastFmCardProps {
  limit?: number
}

export function LastFmCard({ limit = 5 }: LastFmCardProps) {
  const [tracks, setTracks] = useState<LastFmTrack[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiKey = import.meta.env.VITE_LASTFM_API_KEY as string | undefined

  useEffect(() => {
    if (!apiKey) return

    const controller = new AbortController()

    async function fetchRecent() {
      try {
        const key = apiKey as string

        const params = new URLSearchParams({
          method: 'user.getRecentTracks',
          user: USERNAME,
          api_key: key,
          limit: String(limit),
          format: 'json',
        })

        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          setError(`Request failed (${res.status})`)
          return
        }

        const json = (await res.json()) as LastFmRecentTrackResponse
        setTracks(json.recenttracks.track)
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'name' in err &&
          (err as { name?: string }).name === 'AbortError'
        ) {
          return
        }

        setError('Failed to load Last.fm data')
      }
    }

    void fetchRecent()
    return () => controller.abort()
  }, [apiKey, limit])

  function getTrackImage(t: LastFmTrack): string | undefined {
    for (let i = t.image.length - 1; i >= 0; i--) {
      if (t.image[i]['#text']) return t.image[i]['#text']
    }
    return undefined
  }

  function renderTrackRow(t: LastFmTrack, idx: number) {
    const nowPlaying = t['@attr']?.nowplaying === 'true'
    const playedAgo = nowPlaying ? 'Now playing' : timeAgoFromUnix(t.date?.uts || undefined)
    const img = getTrackImage(t)

    return (
      <Box
        key={t.url + idx}
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1.5,
          gap: 1.5,
        }}
      >
        <Avatar
          src={img}
          alt={t.album?.['#text'] || t.name}
          variant="rounded"
          sx={(theme) => ({
            width: 48,
            height: 48,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
          })}
        >
          <MusicNoteRoundedIcon fontSize="small" />
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
            title={t.name}
          >
            {t.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
            title={t.artist['#text']}
          >
            {t.artist['#text']}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              lineHeight: 1.3,
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontStyle: nowPlaying ? 'italic' : 'normal',
            }}
            title={playedAgo}
          >
            {playedAgo}
          </Typography>
        </Box>
      </Box>
    )
  }

  const derivedError = !apiKey ? 'Missing Last.fm API key' : error

  function renderBody() {
    if (derivedError) {
      return (
        <Typography variant="body2" color="error.main" sx={{ py: 2 }}>
          {derivedError}
        </Typography>
      )
    }

    if (!tracks) {
      return (
        <Stack spacing={2} sx={{ py: 1 }}>
          {Array.from({ length: limit }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
              <Skeleton
                variant="rounded"
                width={48}
                height={48}
                sx={{ flexShrink: 0, borderRadius: 1 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="30%" />
              </Box>
            </Box>
          ))}
        </Stack>
      )
    }

    if (tracks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No recent plays.
        </Typography>
      )
    }

    return (
      <Box>
        {tracks.map((t, idx) => (
          <Box key={t.url + idx}>
            {idx !== 0 && (
              <Divider
                sx={(theme) => ({
                  borderColor: theme.palette.divider,
                  opacity: 0.4,
                })}
              />
            )}
            {renderTrackRow(t, idx)}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            My Listening Activity
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
            last.fm/{USERNAME}
          </Typography>
        }
        sx={{
          pb: 0,
          '& .MuiCardHeader-avatar': { alignSelf: 'flex-start', mt: 0.5 },
        }}
      />

      <CardContent sx={{ pt: 1.5, pb: 2 }}>{renderBody()}</CardContent>
    </Card>
  )
}
