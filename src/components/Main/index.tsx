import { type ReactNode, Suspense, type SyntheticEvent, useState, useRef } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Tabs, Tab, Grid } from '@mui/material'
import { styled, ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'
import { Footer } from './Footer'
import { About } from '../About'
import { Audio } from '../Audio'
import { Engineering } from '../Engineering'
import Home from '../Home'

const StyledTabs = styled(
  (props: {
    children?: ReactNode
    value: number
    onChange: (event: SyntheticEvent, newValue: number) => void
    orientation?: 'vertical' | 'horizontal'
  }) => (
    <Tabs
      {...props}
      TabIndicatorProps={{
        children: <span className="MuiTabs-indicatorSpan" />,
      }}
    />
  )
)({
  '& .MuiTabs-flexContainer': {
    alignItems: 'end',
  },
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: 'white',
  },
})

const StyledTab = styled((props: { label: string; value: number }) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(18),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

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
        <Box
          id="border-box"
          ref={borderRef}
          sx={{
            height: '100%',
            width: '100%',
            border: '0.1px solid white',
            overflow: 'auto',
          }}
        >
          <Grid container spacing={2}>
            <Grid id="sidebar" size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <StyledTabs orientation="horizontal" value={value} onChange={handleChange}>
                <StyledTab value={0} label="HOME" />
                <StyledTab value={1} label="ENGINEERING" />
                <StyledTab value={2} label="AUDIO" />
                <StyledTab value={3} label="ABOUT" />
              </StyledTabs>
            </Grid>

            {/* main content */}
            <Grid sx={{ m: 4 }}>
              <Suspense fallback={<div>Loading...</div>}>
                {value === 0 && <Home />}
                {value === 1 && <Engineering />}
                {value === 2 && <Audio />}
                {value === 3 && <About />}
              </Suspense>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
