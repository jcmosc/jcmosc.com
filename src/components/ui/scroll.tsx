import clsx from 'clsx'
import { ComponentProps } from 'react'

export function Scroll({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx('h-full overflow-y-auto', className)} {...props} />
}
