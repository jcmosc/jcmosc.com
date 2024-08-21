import { Container } from '@/components/ui/section'
import { TextLink } from '@/components/ui/type'
import clsx from 'clsx'
import { ComponentProps } from 'react'

const copyrightYear = new Date().getFullYear()

export default function Footer({ className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer className={clsx('py-16', className)} {...props}>
      <Container className="text-sm flex gap-8 justify-between items-end">
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
      </Container>
    </footer>
  )
}
