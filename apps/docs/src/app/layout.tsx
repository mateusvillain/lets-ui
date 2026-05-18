import type { ReactNode } from 'react'
import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import '@lets-ui/tokens/css'
import 'nextra-theme-docs/style.css'
import './globals.css'
import { Logo } from '../components/logo'
import { ThemeSync } from '../components/theme-sync'

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
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <ThemeSync />
        <Layout
          navbar={<Navbar logo={<Logo />} />}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/mateusvillain/lets-ui/tree/main/apps/docs/content"
          editLink="Edit this page on GitHub"
          feedback={{ content: 'Question? Give us feedback →' }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          nextThemes={{ defaultTheme: 'system' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
