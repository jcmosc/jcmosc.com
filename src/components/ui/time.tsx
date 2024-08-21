import { ComponentProps } from 'react'

const defaultFormat = Intl.DateTimeFormat(undefined, { dateStyle: 'long' })

export function Time({
  date,
  format,
  ...props
}: { date: Date; format?: Intl.DateTimeFormat } & Omit<ComponentProps<'time'>, 'datetime' | 'children'>) {
  const value = date.toISOString().slice(0, 'YYYY-MM-DD'.length)
  return (
    <time dateTime={value} {...props}>
      {(format ?? defaultFormat).format(date)}
    </time>
  )
}
