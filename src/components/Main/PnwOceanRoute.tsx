import { useEffect } from 'react'
import { PnwOceanDashboard } from '../PnwOceanDashboard'
import { useMainOutletContext } from './index'

export function PnwOceanRoute() {
  const { controlsDrawerOpen, closeControlsDrawer } = useMainOutletContext()

  useEffect(() => closeControlsDrawer, [closeControlsDrawer])

  return (
    <PnwOceanDashboard
      controlsDrawerOpen={controlsDrawerOpen}
      onCloseControlsDrawer={closeControlsDrawer}
    />
  )
}
