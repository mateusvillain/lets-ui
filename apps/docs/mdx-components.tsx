import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { NavGrid } from './src/components/mdx/nav-grid'
import { StatusBadge } from './src/components/ui/status-badge'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getNextraComponents({
    NavGrid,
    StatusBadge,
    ...components,
  })
}
