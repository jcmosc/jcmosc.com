import clsx from 'clsx'
import { Adamina } from 'next/font/google'
import Link from 'next/link'
import { ComponentProps } from 'react'

const adamina = Adamina({ weight: '400', subsets: ['latin'] })

export function Heading({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1 className={clsx('text-3xl/snug md:text-5xl/snug py-4 text-balance', adamina.className, className)} {...props} />
  )
}

export function Subheading({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={clsx('text-2xl md:text-3xl py-4 text-balance', adamina.className, className)} {...props} />
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={clsx('font-medium underline text-blue-600 hover:text-blue-500', className)} {...props} />
}
