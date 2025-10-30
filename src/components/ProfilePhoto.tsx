import avatarSrc from '../assets/avatar.jpg'
import { Avatar } from '@mui/material'

export function ProfilePhoto() {
  return (
    <Avatar
      src={avatarSrc}
      alt="Profile photo"
      sx={{
        width: 200,
        height: 200,
        border: '1px solid white',
      }}
    />
  )
}
