import { Avatar } from '@mui/material'

const avatarSrc = `${import.meta.env.BASE_URL}assets/avatar.jpg`

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

export function DebugProfilePhoto() {
  return (
    <div style={{ padding: 16, border: '2px solid red', marginTop: 16 }}>
      <div style={{ fontSize: 12, wordBreak: 'break-all', color: 'red' }}>
        IMG SRC (avatarSrc):
        <br />
        <code style={{ fontSize: 11, color: 'red' }}>{avatarSrc}</code>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: '#000' }}>
        Below is the raw &lt;img&gt; using that same src:
      </div>

      <img
        src={avatarSrc}
        alt="debug avatar direct img"
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid red',
          background: '#222',
          color: '#fff',
        }}
        onError={() => {
          console.log('debug <img> failed to load')
        }}
        onLoad={() => {
          console.log('debug <img> loaded OK')
        }}
      />
    </div>
  )
}
