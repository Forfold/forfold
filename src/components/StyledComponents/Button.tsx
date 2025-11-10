import { Button as MuiButton, type ButtonProps } from '@mui/material'

interface StyledButtonProps extends ButtonProps {
  target?: string
}

export function Button(props: StyledButtonProps) {
  return (
    <MuiButton
      {...props}
      variant="outlined"
      sx={(theme) => ({
        borderColor: theme.palette.primary.main,
        textTransform: 'uppercase',
        color: '#3D2500',
        backgroundColor: '#E2D6B8',
        fontWeight: 800,
        fontSize: '0.8rem',
        px: 2,
        py: 1,
        '&:hover': {
          borderColor: '#3D2500',
          backgroundColor: '#C9BD9D',
        },
      })}
    >
      {props.children}
    </MuiButton>
  )
}
