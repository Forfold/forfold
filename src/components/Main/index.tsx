import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { AppBar, Box, IconButton, Tab, Tabs, Toolbar, Tooltip, Typography } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { createAppTheme } from '../../theme'
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

const COLOR_MODE_STORAGE_KEY = 'forfold-color-mode'

const getInitialColorMode = (): PaletteMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function Main() {
  const location = useLocation()

  const currentTab = useMemo(() => normalizePathname(location.pathname), [location.pathname])
  const [colorMode, setColorMode] = useState<PaletteMode>(() => getInitialColorMode())
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(false)
  const appTheme = useMemo(() => createAppTheme(colorMode), [colorMode])

  const isPnwRoute = currentTab === '/pnw-ocean'

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode)
  }, [colorMode])

  const handleToggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const handleOpenControlsDrawer = useCallback(() => {
    if (isPnwRoute) {
      setControlsDrawerOpen(true)
    }
  }, [isPnwRoute])

  const handleCloseControlsDrawer = useCallback(() => {
    setControlsDrawerOpen(false)
  }, [])

  const isDarkMode = colorMode === 'dark'
  const colorModeButtonLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <ThemeProvider theme={appTheme}>
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={colorModeButtonLabel} enterDelay={250}>
                <IconButton
                  color="inherit"
                  aria-label={colorModeButtonLabel}
                  aria-pressed={isDarkMode}
                  onClick={handleToggleColorMode}
                >
                  {isDarkMode ? (
                    <LightModeOutlinedIcon fontSize="small" />
                  ) : (
                    <DarkModeOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton
                color="inherit"
                edge="end"
                aria-label="Open dashboard controls"
                onClick={handleOpenControlsDrawer}
                sx={{ display: { xs: isPnwRoute ? 'inline-flex' : 'none', md: 'none' } }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
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
            p: 4,
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
