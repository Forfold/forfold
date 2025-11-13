import type { PaletteMode } from '@mui/material'
import { createTheme, type PaletteOptions, type ThemeOptions } from '@mui/material/styles'

const brown = '#3D2500'
const accentLight = '#E8C66D'
const accentDarkBg = '#1F2F36'
const accentDarkHover = '#2A3F48'
const toolbarLightBg = '#222D31'
const toolbarLightHover = '#2B3A41'
const midnight = '#050B10'
const deepSlate = '#101820'

const sansStack = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Text"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
]

const serifStack = [
  '"Canela"',
  '"Recoleta"',
  '"Playfair Display"',
  'Georgia',
  '"Times New Roman"',
  'serif',
]

const baseTypography: ThemeOptions['typography'] = {
  fontFamily: sansStack.join(','),
  h1: { fontFamily: serifStack.join(',') },
  h2: { fontFamily: serifStack.join(',') },
  h3: { fontFamily: serifStack.join(',') },
  body1: { fontFamily: sansStack.join(',') },
  body2: { fontFamily: sansStack.join(',') },
  button: { fontFamily: sansStack.join(',') },
}

const buildPalette = (mode: PaletteMode): PaletteOptions => {
  if (mode === 'dark') {
    return {
      mode,
      primary: { main: '#7BD0FF', contrastText: '#03141C' },
      secondary: { main: '#9CD9BF', contrastText: '#05130F' },
      info: { main: '#67B1F4' },
      warning: { main: '#F4A261', contrastText: '#2E1300' },
      background: { default: midnight, paper: deepSlate },
      text: { primary: '#F5FAFF', secondary: 'rgba(229,237,242,0.72)' },
      divider: 'rgba(255,255,255,0.16)',
    }
  }

  return {
    mode,
    primary: { main: '#222D31', contrastText: '#FEFDF7' },
    secondary: { main: '#889F93', contrastText: '#FEFDF7' },
    info: { main: brown },
    warning: { main: '#6F3B3C', contrastText: '#FEFDF7' },
    background: { default: '#FDFBF7', paper: '#E7EDED' },
    text: { primary: '#1F2C31', secondary: 'rgba(31,44,49,0.65)' },
    divider: '#D4DAD8',
  }
}

const buildComponents = (mode: PaletteMode): ThemeOptions['components'] => {
  const isLight = mode === 'light'
  const buttonBg = isLight ? toolbarLightBg : accentDarkBg
  const buttonHoverBg = isLight ? toolbarLightHover : accentDarkHover
  const buttonBorder = accentLight
  const buttonText = accentLight

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isLight ? '#FDFBF7' : midnight,
          color: isLight ? '#1F2C31' : '#F5FAFF',
          transition: 'background-color 200ms ease, color 200ms ease',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        colorPrimary: {
          backgroundImage: 'none',
          backgroundColor: isLight ? '#222D31' : deepSlate,
          color: '#F5FAFF',
          borderBottom: `1px solid ${isLight ? '#1B2428' : 'rgba(255,255,255,0.12)'}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: isLight ? '#F8F9FA' : '#C6D2DD',
          '&.Mui-selected': {
            color: isLight ? accentLight : '#F5FAFF',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 4,
        },
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: buttonBg,
          color: buttonText,
          border: `2px solid ${buttonBorder} !important`,
          transition: 'background-color 150ms ease, border-color 150ms ease',
          '&:hover': {
            backgroundColor: buttonHoverBg,
            borderColor: buttonBorder,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: buttonBg,
          color: buttonText,
          border: `1px solid ${buttonBorder}`,
        },
      },
    },
  }
}

export const createAppTheme = (mode: PaletteMode = 'light') =>
  createTheme({
    palette: buildPalette(mode),
    shape: { borderRadius: 4 },
    typography: baseTypography,
    components: buildComponents(mode),
  })

export const theme = createAppTheme('light')
