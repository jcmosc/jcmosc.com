'use client'

import { ColorSchemeToggle } from '@/components/color-scheme'
import { PageTitleHeaderContainer } from '@/components/page-title-visibility'
import { Container } from '@/components/ui/section'
import { ArrowLeftIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import { ComponentProps, RefObject } from 'react'

const links = [
  { href: '/', title: 'Home' },
  { href: '/blog', title: 'Blog' }
]

export default function Header({ className, ...props }: ComponentProps<'header'>) {
  const segments = useSelectedLayoutSegments()
  const isHome = segments && segments.length === 0
  const isPost = segments && segments.length === 2 && segments[0] === 'blog'

  return (
    <header className={clsx('py-2 md:py-4 backdrop-blur-xs bg-white/80 dark:bg-stone-950/80', className)} {...props}>
      <Container className="flex justify-between items-center text-base md:text-lg text-stone-700 dark:text-stone-400">
        {isHome && (
          <PageTitleHeaderContainer>
            <span className="font-semibold">James Moschou</span>
          </PageTitleHeaderContainer>
        )}
        {isPost && (
          <Link
            href="/blog"
            className="group hover:text-stone-950 hover:underline flex items-center gap-1 dark:hover:text-white"
          >
            <ArrowLeftIcon className="size-4 md:size-5 group-hover:-translate-x-1 transition-transform" />
            All posts
          </Link>
        )}
        {!isPost && <div />}
        <div className="flex items-center gap-8">
          <nav>
            <ul className="flex items-center gap-8">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-stone-950 hover:underline dark:hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ColorSchemeToggle />
        </div>
      </Container>
    </header>
  )
}
