import type { Metadata } from 'next'
import { headers } from 'next/headers'
import SolanaWrappedApp from './components/SolanaWrappedApp'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Helper function to get user by referral code
// TODO: Replace this with your actual database/API call
async function getUserByReferralCode(ref: string): Promise<{ monkeType?: string; referralCode?: string; username?: string } | null> {
  // This is a placeholder - replace with your actual implementation
  // Example: const user = await db.user.findUnique({ where: { referralCode: ref } })
  
  // For now, return null to use default OG image
  // You can uncomment and modify this to return mock data for testing:
  /*
  if (ref === 'TQ8W9I') {
    return {
      monkeType: 'builder',
      referralCode: 'TQ8W9I',
      username: 'Test User'
    }
  }
  */
  
  return null
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  // Try to get ref from searchParams first
  const params = await searchParams
  console.log('🔍 Raw searchParams:', JSON.stringify(params))
  
  let ref = typeof params.ref === 'string' ? params.ref : undefined
  let address = typeof params.address === 'string' ? params.address : undefined
  
  // Fallback: try to get from headers if searchParams doesn't work
  // In Next.js 15, searchParams might not be available in generateMetadata with Suspense
  if (!ref && !address) {
    try {
      const headersList = await headers()
      // Try multiple header sources
      const referer = headersList.get('referer')
      const host = headersList.get('host')
      const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '/'
      
      // Construct URL from headers
      const protocol = headersList.get('x-forwarded-proto') || 'https'
      const fullUrl = referer || (host ? `${protocol}://${host}${pathname}` : '')
      
      if (fullUrl) {
        try {
          const urlObj = new URL(fullUrl)
          const refParam = urlObj.searchParams.get('ref')
          const addressParam = urlObj.searchParams.get('address')
          if (refParam) ref = refParam
          if (addressParam) address = addressParam
          console.log('🔍 Got from headers - ref:', ref, 'address:', address, 'from URL:', fullUrl)
        } catch (urlError) {
          console.error('Error parsing URL from headers:', urlError)
        }
      }
    } catch (e) {
      console.error('Error getting params from headers:', e)
    }
  }

  // Default OG - generate via API if no specific params
  let ogImage = '/api/og'
  
  console.log('🎨 Generating Metadata for ref:', ref, 'address:', address)

  // Check for ref parameter first (for referral codes)
  if (ref) {
    try {
      const user = await getUserByReferralCode(ref)
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000')
      
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      
      if (user && user.monkeType) {
        console.log('🐵 Found User:', user.monkeType, user.username)
        
        // Point to dynamic API route with user data
        const queryParams = new URLSearchParams({
          type: user.monkeType,
          code: user.referralCode || ref,
          username: user.username || 'Anon'
        })
        
        ogImage = `/api/og?${queryParams.toString()}`
      } else {
        // No user found in DB, but we have a ref - generate OG with default values (builder)
        console.log('🐵 No user found for ref:', ref, '- using default builder image')
        
        const queryParams = new URLSearchParams({
          type: 'builder',
          code: ref,
          username: 'Anon'
        })
        
        ogImage = `/api/og?${queryParams.toString()}`
      }
    } catch (e) {
      console.error('❌ Error fetching dynamic OG for ref:', e)
      // On error, still try to generate with default values
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000')
        
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        
        const queryParams = new URLSearchParams({
          type: 'builder',
          code: ref,
          username: 'Anon'
        })
        
        ogImage = `/api/og?${queryParams.toString()}`
      } catch (err) {
        console.error('❌ Error generating fallback OG:', err)
      }
    }
  } 
  // Otherwise, check for address parameter (for wallet addresses)
  else if (address) {
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
  // Suspense is already handled inside SolanaWrappedApp component
  return <SolanaWrappedApp />
}
