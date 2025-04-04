import clsx from 'clsx'
import { ComponentProps } from 'react'

export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={clsx('py-16', className)} {...props} />
}

export function SectionHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={clsx(className)} {...props} />
}

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'md:[--container-margin:--spacing(16)] sm:[--container-margin:--spacing(8)] [--container-margin:0px] ',
        '[--container-padding:--spacing(4)]',
        'lg:[--container-width:calc(var(--breakpoint-lg)-2*var(--container-margin))] [--container-width:calc(100vw-2*var(--container-margin))]',
        'mx-(--container-margin) px-(--container-padding)',
        'lg:max-w-(--container-width)',
        className
      )}
      {...props}
    />
  )
}
