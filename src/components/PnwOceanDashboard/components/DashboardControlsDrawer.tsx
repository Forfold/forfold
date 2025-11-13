import { type ChangeEvent } from 'react'
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { DashboardControls } from './DashboardControls'

type DashboardControlsDrawerProps = {
  open: boolean
  onClose: () => void
  pickerMinDate: Date
  pickerMaxDate: Date
  onDateFieldChange: (key: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => void
}

export function DashboardControlsDrawer({
  open,
  onClose,
  pickerMinDate,
  pickerMaxDate,
  onDateFieldChange,
}: DashboardControlsDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <Box
        sx={{
          width: { xs: 300, sm: 360 },
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Dashboard Controls
          </Typography>
          <IconButton aria-label="Close controls" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
          <DashboardControls
            pickerMinDate={pickerMinDate}
            pickerMaxDate={pickerMaxDate}
            onDateFieldChange={onDateFieldChange}
          />
        </Box>
      </Box>
    </Drawer>
  )
}
