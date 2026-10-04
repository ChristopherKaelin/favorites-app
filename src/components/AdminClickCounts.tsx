import { useEffect, useState } from 'react'
import { fetchPublicClickCounts } from '../lib/adminClickCounts'
import type { PublicClickCount } from '../lib/adminClickCounts'
import { fetchUserFavorites } from '../lib/userFavorites'
import type { UserLink } from '../lib/userFavorites'

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    return err.message
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return fallback
}

export function AdminClickCounts() {
  const [publicCounts, setPublicCounts] = useState<PublicClickCount[]>([])
  const [myLinks, setMyLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchPublicClickCounts(), fetchUserFavorites()])
      .then(([counts, categories]) => {
        if (cancelled) {
          return
        }
        setPublicCounts(counts)
        const links = categories
          .flatMap((c) => c.links)
          .sort(
            (a, b) => b.click_count - a.click_count || a.title.localeCompare(b.title),
          )
        setMyLinks(links)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load click counts'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p>Loading click counts...</p>
  }

  if (error) {
    return <p role="alert">Couldn't load click counts: {error}</p>
  }

  return (
    <div className="admin-click-counts">
      <div className="admin-click-counts-grid">
        <div>
          <h2>Public Links</h2>
          <table>
            <thead>
              <tr>
                <th>Link</th>
                <th className="clicks-col">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {publicCounts.map((row) => (
                <tr key={row.slug}>
                  <td>{row.label}</td>
                  <td className="clicks-col">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>My Links</h2>
          <div className="my-links-grid">
            {myLinks
              .filter((link) => link.click_count > 1)
              .map((link) => (
                <div key={link.id} className="my-links-grid-item">
                  <span className="my-links-grid-title">{link.title}</span>
                  <span className="clicks-col">{link.click_count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
