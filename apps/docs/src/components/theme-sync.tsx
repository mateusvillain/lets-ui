'use client'

import { useEffect } from 'react'

export function ThemeSync() {
  useEffect(() => {
    const html = document.documentElement

    const sync = () => {
      html.setAttribute('data-theme', html.classList.contains('dark') ? 'dark' : 'light')
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return null
}
