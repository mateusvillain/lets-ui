import { useMDXComponents as getNextraComponents } from 'nextra-theme-docs'
import { NavGrid } from './src/components/mdx/nav-grid'
import { StatusBadge } from './src/components/ui/status-badge'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMDXComponents(components: Record<string, any>) {
  return getNextraComponents({
    NavGrid,
    StatusBadge,
    ...components,
  })
}
