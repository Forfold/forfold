import React, { Suspense } from 'react'
import CssBaseline from '@mui/material/CssBaseline' // keep this import first
import { Box, Tabs, Tab, Typography } from '@mui/material'
import { styled, ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
// import GDrivePortfolio from './GDrivePortfolio'
// import GitHubProfile from './GitHubProfile'
import SoundCloudFrames from './SoundCloudFrames'
import Footer from './Footer'
import BassistAd from './BassistAd'

const StyledTabs = styled(
  (props: {
    children?: React.ReactNode;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
  }) => (
    <Tabs
      orientation='vertical'
      {...props}
      TabIndicatorProps={{
        children: <span className="MuiTabs-indicatorSpan" />,
      }}
    />
  ),
)({
  '& .MuiTabs-flexContainer': {
    alignItems: 'end'
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

const StyledTab = styled((props: { label: string, value: number }) => (
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
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100%', position: 'relative', padding: '2%', pb: 4 }}>
        <Box id='border-box' sx={{ height: '100%', position: 'relative', border: '0.1px solid white', overflow: 'auto' }}>
          <Box
            id='sidebar'
            sx={(theme) => ({
              position: 'fixed',
              right: '2%',
              [theme.breakpoints.down('lg')]: {
                position: 'relative'
              }
            })}
          >
            {value != 0 ? (
              <Typography
                variant='h3'
                component='h1'
                // padding makes up for tab width
                sx={{ fontVariant: 'small-caps', width: '100%', textAlign: 'end', pr: 3.5, pt: 1.5 }}
              >
              Nathaniel Cook
              </Typography>
            ) : null}
            <StyledTabs
              value={value}
              onChange={handleChange}
            >
              <StyledTab value={0} label="HOME" />
              <StyledTab value={1} label="MUSIC" />
              {/* <StyledTab value={2} label="PHOTOS" /> */}
            </StyledTabs>
          </Box>
          <Box sx={{ mr: '21%' }}>
            <Box id='content-container' sx={{ height: '100%', m: 2 }}>
              <Suspense fallback={<div>Loading...</div>}>
                {/* {value === 0 && <GitHubProfile />} */}
                {value === 0 && <BassistAd />}
                {value === 1 && <SoundCloudFrames />}
                {/* {value === 2 && <GDrivePortfolio />} */}
              </Suspense>
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
