import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import { Image } from './GDrivePortfolio'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import CloseIcon from '@mui/icons-material/Close'

interface FocusedImageProps {
  open: boolean;
  onClose: () => void;
  focusedImage: {
    fileName: string;
    thumbnail: string;
  };
}

export default function FocusedImage(props: FocusedImageProps) {
    const { open, focusedImage, onClose } = props
    const { fileName, thumbnail } = focusedImage
    const [imageID, setImageID] = useState<Image>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    function fetchFocusedImage() {
        setLoading(true)
        window.gapi.load('client', () => {
            window.gapi.client
                .init({
                    apiKey: import.meta.env.VITE_REACT_APP_GOOGLE_API,
                })
                .then(function () {
                    return gapi.client.request({
                        path: '/drive/v2/files',
                        method: 'GET',
                        params: {
                            q: `'${
                                import.meta.env.VITE_REACT_APP_PORTFOLIO_ID
                            }' in parents and title = '${fileName}'`,
                            orderBy: 'title',
                        },
                    })
                })
                .then(
                    function (response) {
                        setImageID(response.result.items[0].id)
                        setLoading(false)
                    },
                    function (reason) {
                        setError(reason.result.error.message)
                        setLoading(false)
                    },
                )
        })
    }

    useEffect(() => {
        if (fileName) {
            fetchFocusedImage()
        }
    }, [fileName])

    const imageStyle: React.CSSProperties = {
        zIndex: 1,
        width: '90%',
        height: '100%',
        maxWidth: 'auto',
        maxHeight: '100vh',
        objectFit: 'contain',
    }

    return (
        <Dialog fullScreen open={open} onClose={() => onClose()}>
            <div style={{ backgroundColor: 'black', height: '100%' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => onClose()}
                        aria-label="close"
                        sx={{ p: 1.5 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
                <DialogContent sx={{ pt: 0, pb: 0, display: 'flex', justifyContent: 'center' }}>
                    {loading ? (
                        <img src={thumbnail} style={imageStyle} />
                    ) : (
                        <img
                            src={`https://drive.google.com/uc?export=view&id=${imageID}`}
                            style={imageStyle}
                        />
                    )}

                    {error && <Typography>{error}</Typography>}
                </DialogContent>
            </div>
        </Dialog>
    )
}
