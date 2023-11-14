import React, { Suspense } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CssBaseline from '@mui/material/CssBaseline'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { styled, ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import GDrivePortfolio from './GDrivePortfolio'
import GitHubProfile from './GitHubProfile'
import SoundCloudFrames from './SoundCloudFrames'

function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  })
}

const StyledTabs = styled(
  (props: {
    children?: React.ReactNode;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
  }) => (
    <Tabs
      {...props}
      TabIndicatorProps={{
        children: <span className="MuiTabs-indicatorSpan" />,
      }}
    />
  ),
)({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
})

const StyledTab = styled((props: { label: string }) => (
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

export default function App() {
  const [value, setValue] = React.useState(1)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
    
  function renderAppbar() {
    return (
      <Box sx={{ justifyContent: 'center' }}>
        <Box>
          <Typography variant='h2' component='h1' sx={{ fontVariant: 'small-caps' }}>
                        Nathaniel Cook
          </Typography>
          <Typography variant='h5' component='h2' sx={{ fontVariant: 'small-caps', textAlign: 'center' }}>
            <a href="mailto:prod.forfold@gmail.com" style={{ color: 'white' }}>prod.forfold@gmail.com</a>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StyledTabs
            value={value}
            onChange={handleChange}
          >
            <StyledTab label="MUSIC" />
            <StyledTab label="PHOTOS" />
            <StyledTab label="CODE" />
          </StyledTabs>
        </Box>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ElevationScroll>
        <AppBar sx={{ alignItems: 'center', pt: 1, background: 'rgba(51, 78, 125, 0.8)' }}>
          {renderAppbar()}
        </AppBar>
      </ElevationScroll>
      <Toolbar sx={{ visibility: 'hidden', mt: 1 }}>
        {renderAppbar()}
      </Toolbar>

      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <div />
        <Suspense fallback={<div>Loading...</div>}>
          {value === 0 && <SoundCloudFrames />}
          {value === 1 && <GDrivePortfolio />}
          {value === 2 && <GitHubProfile username='forfold' />}
        </Suspense>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
    </ThemeProvider>
  )
}
