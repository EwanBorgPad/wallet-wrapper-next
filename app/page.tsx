import type { Metadata } from 'next'
import { Suspense } from 'react'
import SolanaWrappedApp from './components/SolanaWrappedApp'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams
  const address = typeof params.address === 'string' ? params.address : undefined

  // Default OG
  let ogImage = '/logo/open-graph.png'
  
  console.log('🎨 Generating Metadata for address:', address)

  if (address) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000')
      
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

      // Generate OG with address parameter
      const queryParams = new URLSearchParams({
        address: address,
      })

      ogImage = `/api/og?${queryParams.toString()}`
      
    } catch (e) {
      console.error('❌ Error generating dynamic OG:', e)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000')
  
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${cleanBaseUrl}${ogImage}`

  console.log('🖼️ Final OG Image URL:', imageUrl)

  return {
    title: 'Solana Wrapped 2025',
    description: "Your 2025 Solana On-Chain Story",
    openGraph: {
      title: 'Solana Wrapped 2025',
      description: "Your 2025 Solana On-Chain Story",
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solana Wrapped 2025',
      description: "Your 2025 Solana On-Chain Story",
      images: [imageUrl],
    },
  }
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SolanaWrappedApp />
    </Suspense>
  )
}
