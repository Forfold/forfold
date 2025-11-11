import { jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardControls, type PanelCoverageEntry } from '../components/DashboardControls'
import { PnwControlsProvider } from '../ControlsContext'

const defaultPanelCoverage: PanelCoverageEntry[] = [
  { id: 'bar', label: 'Bar Conditions', status: 'ready', message: 'complete' },
]

function renderControls() {
  const user = userEvent.setup()
  const startHandler = jest.fn()
  const endHandler = jest.fn()

  render(
    <PnwControlsProvider
      initialProps={{
        defaultStations: ['46029', '46243', '9439040'],
        startISO: '2024-01-01T00:00:00Z',
        endISO: '2024-01-05T00:00:00Z',
      }}
    >
      <DashboardControls
        pickerMinDate={new Date('2023-12-01T00:00:00Z')}
        pickerMaxDate={new Date('2024-01-05T00:00:00Z')}
        onDateFieldChange={(key) => (key === 'start' ? startHandler : endHandler)}
        panelCoverage={defaultPanelCoverage}
      />
    </PnwControlsProvider>
  )

  return { user, startHandler, endHandler }
}

describe('DashboardControls UI', () => {
  it('toggles QC visibility and buoy selection', async () => {
    const { user } = renderControls()

    const qcToggle = screen.getByLabelText(/Hide suspect QC flags/i)
    await user.click(qcToggle)
    expect(screen.getByLabelText(/Show suspect QC flags/i)).toBeInTheDocument()

    const buoyCheckbox = screen.getByLabelText(/46029/i)
    expect(buoyCheckbox).toBeChecked()
    await user.click(buoyCheckbox)
    expect(buoyCheckbox).not.toBeChecked()
  })

  it('invokes range change callbacks for date inputs', () => {
    const { startHandler, endHandler } = renderControls()

    const fromInput = screen.getByLabelText('From')
    fireEvent.change(fromInput, { target: { value: '2024-01-02T00:00' } })
    expect(startHandler).toHaveBeenCalledTimes(1)

    const toInput = screen.getByLabelText('To')
    fireEvent.change(toInput, { target: { value: '2024-01-04T06:00' } })
    expect(endHandler).toHaveBeenCalledTimes(1)
  })
})
