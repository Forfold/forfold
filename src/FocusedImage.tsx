import React, { useEffect, useState } from 'react'
import { Dialog, Typography } from '@mui/material'
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
        <Dialog maxWidth='xl' open={open} onClose={() => onClose()}>
            {
                loading
                    ?
                    <Typography>Loading...</Typography>
                    :
                    <img
                        src={`https://drive.google.com/uc?export=view&id=${imageID}`}
                        style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                    />
            }
            {error && (
                <Typography>
                    {error}
                </Typography>
            )}
        </Dialog>
    )
}