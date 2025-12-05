'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Wallet,
  Activity,
  Calendar,
  Share2,
  Loader2,
  Repeat,
  Award,
  Music,
  Zap,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { backendApi } from '../lib/backendApi'

// --- CONFIGURATION ---
const YEAR_START = new Date('2025-01-01T00:00:00Z').getTime() / 1000

// Solana address validation
const isValidSolanaAddress = (address: string) => {
  if (!address || typeof address !== 'string') return false
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

// Known Program IDs for Protocol Identification
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
  'ComputeBudget111111111111111111111111111111': 'Compute Budget',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
}

// --- HELPERS ---
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// --- COMPONENTS ---

// 1. Landing Page
const Landing = ({ 
  onGenerate, 
  loading, 
  error 
}: { 
  onGenerate: (address: string) => void
  loading: boolean
  error: string
}) => {
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedAddress = address.trim()
    
    if (!trimmedAddress) {
      return
    }
    
    if (!isValidSolanaAddress(trimmedAddress)) {
      onGenerate(trimmedAddress)
      return
    }
    
    onGenerate(trimmedAddress)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 text-transparent bg-clip-text">
            SOLANA WRAPPED 2025
          </h1>
          <p className="text-xl text-gray-400 font-light">Your 2025 Solana On-Chain Story</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <input
              type="text"
              placeholder="Enter Solana Wallet Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="relative w-full bg-gray-900 border border-gray-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm placeholder-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Generate Wrapper <Zap size={18} fill="black" /></>}
          </button>
        </form>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-yellow-400 text-sm bg-yellow-900/20 p-3 rounded-lg border border-yellow-900/50 flex items-center gap-2 justify-center"
          >
            <AlertTriangle size={14} /> {error}
          </motion.p>
        )}

        <div className="flex gap-4 justify-center text-xs text-gray-600 pt-8">
          <span className="flex items-center gap-1"><Activity size={12}/> Live Mainnet Data</span>
          <span className="flex items-center gap-1"><Award size={12}/> Safe & Secure</span>
        </div>
        
        <div className="mt-8 pt-6 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <img src="/sparklogo.png" alt="Spark" className="h-8 w-auto" />
        </div>
      </motion.div>
    </div>
  )
}

// 2. Story Slide Component
const Slide = ({ 
  data, 
  active, 
  onNext, 
  onPrev, 
  isLast, 
  isFirst, 
  progressBars, 
  currentSlideIndex 
}: {
  data: any
  active: boolean
  onNext: () => void
  onPrev: () => void
  isLast: boolean
  isFirst: boolean
  progressBars: any[]
  currentSlideIndex: number
}) => {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 ${data.bg} opacity-20`} />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="z-10 w-full max-w-2xl"
      >
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 min-h-[600px] flex flex-col text-center space-y-6">
          {/* Progress Bars */}
          {progressBars && (
            <div className="flex gap-2 mb-4">
              {progressBars.map((_, idx) => {
                const isCompleted = idx < currentSlideIndex
                const isCurrent = idx === currentSlideIndex
                
                return (
                  <div key={idx} className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      key={`${idx}-${currentSlideIndex}`}
                      initial={{ width: isCompleted ? '100%' : '0%' }}
                      animate={{ 
                        width: isCompleted ? '100%' : (isCurrent ? '100%' : '0%')
                      }}
                      transition={{ 
                        duration: isCompleted ? 0.2 : (isCurrent ? 5 : 0),
                        ease: 'linear'
                      }}
                      className={`h-full ${(isCompleted || isCurrent) ? 'bg-white' : 'bg-transparent'}`}
                    />
                  </div>
                )
              })}
            </div>
          )}

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={active ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className={`p-6 rounded-full ${data.iconBg} mb-4`}>
              {data.icon}
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={active ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-200"
          >
            {data.title}
          </motion.h2>

          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.5, type: 'spring' }}
            className="py-8"
          >
            {typeof data.value === 'string' ? (
              <span className={`text-7xl font-black bg-gradient-to-r ${data.gradient} text-transparent bg-clip-text tracking-tighter`}>
                {data.value}
              </span>
            ) : (
              <div className={`text-7xl font-black bg-gradient-to-r ${data.gradient} text-transparent bg-clip-text tracking-tighter`}>
                {data.value}
              </div>
            )}

            {data.subValue && (
              <p className="text-gray-400 mt-2 text-lg font-medium">{data.subValue}</p>
            )}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            {data.description}
          </motion.p>

          {data.extraContent}

          <div className="mt-auto pt-6 flex gap-3">
            {!isFirst && (
              <button 
                onClick={onPrev}
                className="px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <button 
              onClick={onNext}
              className={`${!isFirst ? 'flex-1' : 'w-full'} bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group`}
            >
              {isLast ? "Share Results" : "Next"} 
              {!isLast && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <img src="/sparklogo.png" alt="Spark" className="h-8 w-auto" />
        </div>
      </motion.div>
    </div>
  )
}

// 3. Summary Card (Final Slide)
const Summary = ({ 
  metrics, 
  onShare, 
  onReset, 
  onBack 
}: {
  metrics: any
  onShare: () => void
  onReset: () => void
  onBack: () => void
}) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white italic">SOLANA WRAPPED</h3>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm font-mono mt-1">2025 EDITION</p>
                </div>
              </div>
              <div>
                <img src="/Solana.avif" className="w-16 h-16" alt="Solana" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-2xl space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Transactions</p>
                <p className="text-2xl font-bold text-white">{metrics.txCount}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Active Days</p>
                <p className="text-2xl font-bold text-green-400">{metrics.activeDays}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl col-span-2 space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Top Protocol</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const getProtocolLogo = (protocolName: string) => {
                      const logoMap: Record<string, string> = {
                        'Jupiter': '/Jupiter.avif',
                        'Raydium': '/Raydium.avif',
                        'Orca': '/Orca.avif',
                        'Phoenix': '/Orca.avif',
                        'Meteora': '/Meteora.png',
                        'Magic Eden': '/Magic20Eden.webp',
                        'Pump.fun': '/Pumpfun.png',
                        'KLend': '/Kamino20Finance.avif',
                        'Kamino': '/Kamino20Finance.avif',
                      }
                      return logoMap[protocolName]
                    }

                    const logoPath = getProtocolLogo(metrics.topProtocol)
                    
                    if (logoPath) {
                      return (
                        <img 
                          src={logoPath} 
                          alt={metrics.topProtocol} 
                          className="w-6 h-6 object-contain"
                        />
                      )
                    }
                    return null
                  })()}
                  <p className="text-xl font-bold text-purple-400">{metrics.topProtocol}</p>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Used {metrics.topProtocolCount} times</span>
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl col-span-2 space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">First Move of 2025</p>
                <p className="text-sm font-medium text-gray-300 break-all line-clamp-2">
                  {metrics.firstAction}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="flex flex-col gap-2">
                {(() => {
                  const getScoringName = (protocolName: string) => {
                    const scoringMap: Record<string, string> = {
                      'Jupiter': 'Aggregator Pro',
                      'Raydium': 'Yield Farmer Pro',
                      'Orca': 'Liquidity Provider Pro',
                      'Phoenix': 'Liquidity Provider Pro',
                      'Meteora': 'Liquidity Provider Pro',
                      'Magic Eden': 'NFT Collector Pro',
                      'Pump.fun': 'Degen Pro',
                      'KLend': 'Lender Pro',
                      'Kamino': 'Lender Pro',
                    }
                    return scoringMap[protocolName] || 'On-Chain Explorer'
                  }
                  
                  const scoringName = getScoringName(metrics.topProtocol)
                  
                  const badgeConfig: Record<string, { bg: string; text: string }> = {
                    'Aggregator Pro': { bg: 'bg-green-500/20', text: 'text-green-300' },
                    'Yield Farmer Pro': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
                    'Liquidity Provider Pro': { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
                    'NFT Collector Pro': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
                    'Degen Pro': { bg: 'bg-pink-500/20', text: 'text-pink-300' },
                    'Lender Pro': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
                    'On-Chain Explorer': { bg: 'bg-gray-500/20', text: 'text-gray-300' },
                  }
                  
                  const config = badgeConfig[scoringName] || { bg: 'bg-white/10', text: 'text-gray-300' }
                  
                  return (
                    <span className={`px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm inline-block w-fit`}>
                      {scoringName}
                    </span>
                  )
                })()}
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => {
                    let barColor = 'bg-gray-800'
                    if (i <= metrics.activityLevel) {
                      if (i <= 1) barColor = 'bg-red-500'
                      else if (i <= 3) barColor = 'bg-orange-500'
                      else if (i <= 6) barColor = 'bg-yellow-500'
                      else barColor = 'bg-green-500'
                    }
                    return (
                      <div key={i} className={`w-1 h-6 rounded-full ${barColor}`} />
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {(() => {
                    if (metrics.activityLevel <= 1) return 'Newbie'
                    if (metrics.activityLevel <= 3) return 'Beginner'
                    if (metrics.activityLevel <= 6) return 'Active'
                    if (metrics.activityLevel <= 8) return 'Power User'
                    return 'Solana Maximalist'
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          )}
          <button 
            onClick={onShare}
            className="flex-1 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> Share on X
          </button>
          <button 
            onClick={onReset}
            className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <img src="/sparklogo.png" alt="Spark" className="h-8 w-auto" />
        </div>
      </motion.div>
    </div>
  )
}

// --- MAIN APP ---
function SolanaWrappedAppContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'landing' | 'loading' | 'story' | 'summary'>('landing')
  const [metrics, setMetrics] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')
  const [error, setError] = useState('')

  // Check for address in URL params
  useEffect(() => {
    const address = searchParams.get('address')
    if (address && isValidSolanaAddress(address)) {
      fetchWalletData(address)
    }
  }, [searchParams])

  const fetchWalletData = async (addressStr: string) => {
    if (!isValidSolanaAddress(addressStr)) {
      setError('Invalid Solana wallet address. Please enter a valid address (32-44 characters, base58 encoded).')
      setView('landing')
      return
    }

    setView('loading')
    setError('')
    setMetrics(null)

    try {
      const loadingMessages = [
        'Searching the blockchain...',
        'Scanning transaction history...',
        'Looking for token transfers...',
        'Detecting DEX swaps...',
        'Multiple swaps found',
        'Analyzing token interactions...',
        'Processing transaction data...',
        'Filtering spam transactions...',
        'Identifying protocols...',
        'Calculating activity metrics...',
        'Finding first token interaction...',
        'Parsing smart contracts...',
        'Extracting token metadata...',
        'Building your story...',
        'Almost done...',
      ]

      let messageIndex = 0
      let messageTimeoutId: NodeJS.Timeout | null = null
      
      const scheduleNextMessage = () => {
        setLoadingText(loadingMessages[messageIndex])
        messageIndex = (messageIndex + 1) % loadingMessages.length
        messageTimeoutId = setTimeout(() => {
          scheduleNextMessage()
        }, 1500)
      }

      scheduleNextMessage()

      const result = await backendApi.getTransactions({
        address: addressStr,
        limit: 100
      })

      if (messageTimeoutId) {
        clearTimeout(messageTimeoutId)
        messageTimeoutId = null
      }

      if (!result || !result.data || result.data.length === 0) {
        throw new Error("No transactions found for 2025.")
      }

      const transactions = result.data
      const firstCoinTraded = result.summary?.firstCoinTraded || null
      const summary = result.summary || {}

      if (summary.totalTransactions) {
        setLoadingText(`${summary.totalTransactions} transactions found`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      if (summary.removedSpam || summary.removedUnsigned) {
        setLoadingText('Filtering spam and unsigned transactions...')
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      setLoadingText('Analyzing protocols...')

      const txCount = transactions.length

      const uniqueDays = new Set<string>()
      transactions.forEach((tx: any) => {
        if (tx.blockTime) {
          const date = new Date(tx.blockTime * 1000)
          uniqueDays.add(date.toDateString())
        }
      })
      const activeDays = uniqueDays.size

      const oldestFetched = transactions[transactions.length - 1]
      let firstAction = "Unknown Activity"

      if (oldestFetched.blockTime) {
        const oldestDate = new Date(oldestFetched.blockTime * 1000)
        firstAction = `Activity on ${formatDate(oldestDate)}`
      }

      if (summary.pagesFetched && summary.pagesFetched > 1) {
        setLoadingText(`Processed ${summary.pagesFetched} pages of transactions...`)
        await new Promise(resolve => setTimeout(resolve, 600))
      }
      
      setLoadingText('Parsing smart contracts...')

      const protocolsFromAPI = summary.protocols || []
      
      let topProtocol = "Multiple Interactions"
      let topProtocolCount = 0

      if (protocolsFromAPI.length > 0) {
        const topProtocolData = protocolsFromAPI[0]
        topProtocol = topProtocolData.name
        topProtocolCount = topProtocolData.count
      }

      if (topProtocol === "Jupiter" || topProtocol === "Raydium") {
        firstAction = "DeFi Trading"
      } else if (topProtocol === "Magic Eden") {
        firstAction = "NFT Activity"
      }

      let activityLevel = 1
      if (txCount >= 100) {
        activityLevel = Math.min(10, 9 + Math.floor((txCount - 100) / 50))
      } else if (txCount >= 60) {
        activityLevel = 7 + Math.floor((txCount - 60) / 20)
      } else if (txCount >= 30) {
        activityLevel = 4 + Math.floor((txCount - 30) / 10)
      } else if (txCount >= 10) {
        activityLevel = 2 + Math.floor((txCount - 10) / 10)
      }

      setMetrics({
        txCount: txCount === 100 ? "100+" : txCount,
        activeDays,
        firstAction,
        topProtocol,
        topProtocolCount: topProtocolCount || "Multiple",
        activityLevel,
        address: addressStr,
        firstCoinTraded: firstCoinTraded
      })

      setTimeout(() => setView('story'), 800)

    } catch (err: any) {
      console.error("Failed to fetch wallet data:", err)
      
      let errorMessage = "Failed to fetch transaction data."
      
      if (err.message) {
        if (err.message.includes("Invalid limit")) {
          errorMessage = "API limit error. Please try again."
        } else if (err.message.includes("No transactions")) {
          errorMessage = "No transactions found for this address in 2025."
        } else if (err.message.includes("Invalid")) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setView('landing')
    }
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(c => c + 1)
    } else {
      setView('summary')
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(c => c - 1)
    }
  }

  const shareOnTwitter = () => {
    if (!metrics) return

    const protocolTwitterMap: Record<string, string | null> = {
      'Jupiter': '@JupiterExchange',
      'Raydium': '@Raydium',
      'Orca': '@orca_so',
      'Phoenix': '@orca_so',
      'Meteora': '@MeteoraAG',
      'Magic Eden': null,
      'Pump.fun': '@Pumpfun',
      'KLend': '@kamino',
      'Kamino': '@kamino',
    }

    const twitterHandle = protocolTwitterMap[metrics.topProtocol] || ''
    const topProtocolText = twitterHandle ? `${twitterHandle}` : metrics.topProtocol

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://solana-wrapped.app'
    const text = `I wrapped my Solana year! 🚀\n\n📊 ${metrics.txCount} Transactions\n🗓️ ${metrics.activeDays} Days Active\n🏆 Top Protocol: ${topProtocolText}\n\nCheck your on-chain story 👇\n${baseUrl}/?address=${metrics.address}`

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const slides = metrics ? [
    {
      title: "The Volume",
      value: metrics.txCount,
      subValue: "Signed Transactions",
      description: metrics.txCount > 50 ? "You were absolutely relentless this year." : "Quality over quantity. Every move counted.",
      icon: <Zap size={40} className="text-yellow-400" />,
      bg: "bg-yellow-500",
      gradient: "from-yellow-300 to-orange-500",
      iconBg: "bg-yellow-900/50"
    },
    {
      title: "Consistency",
      value: metrics.activeDays,
      subValue: "Days Active",
      description: metrics.activeDays > 20 ? "The blockchain never sleeps, and apparently neither do you." : "You popped in when it mattered most.",
      icon: <Calendar size={40} className="text-green-400" />,
      bg: "bg-green-500",
      gradient: "from-green-300 to-emerald-500",
      iconBg: "bg-green-900/50"
    },
    {
      title: "Favorite Playground",
      value: (() => {
        const getProtocolLogo = (protocolName: string) => {
          const logoMap: Record<string, string> = {
            'Jupiter': '/Jupiter.avif',
            'Raydium': '/Raydium.avif',
            'Orca': '/Orca.avif',
            'Phoenix': '/Orca.avif',
            'Meteora': '/Meteora.png',
            'Magic Eden': '/Magic20Eden.webp',
            'Pump.fun': '/Pumpfun.png',
            'KLend': '/Kamino20Finance.avif',
            'Kamino': '/Kamino20Finance.avif',
          }
          return logoMap[protocolName]
        }

        const logoPath = getProtocolLogo(metrics.topProtocol)
        
        if (logoPath) {
          return (
            <div className="flex items-center justify-center gap-4">
              <img 
                src={logoPath} 
                alt={metrics.topProtocol} 
                className="w-16 h-16 object-contain"
              />
              <span>{metrics.topProtocol}</span>
            </div>
          )
        }
        
        return metrics.topProtocol
      })(),
      subValue: `${metrics.topProtocolCount} Interactions`,
      description: "This is where you spent most of your gas fees.",
      icon: <Activity size={40} className="text-purple-400" />,
      bg: "bg-purple-500",
      gradient: "from-purple-300 to-indigo-500",
      iconBg: "bg-purple-900/50",
      extraContent: (
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          {(() => {
            const getScoringName = (protocolName: string) => {
              const scoringMap: Record<string, string> = {
                'Jupiter': 'Aggregator Pro',
                'Raydium': 'Yield Farmer Pro',
                'Orca': 'Liquidity Provider Pro',
                'Phoenix': 'Liquidity Provider Pro',
                'Meteora': 'Liquidity Provider Pro',
                'Magic Eden': 'NFT Collector Pro',
                'Pump.fun': 'Degen Pro',
                'KLend': 'Lender Pro',
                'Kamino': 'Lender Pro',
              }
              return scoringMap[protocolName] || 'On-Chain Explorer'
            }
            
            const scoringName = getScoringName(metrics.topProtocol)
            
            const badgeConfig: Record<string, { bg: string; text: string }> = {
              'Aggregator Pro': { bg: 'bg-green-500/20', text: 'text-green-300' },
              'Yield Farmer Pro': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
              'Liquidity Provider Pro': { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
              'NFT Collector Pro': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
              'Degen Pro': { bg: 'bg-pink-500/20', text: 'text-pink-300' },
              'Lender Pro': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
              'On-Chain Explorer': { bg: 'bg-gray-500/20', text: 'text-gray-300' },
            }
            
            const config = badgeConfig[scoringName] || { bg: 'bg-white/10', text: 'text-gray-300' }
            
            return (
              <span className={`px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm`}>
                {scoringName}
              </span>
            )
          })()}
          <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm">On-Chain</span>
        </div>
      )
    },
    {
      title: "First Coin Interaction",
      value: metrics.firstCoinTraded?.tokenMint 
        ? (metrics.firstCoinTraded.tokenName || metrics.firstCoinTraded.tokenSymbol || `${metrics.firstCoinTraded.tokenMint.substring(0, 4)}...${metrics.firstCoinTraded.tokenMint.slice(-4)}`)
        : "No Trades",
      subValue: metrics.firstCoinTraded?.date 
        ? formatDate(metrics.firstCoinTraded.date)
        : metrics.firstAction,
      description: metrics.firstCoinTraded?.dex
        ? `Your first trade was on ${metrics.firstCoinTraded.dex}. The journey begins with a single swap.`
        : metrics.firstCoinTraded?.tokenMint
        ? (metrics.firstCoinTraded.tokenName || metrics.firstCoinTraded.tokenSymbol
          ? `Your first token interaction of 2025: ${metrics.firstCoinTraded.tokenName || metrics.firstCoinTraded.tokenSymbol}.`
          : "Your first token interaction of 2025.")
        : "How your journey started in this data snapshot.",
      icon: <Music size={40} className="text-blue-400" />,
      bg: "bg-blue-500",
      gradient: "from-blue-300 to-cyan-500",
      iconBg: "bg-blue-900/50",
      extraContent: metrics.firstCoinTraded?.signature ? (
        <div className="mt-6">
          <a
            href={`https://orb.helius.dev/tx/${metrics.firstCoinTraded.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-medium transition-colors border border-blue-500/30"
          >
            <span>View on Orb</span>
            <ExternalLink size={14} />
          </a>
        </div>
      ) : null
    }
  ] : []

  return (
    <div className="font-sans antialiased bg-black min-h-screen text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <Landing key="landing" onGenerate={fetchWalletData} loading={view === 'loading'} error={error} />
        )}

        {view === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-gray-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                <Wallet className="text-gray-500 animate-pulse" />
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-xl font-mono text-purple-400"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {view === 'story' && metrics && (
          <div key="story" className="relative min-h-screen bg-black overflow-hidden">
            <div className="relative w-full h-full min-h-screen">
              {slides.map((slide, index) => (
                <Slide 
                  key={index}
                  data={slide} 
                  active={index === currentSlide} 
                  onNext={nextSlide}
                  onPrev={prevSlide}
                  isLast={index === slides.length - 1}
                  isFirst={index === 0}
                  progressBars={slides}
                  currentSlideIndex={currentSlide}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'summary' && metrics && (
          <Summary 
            key="summary" 
            metrics={metrics} 
            onShare={shareOnTwitter}
            onBack={() => {
              setView('story')
              if (slides && slides.length > 0) {
                setCurrentSlide(slides.length - 1)
              }
            }}
            onReset={() => {
              setView('landing')
              setMetrics(null)
              setCurrentSlide(0)
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SolanaWrappedApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SolanaWrappedAppContent />
    </Suspense>
  )
}

