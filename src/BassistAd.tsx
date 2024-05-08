import React from 'react'
import { Grid, Link, Typography } from '@mui/material'


export default function BassistAd() {

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography>
          Hello!
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          We are looking for a kind and fun person to join our existing, but newer 3-piece band.
          We all kind of like alternative genres of music and have been more recently writing emo/grunge stuff.
          That said, we kind of have our own sound going for us and love to incorporate other styles as well.
          We like most stuff!
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Our goals are to get a 4-5 song demo EP recorded by ourselves and book a show by the end of the summer.
          Not too hard of a goal, but also focused.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          We have 2 demos: &ldquo;Folly&ldquo; and &ldquo;Lungs&ldquo;, and are working on writing the next one.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          We range in age from 29-38.
          We are all in the Camas/Washougal area and practice in Camas.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          You can view our demo track for a rough idea of our sound here (or click on Music in the sidebar and give Lungs a listen):
        </Typography>
        <Link>
          https://m.soundcloud.com/forfold/lungs
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          The influenced music list between the three of us is huge, but here are some of them:
        </Typography>
        <Typography sx={{ pl: 2 }}>
          – Valleyheart<br />
          – Teenagewrist<br />
          – Citizen<br />
          – Foxing<br />
          – Gleemer<br />
          – Microwave<br />
        </Typography>
      </Grid>
    </Grid>
  )
}