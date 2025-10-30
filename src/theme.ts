import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    background: {
      default: '#6B705C',
      paper: '#FFE8D6',
    },
    divider: '#993a32',
    primary: { light: '#84A98C', main: '#52796F', dark: '#354F52' },
    secondary: { main: '#CAD2C5', dark: '#2F3E46' },
    text: {
      primary: '#6B705C',
      secondary: '#B36D48',
      disabled: '#DBD3D8',
    },
  },
  components: {
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
        raised: false,
        elevation: 0,
      },
    },
  },
})
