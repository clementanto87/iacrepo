import { useEffect, useState } from 'react'
import { fetchImportQueue } from '../data/api'
import type { ImportRow } from '../data/types'

export function useImportQueue() {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchImportQueue()
      .then((data) => {
        if (active) {
          setRows(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load import queue.')
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

  return { rows, loading, error }
}
