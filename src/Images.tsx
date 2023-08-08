import React, { useEffect, useState } from 'react'
import { Grid, Typography } from '@mui/material'
import FocusedImage from './FocusedImage'

export type Image = {
    id: string
    thumbnailLink: string
    embedLink: string
    originalFilename: string
}

export default function Images() {
    const [images, setImages] = useState<Array<Image>>([])
    const [focusedImage, setFocusedImage] = useState<string>('')
    const [pageToken, setPageToken] = useState<string>()
    const [error, setError] = useState<string>()

    useEffect(() => {
        window.gapi.load('client', () => {
            window.gapi.client.init({
                'apiKey': import.meta.env.VITE_REACT_APP_GOOGLE_API,
            }).then(function() {
                return gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'GET',
                    'params': {
                        q: `'${import.meta.env.VITE_REACT_APP_ALASKA_THUMBNAILS_ID}' in parents`,
                        orderBy: 'title',
                        pageToken
                    },
                })
            }).then(function(response) {
                const _images = (response.result.items as Array<Image>)
                console.log(_images)
                setImages([...images, ..._images])
                setPageToken(response.result.nextPageToken)
            }, function(reason) {
                setError(reason.result.error.message)
            })
        })
    }, [])

    return (
        <Grid container spacing={2} display='flex' justifyContent='center' alignItems='center'>
            {error && (
                <Grid item xs={12}>
                    <Typography>
                        {error}
                    </Typography>
                </Grid>
            )}
            {images.map((image) => (
                <Grid key={image.id} item>
                    <img
                        src={`https://drive.google.com/uc?export=view&id=${image.id}`}
                        style={{ maxHeight: '500px', height: 'auto' }}
                        onClick={() => setFocusedImage(image.originalFilename)}
                    />
                </Grid>
            ))}
            <FocusedImage open={Boolean(focusedImage)} onClose={() => setFocusedImage('')} focusedImage={focusedImage} />
        </Grid>
    )
}