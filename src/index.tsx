import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Main } from './components/Main/index'
import { PnwOceanRoute } from './components/Main/PnwOceanRoute'
import Home from './components/Home'
import { Resume } from './components/Resume'
import { About } from './components/About'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './components/Main/ErrorPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Main />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: 'resume', element: <Resume /> },
        { path: 'pnw-ocean', element: <PnwOceanRoute /> },
        { path: 'about', element: <About /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
