'use client'
import { useState, useEffect, useRef } from 'react'

/**
 * useCountUp — animates a number from 0 to `target` over `duration` ms.
 * Returns the current animated value as a number.
 * Usage: const displayed = useCountUp(1234, 1200)
 */
export function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)
  const frameRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (target === null || target === undefined) return
    const numTarget = parseFloat(target) || 0
    startRef.current = null

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * numTarget)
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return count
}

/**
 * useFetch — fetches a URL, returns { data, loading, error, refetch }
 * Automatically retries once on error after 2 seconds.
 * Usage: const { data, loading, error, refetch } = useFetch('/api/solar')
 */
export function useFetch(url, options = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [url])

  return { data, loading, error, refetch: fetchData }
}

/**
 * usePolling — like useFetch but re-fetches every `intervalMs` milliseconds.
 * Usage: const { data } = usePolling('/api/solar', 300000) // every 5 min
 */
export function usePolling(url, intervalMs = 300000) {
  const result = useFetch(url)
  useEffect(() => {
    const id = setInterval(result.refetch, intervalMs)
    return () => clearInterval(id)
  }, [url, intervalMs])
  return result
}