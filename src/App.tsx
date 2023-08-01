import React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MoreIcon from '@mui/icons-material/MoreVert'
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
})

export default function BottomAppBar() {

      
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AppBar position="fixed" color="primary">
                <Toolbar>
                    <Link to='/'>Home</Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <Link to='about'>About</Link>
                    <IconButton color="inherit">
                        <MoreIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {/* Content Here */}
            <Outlet />
        </ThemeProvider>
    )
}
