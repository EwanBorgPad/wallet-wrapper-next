import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

function generateDefaultOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
          fontFamily: 'system-ui, -apple-system',
        }}
      >
        {/* Background gradient circles */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: '900',
              background: 'linear-gradient(to right, #06B6D4, #8B5CF6, #10B981)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 20px 0',
              letterSpacing: '-0.02em',
            }}
          >
            SOLANA WRAPPED
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#9CA3AF',
              margin: 0,
              fontWeight: '300',
            }}
          >
            2025 EDITION
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  )
}

async function generateRefOGImage(code: string, pseudo: string, type: string) {
  // Determine which image to use based on type
  const imagePath = type === 'degen' 
    ? '/previews/degen.png' 
    : '/previews/builder.png'
  
  // Load the background image - use absolute URL for @vercel/og
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000')
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const imageUrl = `${cleanBaseUrl}${imagePath}`
  
  // Fetch the image and convert to base64 for @vercel/og (Edge runtime compatible)
  let imageDataUrl: string | null = null
  try {
    const imageResponse = await fetch(imageUrl)
    if (imageResponse.ok) {
      const imageBuffer = await imageResponse.arrayBuffer()
      // Convert ArrayBuffer to base64 without Buffer (Edge compatible)
      const bytes = new Uint8Array(imageBuffer)
      const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
      const base64 = btoa(binary)
      const mimeType = imageResponse.headers.get('content-type') || 'image/png'
      imageDataUrl = `data:${mimeType};base64,${base64}`
    }
  } catch (error) {
    console.error('Error loading background image:', error)
  }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            position: 'relative',
          }}
        >
        {/* Background image */}
        {imageDataUrl && (
          <img
            src={imageDataUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        
        {/* Overlay gradient for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: '900',
              background: 'linear-gradient(to right, #06B6D4, #8B5CF6, #10B981)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 20px 0',
              letterSpacing: '-0.02em',
            }}
          >
            SOLANA WRAPPED
          </h1>
          
          {/* Username/Pseudo */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            {pseudo}
          </div>
          
          {/* Code */}
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#9CA3AF',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              marginBottom: '24px',
            }}
          >
            Code: {code}
          </div>
          
          {/* Type badge */}
          <div
            style={{
              backgroundColor: type === 'degen' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              color: type === 'degen' ? '#EC4899' : '#3B82F6',
              padding: '12px 24px',
              borderRadius: '9999px',
              fontSize: '24px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {type === 'degen' ? 'Degen' : 'Builder'}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Check if this is a ref-based OG image (code, pseudo, type)
    const code = searchParams.get('code')
    const pseudo = searchParams.get('pseudo') || searchParams.get('username') || 'Anon'
    const type = searchParams.get('type') || 'builder'
    
    // If we have code, generate ref-based OG image
    if (code) {
      return generateRefOGImage(code, pseudo, type)
    }
    
    // Otherwise, use the existing wallet-based OG image
    // Get parameters from query string
    const address = searchParams.get('address') || ''
    
    // If no address provided, return default OG image
    if (!address) {
      return generateDefaultOGImage()
    }
    
    let txCount = searchParams.get('txCount') || '0'
    let activeDays = searchParams.get('activeDays') || '0'
    let topProtocol = searchParams.get('topProtocol') || 'Solana'
    let activityLevel = searchParams.get('activityLevel') || '1'

    // If we have an address but not the metrics, fetch them directly from Helius
    if (address && (txCount === '0' || !searchParams.get('txCount'))) {
      try {
        const heliusApiKey = process.env.HELIUS_API_KEY
        if (heliusApiKey) {
          const heliusUrl = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusApiKey}&limit=100`
          const response = await fetch(heliusUrl)
          
          if (response.ok) {
            const data = await response.json()
            
            // Filter for 2025 transactions
            const YEAR_START = new Date('2025-01-01T00:00:00Z').getTime() / 1000
            const transactions2025 = data.filter((tx: any) => {
              return tx.blockTime && tx.blockTime >= YEAR_START
            })
            
            // Filter out unsigned transactions
            const signedTransactions = transactions2025.filter((tx: any) => {
              return tx.transaction?.message?.header?.numRequiredSignatures > 0
            })
            
            txCount = signedTransactions.length === 100 ? '100+' : signedTransactions.length.toString()
            
            // Calculate active days
            const uniqueDays = new Set<string>()
            signedTransactions.forEach((tx: any) => {
              if (tx.blockTime) {
                const date = new Date(tx.blockTime * 1000)
                uniqueDays.add(date.toDateString())
              }
            })
            activeDays = uniqueDays.size.toString()
            
            // Get top protocol
            const PROTOCOLS: Record<string, string> = {
              'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter',
              '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium',
              'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': 'Raydium',
              'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca',
              'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLRk202ZR1jUd5': 'Phoenix',
              'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K': 'Magic Eden',
              '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'Pump.fun',
              'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD': 'KLend',
              'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo': 'Meteora',
              'KLp2CqwdSjPhJ5wyYoxbfynUmXj99dTthf4p1C1BqVLF': 'Kamino',
            }
            
            const protocolCounts: Record<string, number> = {}
            signedTransactions.forEach((tx: any) => {
              const instructions = tx.transaction?.message?.instructions || []
              instructions.forEach((inst: any) => {
                const programId = typeof inst.programId === 'string' 
                  ? inst.programId 
                  : inst.programId?.programId
                if (programId && PROTOCOLS[programId]) {
                  const protocol = PROTOCOLS[programId]
                  protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1
                }
              })
            })
            
            const protocols = Object.entries(protocolCounts)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
            
            if (protocols.length > 0) {
              topProtocol = protocols[0].name
            }
            
            // Calculate activity level
            const txCountNum = signedTransactions.length
            let level = 1
            if (txCountNum >= 100) {
              level = Math.min(10, 9 + Math.floor((txCountNum - 100) / 50))
            } else if (txCountNum >= 60) {
              level = 7 + Math.floor((txCountNum - 60) / 20)
            } else if (txCountNum >= 30) {
              level = 4 + Math.floor((txCountNum - 30) / 10)
            } else if (txCountNum >= 10) {
              level = 2 + Math.floor((txCountNum - 10) / 10)
            }
            activityLevel = level.toString()
          }
        }
      } catch (error) {
        console.error('Error fetching wallet data for OG:', error)
        // Use defaults if fetch fails
      }
    }
    
    // Truncate address for display
    const displayAddress = address 
      ? `${address.substring(0, 4)}...${address.slice(-4)}`
      : 'Your Wallet'

    // Determine badge color based on activity level
    let badgeColor = '#6B7280' // gray
    let badgeText = 'Newbie'
    
    const level = parseInt(activityLevel)
    if (level <= 1) {
      badgeColor = '#EF4444' // red
      badgeText = 'Newbie'
    } else if (level <= 3) {
      badgeColor = '#F97316' // orange
      badgeText = 'Beginner'
    } else if (level <= 6) {
      badgeColor = '#EAB308' // yellow
      badgeText = 'Active'
    } else if (level <= 8) {
      badgeColor = '#10B981' // green
      badgeText = 'Power User'
    } else {
      badgeColor = '#8B5CF6' // purple
      badgeText = 'Solana Maximalist'
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
            fontFamily: 'system-ui, -apple-system',
          }}
        >
          {/* Background gradient circles */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '900px',
              zIndex: 1,
            }}
          >
            {/* Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  background: 'linear-gradient(to right, #06B6D4, #8B5CF6, #10B981)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                SOLANA WRAPPED
              </h1>
              <p
                style={{
                  fontSize: '24px',
                  color: '#9CA3AF',
                  margin: '8px 0 0 0',
                  fontWeight: '300',
                }}
              >
                2025 EDITION
              </p>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '40px',
                width: '100%',
              }}
            >
              {/* Transactions */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  padding: '24px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 8px 0',
                  }}
                >
                  Transactions
                </p>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  {txCount}
                </p>
              </div>

              {/* Active Days */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  padding: '24px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 8px 0',
                  }}
                >
                  Active Days
                </p>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#10B981',
                    margin: 0,
                  }}
                >
                  {activeDays}
                </p>
              </div>
            </div>

            {/* Top Protocol */}
            <div
              style={{
                width: '100%',
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 12px 0',
                }}
              >
                Top Protocol
              </p>
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#8B5CF6',
                  margin: 0,
                }}
              >
                {topProtocol}
              </p>
            </div>

            {/* Badge and Activity Level */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Badge */}
              <div
                style={{
                  backgroundColor: `${badgeColor}33`,
                  color: badgeColor,
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                {badgeText}
              </div>

              {/* Activity Bars */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                    let barColor = '#1F2937'
                    if (i <= level) {
                      if (i <= 1) barColor = '#EF4444'
                      else if (i <= 3) barColor = '#F97316'
                      else if (i <= 6) barColor = '#EAB308'
                      else barColor = '#10B981'
                    }
                    return (
                      <div
                        key={i}
                        style={{
                          width: '4px',
                          height: '24px',
                          backgroundColor: barColor,
                          borderRadius: '2px',
                        }}
                      />
                    )
                  })}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    margin: 0,
                    fontFamily: 'monospace',
                  }}
                >
                  {displayAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}

