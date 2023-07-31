import React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import MoreIcon from '@mui/icons-material/MoreVert'
import { Outlet } from 'react-router'

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
})

export default function BottomAppBar() {

      
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {/* Content Here */}
            <Outlet />
            <AppBar position="fixed" color="primary">
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer">
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton color="inherit">
                        <SearchIcon />
                    </IconButton>
                    <IconButton color="inherit">
                        <MoreIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    )
}
