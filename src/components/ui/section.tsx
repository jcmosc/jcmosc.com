import clsx from 'clsx'
import { ComponentProps } from 'react'

export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={clsx('py-16', className)} {...props} />
}

export function SectionHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={clsx(className)} {...props} />
}

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx('sm:mx-8 md:mx-16 px-4', className)} {...props} />
}
