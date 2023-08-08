import React, { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { Image } from './Images'

interface FocusedImageProps {
    open: boolean;
    focusedImage: string;
    onClose: () => void;
}

export default function FocusedImage(props: FocusedImageProps) {
    const { open, focusedImage, onClose } = props
    const [imageID, setImageID] = useState<Image>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    function fetchFocusedImage() {
        console.log('fetching focused image: ', focusedImage)
        setLoading(true)
        window.gapi.load('client', () => {
            window.gapi.client.init({
                'apiKey': import.meta.env.VITE_REACT_APP_GOOGLE_API,
            }).then(function() {
                return gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'GET',
                    'params': {
                        q: `'${import.meta.env.VITE_REACT_APP_ALASKA_FOLDER_ID}' in parents and title = '${focusedImage}'`,
                        orderBy: 'title',
                    },
                })
            }).then(function(response) {
                setImageID(response.result.items[0].id)
                setLoading(false)
            }, function(reason) {
                setError(reason.result.error.message)
                setLoading(false)
            })
        })
    }

    useEffect(() => {
        if (focusedImage) {
            fetchFocusedImage()
        }
    }, [focusedImage])

    return (
        <Dialog fullScreen open={open} onClose={() => onClose()}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => onClose()}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {focusedImage}
                    </Typography>
                </Toolbar>
            </AppBar>
            <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                {
                    loading
                        ?
                        <Typography>Loading...</Typography>
                        :
                        <img
                            src={`https://drive.google.com/uc?export=view&id=${imageID}`}
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                }
            </DialogContent>
            {error && (
                <Typography>
                    {error}
                </Typography>
            )}
        </Dialog>
    )
}