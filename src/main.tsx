import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './Main/'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './Main/ErrorPage'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
