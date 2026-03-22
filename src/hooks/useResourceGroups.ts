import { useEffect, useState } from 'react'
import { fetchResourceGroups } from '../data/api'

export function useResourceGroups() {
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    fetchResourceGroups()
      .then((data) => {
        if (active) {
          setGroups(data)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { groups, loading }
}
