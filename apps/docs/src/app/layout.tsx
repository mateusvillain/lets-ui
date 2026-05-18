import type { ReactNode } from 'react'
import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Inter } from 'next/font/google'
import 'nextra-theme-docs/style.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: {
    template: "%s — Let's UI",
    default: "Let's UI — Design System",
  },
  description: 'Open-source, framework-agnostic design system.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<span style={{ fontWeight: 700 }}>Let&apos;s UI</span>}
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/mateusvillain/lets-ui/tree/main/apps/docs/content"
          editLink="Edit this page on GitHub"
          feedback={{ content: 'Question? Give us feedback →' }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
