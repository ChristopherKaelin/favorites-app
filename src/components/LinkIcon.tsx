import { useState } from 'react'

interface LinkIconProps {
  url: string
  iconUrl?: string | null
  size?: number
}

function getFaviconUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}

export function LinkIcon({ url, iconUrl, size = 20 }: LinkIconProps) {
  const [failed, setFailed] = useState(false)
  const src = iconUrl || getFaviconUrl(url)

  if (!src || failed) {
    return (
      <span
        className="link-icon-fallback"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        &#8226;
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="link-icon"
      onError={() => setFailed(true)}
    />
  )
}
