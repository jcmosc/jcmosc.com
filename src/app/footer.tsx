'use client'

import { ColorSchemeToggle } from '@/components/color-scheme'
import { Container } from '@/components/ui/section'
import { TextLink } from '@/components/ui/type'
import clsx from 'clsx'
import { useTheme } from 'next-themes'
import { ComponentProps } from 'react'

const copyrightYear = new Date().getFullYear()

export default function Footer({ className, ...props }: ComponentProps<'footer'>) {
  const { setTheme } = useTheme()
  return (
    <footer className={clsx('py-16', className)} {...props}>
      <Container className="text-sm flex gap-8 justify-between items-center">
        <div className="space-y-2">
          <p>&copy; James Moschou {copyrightYear}</p>
          <ul className="flex gap-4">
            <li>
              <TextLink href="/">Home</TextLink>
            </li>
            <li>
              <TextLink href="/blog">Blog</TextLink>
            </li>
            <li>
              <TextLink href="https://github.com/jcmosc/jcmosc.com/issues/new">Report an issue</TextLink>
            </li>
          </ul>
        </div>
        <ColorSchemeToggle />
      </Container>
    </footer>
  )
}
