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
        fontWeight: 800,
        fontSize: '0.8rem',
        px: 2,
        py: 1,
      })}
    >
      {props.children}
    </MuiButton>
  )
}
