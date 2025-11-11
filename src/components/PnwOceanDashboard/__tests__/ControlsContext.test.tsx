import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import {
  DATE_RANGE_WINDOW_DAYS,
  PnwControlsProvider,
  useDashboardControls,
} from '../ControlsContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PnwControlsProvider
    initialProps={{
      defaultStations: ['46029', '46243', '9439040'],
      defaultDatum: 'NAVD88',
      startISO: '2024-01-01T00:00:00Z',
      endISO: '2024-01-05T00:00:00Z',
    }}
  >
    {children}
  </PnwControlsProvider>
)

describe('PnwControlsProvider', () => {
  it('exposes deterministic defaults based on props', () => {
    const { result } = renderHook(() => useDashboardControls(), { wrapper })

    expect(result.current.barPanels).toEqual(['46029', '46243'])
    expect(result.current.estuaryStationId).toBe('9439040')
    expect(result.current.datum).toBe('NAVD88')
    expect(result.current.rangeSlider[0]).toBeLessThanOrEqual(result.current.rangeSlider[1])
    const windowMs = DATE_RANGE_WINDOW_DAYS * 24 * 60 * 60 * 1000
    expect(result.current.range.end.getTime()).toBeLessThanOrEqual(Date.now())
    expect(result.current.range.start.getTime()).toBeGreaterThanOrEqual(
      result.current.range.end.getTime() - windowMs
    )
  })

  it('updates state via exposed helpers', () => {
    const { result } = renderHook(() => useDashboardControls(), { wrapper })

    act(() => {
      result.current.handleBarPanelSelectionChange(['46087'])
    })
    expect(result.current.barPanels).toEqual(['46087'])

    act(() => {
      result.current.handleRemoveBarPanel('46087')
    })
    expect(result.current.barPanels).toEqual([])

    act(() => {
      result.current.setShowSuspect(true)
    })
    expect(result.current.showSuspect).toBe(true)

    act(() => {
      result.current.setRange((prev) => ({
        ...prev,
        end: new Date(prev.end.getTime() - 60 * 60 * 1000),
      }))
    })
    expect(Date.parse(result.current.isoRange.end)).toBeLessThan(Date.now())
  })
})
