import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#222D31',
      contrastText: '#FEFDF7', // light text on dark surfaces
    },

    secondary: {
      main: '#889F93',
    },

    info: {
      main: '#E8DCC5',
      contrastText: '#1F2C31',
    },

    warning: {
      main: '#6F3B3C',
      contrastText: '#FEFDF7',
    },

    background: {
      default: '#FFFFFF',
      paper: '#E7EDED',
    },

    text: {
      primary: '#557170',
      secondary: 'rgba(31,44,49,0.65)',
    },

    divider: '#222D31',
  },

  shape: {
    borderRadius: 4,
  },

  typography: {
    // Body / nav / buttons / form labels
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Text"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),

    // Hero / section headlines
    h1: {
      fontFamily: [
        // Canela is paid, Recoleta is paid. Playfair Display is a good free sub.
        '"Canela"',
        '"Recoleta"',
        '"Playfair Display"',
        'Georgia',
        'Times New Roman',
        'serif',
      ].join(','),
    },
    h2: {
      fontFamily: [
        '"Canela"',
        '"Recoleta"',
        '"Playfair Display"',
        'Georgia',
        'Times New Roman',
        'serif',
      ].join(','),
    },
    h3: {
      fontFamily: [
        '"Canela"',
        '"Recoleta"',
        '"Playfair Display"',
        'Georgia',
        'Times New Roman',
        'serif',
      ].join(','),
    },

    // Normal paragraph text (“CareSync helps adults over 45…”)
    body1: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },

    // Supporting / caption-ish (“Seamless communication…”, “4/5 star”)
    body2: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },

    button: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Text"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  },

  components: {
    MuiTab: {
      defaultProps: {
        sx: {
          color: 'white',
        },
      },
    },

    // Cards that look like the beige "Calories Goal"
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 4,
        },
      },
    },
  },
})
