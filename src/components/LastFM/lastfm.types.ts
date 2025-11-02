export interface LastFmRecentTrackResponse {
  recenttracks: {
    track: LastFmTrack[]
    '@attr': {
      page: string
      total: string
      user: string
      perPage: string
      totalPages: string
    }
  }
}

export interface LastFmTrack {
  artist: { '#text': string; mbid: string }
  name: string
  album: { '#text': string; mbid: string }
  image: Array<{ '#text': string; size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' }>
  url: string
  date?: { uts: string; '#text': string } // not present if "now playing"
  '@attr'?: { nowplaying: 'true' }
}
