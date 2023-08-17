import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import { Image } from './Images'

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
                                import.meta.env.VITE_REACT_APP_ALASKA_FOLDER_ID
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
        width: '100%',
        height: '100%',
        maxWidth: '90vw',
        maxHeight: '90vh',
        objectFit: 'contain',
    }

    return (
        <Dialog maxWidth="lg" fullWidth open={open} onClose={() => onClose()}>
            {loading ? (
                <img src={thumbnail} style={imageStyle} />
            ) : (
                <img
                    src={`https://drive.google.com/uc?export=view&id=${imageID}`}
                    style={imageStyle}
                />
            )}

            {error && <Typography>{error}</Typography>}

            <img
                src={thumbnail}
                style={{
                    ...imageStyle,
                    zIndex: 0,
                    overflow: 'hidden',
                    objectFit: 'fill',
                    position: 'absolute',
                    filter: 'blur(20px)',
                }}
            />
        </Dialog>
    )
}
