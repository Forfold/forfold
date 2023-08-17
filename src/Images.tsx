import React, { useEffect, useState } from 'react'
import { ImageList, ImageListItem, Typography } from '@mui/material'
import FocusedImage from './FocusedImage'

export type Image = {
  id: string;
  thumbnailLink: string;
  embedLink: string;
  originalFilename: string;
};

const defaultValue = {
    fileName: '',
    thumbnail: '',
}

export default function Images() {
    const [images, setImages] = useState<Array<Image>>([])
    const [focusedImage, setFocusedImage] = useState<{
    fileName: string;
    thumbnail: string;
  }>(defaultValue)
    const [pageToken, setPageToken] = useState<string>()
    const [error, setError] = useState<string>()

    useEffect(() => {
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
                                import.meta.env.VITE_REACT_APP_ALASKA_THUMBNAILS_ID
                            }' in parents`,
                            orderBy: 'title',
                            pageToken,
                        },
                    })
                })
                .then(
                    function (response) {
                        const _images = response.result.items as Array<Image>
                        console.log(_images)
                        setImages([...images, ..._images])
                        setPageToken(response.result.nextPageToken)
                    },
                    function (reason) {
                        setError(reason.result.error.message)
                    },
                )
        })
    }, [])

    return (
        <ImageList variant='masonry' cols={2} gap={8}>
            {error && (
                <ImageListItem>
                    <Typography>{error}</Typography>
                </ImageListItem>
            )}
            {images.map((image) => (
                <ImageListItem key={image.id}>
                    <img
                        src={`https://drive.google.com/uc?export=view&id=${image.id}`}
                        style={{ maxHeight: '500px', height: 'auto' }}
                        onClick={() =>
                            setFocusedImage({
                                fileName: image.originalFilename,
                                thumbnail: `https://drive.google.com/uc?export=view&id=${image.id}`,
                            })
                        }
                    />
                </ImageListItem>
            ))}
            <FocusedImage
                open={Boolean(focusedImage.fileName)}
                onClose={() => setFocusedImage(defaultValue)}
                focusedImage={focusedImage}
            />
        </ImageList>
    )
}
