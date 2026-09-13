import { useEffect, useState } from 'react'
import { fetchPublicFavorites } from '../lib/publicFavorites'
import type { PublicCategory } from '../lib/publicFavorites'

export function PublicFavorites() {
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchPublicFavorites()
      .then((data) => {
        if (!cancelled) {
          setCategories(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load favorites')
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
    return <p>Loading favorites...</p>
  }

  if (error) {
    return <p role="alert">Couldn't load favorites: {error}</p>
  }

  return (
    <div>
      {categories.map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {category.links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
