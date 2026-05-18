import { generateStaticParamsFor, importPage } from 'nextra/pages'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

type Props = {
  params: Promise<{ mdxPath?: string[] }>
}

export async function generateMetadata({ params }: Props) {
  const { mdxPath } = await params
  const { metadata } = await importPage(mdxPath)
  return metadata
}

export default async function Page({ params }: Props) {
  const { mdxPath } = await params
  const { default: MDXContent } = await importPage(mdxPath)
  return <MDXContent />
}
