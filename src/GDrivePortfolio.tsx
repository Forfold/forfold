import React, { useEffect, useState } from 'react'
import { Grid, Typography } from '@mui/material'
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

export default function GDrivePortfolio() {
  const [images, setImages] = useState<Array<Image>>([])
  const [focusedImage, setFocusedImage] = useState<{
    fileName: string;
    thumbnail: string;
  }>(defaultValue)
  const [pageToken, setPageToken] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    const fetchPortfolio = async () => {
      window.gapi.load('client', async () => {
        await window.gapi.client
          .init({
            apiKey: import.meta.env.VITE_REACT_APP_GOOGLE_API,
          })
          .then(function () {
            return gapi.client.request({
              path: '/drive/v2/files',
              method: 'GET',
              params: {
                q: `'${
                  import.meta.env.VITE_REACT_APP_PORTFOLIO_THUMBNAILS_ID
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
    }

    fetchPortfolio()
  }, [])

  return (
    <React.Fragment>
      <Grid container>
        {error && (
          <Grid item>
            <Typography>{error}</Typography>
          </Grid>
        )}
        {images.map((image) => (
          <Grid key={image.id} item xs={12}>
            <img
              src={`https://drive.google.com/uc?export=view&id=${image.id}`}
              style={{ maxWidth: '500px', width: '130%', height: 'auto' }}
              onClick={() =>
                setFocusedImage({
                  fileName: image.originalFilename,
                  thumbnail: `https://drive.google.com/uc?export=view&id=${image.id}`,
                })
              }
            />
          </Grid>
        ))}
      </Grid>
      <FocusedImage
        open={Boolean(focusedImage.fileName)}
        onClose={() => setFocusedImage(defaultValue)}
        focusedImage={focusedImage}
      />
    </React.Fragment>
  )
}
