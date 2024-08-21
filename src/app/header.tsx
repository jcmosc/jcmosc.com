'use client'

import { Container } from '@/components/ui/section'
import { ArrowLeftIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import { ComponentProps } from 'react'

export default function Header({ className, ...props }: ComponentProps<'header'>) {
  const segments = useSelectedLayoutSegments()
  const isPost = segments && segments.length === 2 && segments[0] === 'blog'
  return (
    <header className={clsx('py-4 md:py-8', className)} {...props}>
      <Container className="flex justify-between items-center text-base md:text-lg text-stone-700">
        {isPost && (
          <Link href="/blog" className="group hover:text-stone-950 hover:underline flex items-center gap-1">
            <ArrowLeftIcon className="size-4 md:size-5 group-hover:-translate-x-1 transition-transform" />
            All posts
          </Link>
        )}
        {!isPost && <div />}
        <nav>
          <ul className="flex gap-8">
            <li>
              <Link href="/" className="hover:text-stone-950 hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-stone-950 hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  )
}
