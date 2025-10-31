import { Suspense, useState, useRef } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Tabs, Tab, Grid, Card, Toolbar, AppBar, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'
import { About } from '../About'
import Home from '../Home'
import { Resume } from '../Resume'

export function Main() {
  const [value, setValue] = useState(0)
  const borderRef = useRef<HTMLDivElement | null>(null)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', // full viewport
          overflow: 'hidden', // stop body from scrolling
        }}
      >
        {/* AppBar at the top */}
        <AppBar>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Logo shows on md+ only */}
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              FORFOLD
            </Typography>

            {/* Tabs wrapper: center on xs/sm, left-align on md+ */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
              }}
            >
              <Tabs
                orientation="horizontal"
                centered
                textColor="secondary"
                indicatorColor="secondary"
                value={value}
                onChange={handleChange}
              >
                <Tab value={0} label="HOME" />
                <Tab value={1} label="RESUME" />
                {/* <Tab value={2} label="AUDIO" /> */}
                <Tab value={3} label="ABOUT" />
              </Tabs>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content area */}
        <Box
          sx={{
            flex: 1, // take remaining vertical space
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // THIS is important: lets children shrink/scroll instead of forcing overflow
            overflow: 'hidden', // prevent this box from causing page scroll
            p: '2%',
          }}
        >
          {/* This Toolbar accounts for AppBar height so content isn't under it */}
          <Toolbar />

          {/* Scrollable card */}
          <Card
            ref={borderRef}
            variant="outlined"
            sx={{
              borderColor: '#FFFFFF',
              borderWidth: '2.5px',
              flex: 1, // fill what's left between toolbar spacer and footer
              minHeight: 0, // allow internal scroll
              width: '100%',
              borderRadius: 8,
              overflow: 'auto', // internal scrolling happens here
            }}
          >
            <Grid container spacing={2}>
              <Grid
                id="sidebar"
                size={{ xs: 12 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              />
              <Grid sx={{ m: 4, width: '100%' }}>
                <Suspense fallback={<div>Loading...</div>}>
                  {value === 0 && <Home />}
                  {value === 1 && <Resume />}
                  {/* {value === 2 && <Audio />} */}
                  {value === 3 && <About />}
                </Suspense>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
