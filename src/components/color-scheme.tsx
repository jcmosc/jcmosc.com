'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/16/solid'
import { ThemeProvider, useTheme } from 'next-themes'
import { ComponentPropsWithoutRef, useEffect, useState } from 'react'

export function ColorSchemeToggle({
  ...props
}: Omit<ComponentPropsWithoutRef<'button'>, 'color' | 'aria-label' | 'aria-live' | 'onClick' | 'children'>) {
  let { resolvedTheme, setTheme } = useTheme()
  let otherTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  let [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      aria-label={mounted ? `Switch to ${otherTheme} theme` : 'Toggle theme'}
      aria-live="polite"
      onClick={() => setTheme(otherTheme)}
      {...props}
    >
      <SunIcon className="size-6 sm:size-5 dark:hidden" />
      <MoonIcon className="size-6 sm:size-5 hidden dark:block" />
    </button>
  )
}

function ColorSchemeWatcher() {
  let { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    let media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      let systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) {
        setTheme('system')
      }
    }

    onMediaChange()
    media.addEventListener('change', onMediaChange)

    return () => {
      media.removeEventListener('change', onMediaChange)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      {children}
      <ColorSchemeWatcher />
    </ThemeProvider>
  )
}
