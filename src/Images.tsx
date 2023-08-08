import React, { useEffect, useState } from 'react'
import { Grid, Typography } from '@mui/material'

type Image = {
    id: string
    thumbnailLink: string
    embedLink: string

}

export default function Images() {
    const [images, setImages] = useState<Array<Image>>([])
    const [error, setError] = useState<string>('')

    useEffect(() => {
        window.gapi.load('client', () => {
            window.gapi.client.init({
                'apiKey': import.meta.env.VITE_REACT_APP_GOOGLE_API,
            }).then(function() {
                return gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'GET',
                    'params': {
                        q: `'${import.meta.env.VITE_REACT_APP_ALASKA_FOLDER_ID}' in parents`
                    },
                })
            }).then(function(response) {
                setImages(response.result.items as Array<Image>)
            }, function(reason) {
                setError(reason.result.error.message)
            })
        })
    }, [])
    
    return (
        <Grid container spacing={2} sx={{ pr: 4, pl: 4 }}>
            {error && (
                <Grid item xs={12}>
                    <Typography>
                        {error}
                    </Typography>
                </Grid>
            )}
            {images.map((image) => (
                <Grid key={image.id} item>
                    {/* https://drive.google.com/uc?export=view&id=${image.id} */}
                    <img src={image.thumbnailLink} alt="drive image"/>
                </Grid>
            ))}
        </Grid>
    )
}