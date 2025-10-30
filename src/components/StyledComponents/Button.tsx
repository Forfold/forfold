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
        color: theme.palette.primary.main,
        textTransform: 'none',
        fontSize: '0.8rem',
        px: 2,
        py: 1,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
      })}
    >
      {props.children}
    </MuiButton>
  )
}
