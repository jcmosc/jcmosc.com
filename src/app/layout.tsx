import { ScreenIndicator } from '@/components/screen-indicator'
import { Scroll } from '@/components/ui/scroll'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from './footer'
import './globals.css'
import Header from './header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | James Moschou',
    default: 'James Moschou'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`h-screen ${inter.className}`}>
        <Scroll>
          <div className="min-h-screen flex flex-col">
            <Header />
            {children}
            <Footer className="mt-auto" />
          </div>
        </Scroll>
        <ScreenIndicator />
      </body>
    </html>
  )
}
