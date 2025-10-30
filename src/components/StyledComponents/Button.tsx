import { type ButtonProps } from '@mui/material'

export function Button(props: ButtonProps) {
  return (
    <Button
      {...props}
      variant="outlined"
      sx={{
        borderColor: 'white',
        color: 'white',
        textTransform: 'none',
        fontSize: '0.8rem',
        px: 2,
        py: 1,
        '&:hover': {
          borderColor: 'white',
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
      }}
    >
      {props.children}
    </Button>
  )
}
