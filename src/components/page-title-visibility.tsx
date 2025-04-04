'use client'

import { invariant } from '@/util/invariant'
import clsx from 'clsx'
import { useInView } from 'motion/react'
import { ComponentProps, ReactNode, RefObject, createContext, useContext, useRef } from 'react'

const PageTitleVisibilityContext = createContext<{ pageTitleRef: RefObject<HTMLDivElement> | null }>({
  pageTitleRef: null
})

export function PageTitleVisibility({ children }: { children?: ReactNode }) {
  const pageTitleRef = useRef<HTMLDivElement>(null)
  return <PageTitleVisibilityContext.Provider value={{ pageTitleRef }}>{children}</PageTitleVisibilityContext.Provider>
}

export function PageTitlePageContainer({ className, ...props }: ComponentProps<'div'>) {
  const { pageTitleRef } = useContext(PageTitleVisibilityContext)
  return <div ref={pageTitleRef} className={className} {...props} />
}

export function PageTitleHeaderContainer({ children }: { children?: ReactNode }) {
  const { pageTitleRef } = useContext(PageTitleVisibilityContext)
  invariant(pageTitleRef, 'pageTitleRef is null')
  const pageTitleInView = useInView(pageTitleRef)
  return (
    <div
      className={clsx('transition-all', pageTitleInView ? 'opacity-0 -translate-y-1/2' : 'opacity-100 translate-y-0 ')}
    >
      {children}
    </div>
  )
}
