import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { Outlet } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'
import { theme } from './theme'

function ElevationScroll({ children }: { children: React.ReactElement }) {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    })

    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
    })
}

export default function BottomAppBar() {      
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ElevationScroll>
                <AppBar>
                    <Toolbar>
                        <Link component={RouterLink} to='/' underline='none'>
                            HOME
                        </Link>
                        <Box sx={{ flexGrow: 1 }} />
                        <Link component={RouterLink} to='about' underline='none'>
                            ABOUT
                        </Link>
                    </Toolbar>
                </AppBar>
            </ElevationScroll>
            <Toolbar sx={{ mb: 2 }}/>

            {/* Content Here */}
            <Outlet />
        </ThemeProvider>
    )
}
