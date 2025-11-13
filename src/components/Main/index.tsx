import { Suspense, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Tabs, Tab, Toolbar, AppBar, Typography, IconButton } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { theme } from '../../theme'
import { About } from '../About'
import Home from '../Home'
import { Resume } from '../Resume'
import { PnwOceanDashboard } from '../PnwOceanDashboard'

export function Main() {
  const [value, setValue] = useState(0)
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(false)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)

    if (newValue !== 2 && controlsDrawerOpen) {
      setControlsDrawerOpen(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <AppBar>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* FORFOLD shows on md+ only */}
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
                <Tab value={2} label="PNW OCEAN" />
                <Tab value={3} label="ABOUT" />
              </Tabs>
            </Box>

            <IconButton
              color="inherit"
              edge="end"
              aria-label="Open dashboard controls"
              onClick={() => setControlsDrawerOpen(true)}
              sx={{ display: { xs: value === 2 ? 'inline-flex' : 'none', md: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main content area */}
        <Toolbar />

        <Box
          sx={{
            flex: 1, // take remaining vertical space
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // let children shrink/scroll instead of forcing overflow
            overflow: 'hidden', // prevent this box from causing page scroll
            width: '100%',
            boxSizing: 'border-box',
            p: '2%',
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            {value === 0 && <Home />}
            {value === 1 && <Resume />}
            {value === 2 && (
              <PnwOceanDashboard
                controlsDrawerOpen={controlsDrawerOpen}
                onCloseControlsDrawer={() => setControlsDrawerOpen(false)}
              />
            )}
            {value === 3 && <About />}
          </Suspense>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
