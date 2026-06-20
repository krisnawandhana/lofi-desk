import { useRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDialogFocus } from './use-dialog-focus'

function Dialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLElement>(null)
  useDialogFocus(ref, onClose)
  return (
    <section ref={ref} tabIndex={-1} role="dialog">
      <button type="button">First</button>
      <button type="button">Last</button>
    </section>
  )
}

function Harness() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => setOpen(true)}>Open</button>
    {open && <Dialog onClose={() => setOpen(false)} />}
  </>
}

describe('useDialogFocus', () => {
  it('focuses the dialog, traps Tab, closes with Escape, and restores focus', () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    trigger.focus()
    fireEvent.click(trigger)

    const first = screen.getByRole('button', { name: 'First' })
    const last = screen.getByRole('button', { name: 'Last' })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
