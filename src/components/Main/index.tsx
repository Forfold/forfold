import { Suspense, useState, useRef } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Tabs, Tab, Grid, Card } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'
import { Footer } from './Footer'
import { About } from '../About'
import { Audio } from '../Audio'
import { Engineering } from '../Engineering'
import Home from '../Home'

export function App() {
  const [value, setValue] = useState(0)
  const borderRef = useRef<HTMLDivElement | null>(null)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ height: '100%', padding: '2%', pb: 4 }}>
        <Card
          // variant="outlined"
          ref={borderRef}
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            borderRadius: 8,
          }}
        >
          <Grid container spacing={2}>
            <Grid id="sidebar" size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tabs orientation="horizontal" value={value} onChange={handleChange}>
                <Tab value={0} label="HOME" />
                <Tab value={1} label="ENGINEERING" />
                <Tab value={2} label="AUDIO" />
                <Tab value={3} label="ABOUT" />
              </Tabs>
            </Grid>

            {/* main content */}
            <Grid sx={{ m: 4, width: '100%' }}>
              <Suspense fallback={<div>Loading...</div>}>
                {value === 0 && <Home />}
                {value === 1 && <Engineering />}
                {value === 2 && <Audio />}
                {value === 3 && <About />}
              </Suspense>
            </Grid>
          </Grid>
        </Card>

        <Box>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
