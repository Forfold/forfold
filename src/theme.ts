import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',

    // Dark green / charcoal CTA color
    primary: {
      main: '#222D31', // button background / strong action
      contrastText: '#FEFDF7', // light text on dark surfaces
    },

    secondary: {
      main: '#889F93', // same as bg default
    },

    // Warm parchment card tone
    info: {
      main: '#E8DCC5', // beige stats card background
      contrastText: '#1F2C31', // dark text on beige
    },

    // Announcement bar (maroon strip)
    warning: {
      main: '#6F3B3C', // deep maroon banner
      contrastText: '#FEFDF7', // light text on maroon
    },

    background: {
      default: '#889F93', // page / hero / navbar background
      paper: '#E8DCC5', // alt surface card (parchment-style)
    },

    text: {
      primary: '#1F2C31', // main heading + body copy
      secondary: 'rgba(31,44,49,0.65)', // subtext / description
      // inverse: '#FEFDF7', // light-on-dark (CTA text)
    },

    divider: '#FFFFFF',
  },

  // Not strictly required, but this matches the soft, rounded card look
  shape: {
    borderRadius: 4,
  },

  // Optional extras you can reference manually, e.g. theme.palette.custom.sageBg
  // custom: {
  //   sageBg: '#889F93', // left card background
  //   parchmentBg: '#E8DCC5', // middle card background
  //   frameBg: '#E8E8E8', // page gutter / app chrome outside main card
  //   bannerBg: '#6F3B3C', // promo strip
  //   pageBg: '#FEFDF7', // main page surface
  //   headline: '#1F2C31', // hero serif color
  //   ctaBg: '#222D31', // CTA button fill
  //   ctaText: '#FEFDF7', // CTA button label
  // },

  // Typography isn’t color, but wiring colors here is nice
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
      fontWeight: 500,
      color: '#1F2C31',
      lineHeight: 1.1,
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
      fontWeight: 500,
      color: '#1F2C31',
      lineHeight: 1.15,
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
      fontWeight: 500,
      color: '#1F2C31',
      lineHeight: 1.2,
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
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: 'rgba(31,44,49,0.85)',
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
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: 'rgba(31,44,49,0.65)',
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
      textTransform: 'none',
      fontWeight: 500,
      color: '#FEFDF7',
      lineHeight: 1.3,
    },
  },

  components: {
    // Example: make <Button color="primary" /> look like that dark CTA
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#222D31',
          color: '#FEFDF7',
          '&:hover': {
            backgroundColor: '#1F2C31',
          },
        },
      },
    },

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
        outlined: {
          borderColor: '#E8E8E8',
        },
      },
    },
  },
})
