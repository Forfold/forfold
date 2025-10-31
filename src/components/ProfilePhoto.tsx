import { Avatar } from '@mui/material'

const avatarSrc = '/assets/avatar.png'

export function ProfilePhoto() {
  return (
    <Avatar
      src={avatarSrc}
      alt="Profile photo"
      sx={(theme) => ({
        width: 200,
        height: 200,
        border: '2px solid ' + theme.palette.divider,
      })}
    />
  )
}
