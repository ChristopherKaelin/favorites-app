import type { ButtonHTMLAttributes, FunctionComponent, SVGProps } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: FunctionComponent<SVGProps<SVGSVGElement>>
  label: string
}

export function IconButton({ icon: Icon, label, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button${className ? ` ${className}` : ''}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon width={16} height={16} aria-hidden="true" />
    </button>
  )
}
