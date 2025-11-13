import { Suspense, useCallback, useMemo, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Tabs, Tab, Toolbar, AppBar, Typography, IconButton } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { theme } from '../../theme'
import { Link as RouterLink, Outlet, useLocation, useOutletContext } from 'react-router-dom'

const TAB_CONFIG = [
  { label: 'HOME', path: '/' },
  { label: 'RESUME', path: '/resume' },
  { label: 'PNW OCEAN', path: '/pnw-ocean' },
  { label: 'ABOUT', path: '/about' },
] as const

type TabPath = (typeof TAB_CONFIG)[number]['path']

const normalizePathname = (pathname: string): TabPath => {
  if (!pathname || pathname === '/') {
    return '/'
  }
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const match = TAB_CONFIG.find((tab) => tab.path === trimmed)
  return match ? match.path : '/'
}

export type MainOutletContext = {
  controlsDrawerOpen: boolean
  closeControlsDrawer: () => void
}

export const useMainOutletContext = () => useOutletContext<MainOutletContext>()

export function Main() {
  const location = useLocation()

  const currentTab = useMemo(() => normalizePathname(location.pathname), [location.pathname])
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(false)

  const isPnwRoute = currentTab === '/pnw-ocean'

  const handleOpenControlsDrawer = useCallback(() => {
    if (isPnwRoute) {
      setControlsDrawerOpen(true)
    }
  }, [isPnwRoute])

  const handleCloseControlsDrawer = useCallback(() => {
    setControlsDrawerOpen(false)
  }, [])

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
              component={RouterLink}
              to="/"
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
                value={currentTab}
              >
                {TAB_CONFIG.map((tab) => (
                  <Tab
                    key={tab.path}
                    component={RouterLink}
                    to={tab.path}
                    value={tab.path}
                    label={tab.label}
                  />
                ))}
              </Tabs>
            </Box>

            <IconButton
              color="inherit"
              edge="end"
              aria-label="Open dashboard controls"
              onClick={handleOpenControlsDrawer}
              sx={{ display: { xs: isPnwRoute ? 'inline-flex' : 'none', md: 'none' } }}
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
            <Outlet
              context={{ controlsDrawerOpen, closeControlsDrawer: handleCloseControlsDrawer }}
            />
          </Suspense>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
