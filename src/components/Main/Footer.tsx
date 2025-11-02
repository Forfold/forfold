import { Box } from '@mui/material'
import { Button } from '../StyledComponents/Button'

export function Footer() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 3, pb: 3 }}>
      <Button href="sms:+16128393536">Text</Button>
      <Button href="tel:+16128393536">Call</Button>
      <Button href="mailto:prod.forfold@gmail.com" target="_blank" rel="noopener noreferrer">
        Email
      </Button>
      <Button
        href="https://www.linkedin.com/in/nathanieljcook/"
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </Button>
    </Box>
  )
}
