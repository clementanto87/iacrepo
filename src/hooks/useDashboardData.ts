import { useEffect, useState } from 'react'
import { fetchDashboardSnapshot } from '../data/api'
import type { DashboardSnapshot, Environment } from '../data/types'

export function useDashboardData(environment: Environment) {
  const [data, setData] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchDashboardSnapshot(environment)
      .then((snapshot) => {
        if (active) {
          setData(snapshot)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load dashboard data.')
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
  }, [environment])

  return { data, loading, error }
}
