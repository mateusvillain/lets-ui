import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getNextraComponents(components)
}
