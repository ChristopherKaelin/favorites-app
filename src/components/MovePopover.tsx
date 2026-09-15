import { useEffect, useRef, useState } from 'react'
import MoveIcon from '../assets/icons/move.svg?react'
import { IconButton } from './IconButton'

interface MovePopoverOption {
  id: string
  name: string
}

interface MovePopoverProps {
  options: MovePopoverOption[]
  onSelect: (id: string) => void
  disabled?: boolean
}

export function MovePopover({ options, onSelect, disabled }: MovePopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (options.length === 0) {
    return null
  }

  return (
    <div className="move-popover" ref={containerRef}>
      <IconButton
        icon={MoveIcon}
        label="Move to category"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
      />
      {open && (
        <ul className="move-popover-menu" role="menu">
          {options.map((option) => (
            <li key={option.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(option.id)
                  setOpen(false)
                }}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
