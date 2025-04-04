import { ColorSchemeProvider } from '@/components/color-scheme'
import { ScreenIndicator } from '@/components/screen-indicator'
import { Scroll } from '@/components/ui/scroll'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from './footer'
import './globals.css'
import Header from './header'
import { PageTitleVisibility } from '@/components/page-title-visibility'

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
    <html lang="en" suppressHydrationWarning>
      <body className={`h-screen dark:bg-stone-950 dark:text-stone-400 ${inter.className}`}>
        <ColorSchemeProvider>
          <PageTitleVisibility>
            <Scroll>
              <div className="min-h-screen flex flex-col relative">
                <Header className="fixed top-0 left-0 right-0 z-10" />
                {children}
                <Footer className="mt-auto" />
              </div>
            </Scroll>
          </PageTitleVisibility>
          <ScreenIndicator />
          <Analytics />
        </ColorSchemeProvider>
      </body>
    </html>
  )
}
