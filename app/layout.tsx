import type React from 'react'
import type { Metadata } from 'next'
import { Inconsolata, Montserrat } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/layout/navigation'
import { AuthProvider } from '@/components/auth/auth-provider'
import { BodyMuscleProvider } from '@/contexts/body-muscle-context'
import { ThemeInitScript } from '@/components/theme/theme-init-script'

// Define the font with all available weights
const inconsolata = Inconsolata({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
})

// Add Montserrat font for headings
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['500'], // Changed from 700 to 500
})

export const metadata: Metadata = {
  title: 'FIR Fitness App',
  description: 'Your personal fitness companion',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inconsolata.variable} ${montserrat.variable}`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className={inconsolata.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:p-4 focus:block focus:bg-background focus:text-foreground focus:fixed focus:z-50 focus:top-0 focus:left-0 focus:m-4 focus:rounded focus-ring"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <BodyMuscleProvider>
            <div className="min-h-screen bg-background text-foreground">
              <main id="main-content" className="pb-16">
                {children}
              </main>
              <Navigation />
            </div>
          </BodyMuscleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
