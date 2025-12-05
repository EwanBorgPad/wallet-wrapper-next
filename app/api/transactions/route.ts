import { NextRequest, NextResponse } from 'next/server'

const YEAR_START = new Date('2025-01-01T00:00:00Z').getTime() / 1000

// Helper function to fetch a single page of transactions from Helius
const fetchTransactionsPage = async (
  address: string,
  apiKey: string,
  paginationToken: string | null = null
): Promise<{ data: any[], paginationToken?: string }> => {
  const heliusEndpoint = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
  const maxLimit = 100 // Helius API max limit for full transaction details

  // Build params object according to Helius API documentation
  const options: any = {
    transactionDetails: 'full',
    limit: maxLimit,
    sortOrder: 'desc',
    filters: {
      status: 'succeeded',
      blockTime: {
        gte: YEAR_START
      }
    }
  }

  // Add paginationToken if provided
  if (paginationToken) {
    options.paginationToken = paginationToken
  }

  const requestBody = {
    jsonrpc: '2.0',
    id: '1',
    method: 'getTransactionsForAddress',
    params: [address, options]
  }

  const response = await fetch(heliusEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Helius API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || "Failed to fetch transactions")
  }

  return {
    data: data.result?.data || [],
    paginationToken: data.result?.paginationToken
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

  if (!address) {
    return NextResponse.json(
      { message: 'Address is required' },
      { status: 400 }
    )
  }

  // Validate Solana address
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  if (!base58Regex.test(address)) {
    return NextResponse.json(
      { message: 'Invalid Solana wallet address' },
      { status: 400 }
    )
  }

  try {
    // Call Helius API (you'll need to set HELIUS_API_KEY in your environment)
    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      return NextResponse.json(
        { message: 'HELIUS_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Fetch ALL transactions using pagination (like WalletWrapper2)
    console.log('[TRANSACTIONS] Starting pagination to fetch all 2025 transactions...')
    let allTransactions: any[] = []
    let paginationToken: string | null = null
    let pageCount = 0
    const maxPages = 100 // Safety limit to prevent infinite loops

    do {
      pageCount++
      console.log(`[PAGINATION] Fetching page ${pageCount}...`)

      try {
        const pageResult = await fetchTransactionsPage(address, heliusApiKey, paginationToken)
        const pageTransactions = pageResult.data || []
        
        console.log(`[PAGINATION] Page ${pageCount}: Received ${pageTransactions.length} transactions`)
        
        allTransactions = allTransactions.concat(pageTransactions)
        paginationToken = pageResult.paginationToken || null

        // If we got less than 100 transactions, we've reached the end
        if (pageTransactions.length < 100) {
          console.log('[PAGINATION] Reached end of transactions (less than 100 in last page)')
          break
        }

        // Safety check to prevent infinite loops
        if (pageCount >= maxPages) {
          console.log(`[PAGINATION] Reached max pages limit (${maxPages}), stopping pagination`)
          break
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (pageError: any) {
        // If pagination fails, try without pagination token (might be first page issue)
        if (paginationToken && pageCount > 1) {
          console.log('[PAGINATION] Pagination failed, stopping. Error:', pageError.message)
          break
        } else {
          // If first page fails, rethrow
          throw pageError
        }
      }
    } while (paginationToken)

    console.log(`[TRANSACTIONS] Pagination complete. Total transactions fetched: ${allTransactions.length} across ${pageCount} pages`)

    const transactions = allTransactions

    // Filter out unsigned transactions (only keep transactions signed by the wallet)
    const signedTransactions = transactions.filter((tx: any) => {
      // Check if wallet is a signer
      const accountKeys = tx.transaction?.message?.accountKeys || []
      const header = tx.transaction?.message?.header || {}
      const numRequiredSignatures = header.numRequiredSignatures || 0
      const signers = accountKeys.slice(0, numRequiredSignatures)
      
      // Check if wallet address is in the signers
      for (const signer of signers) {
        const signerAddress = typeof signer === 'string' 
          ? signer 
          : signer?.pubkey || signer?.toString() || ''
        
        if (signerAddress === address) {
          return true
        }
      }
      
      return false
    })

    // Filter out failed transactions
    const successfulTransactions = signedTransactions.filter((tx: any) => {
      return !tx.err && !tx.meta?.err && !tx.transaction?.meta?.err
    })

    // Protocol identification logic (simplified - you may want to enhance this)
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
    
    successfulTransactions.forEach((tx: any) => {
      const instructions = tx.transaction?.message?.instructions || []
      const accountKeys = tx.transaction?.message?.accountKeys || []
      
      instructions.forEach((inst: any) => {
        // Handle different programId formats
        let programId: string | null = null
        
        if (typeof inst.programId === 'string') {
          programId = inst.programId
        } else if (typeof inst.programId === 'number') {
          // programId might be an index into accountKeys
          const accountKey = accountKeys[inst.programId]
          if (accountKey) {
            programId = typeof accountKey === 'string' ? accountKey : accountKey?.pubkey || accountKey?.toString() || null
          }
        } else if (inst.programId) {
          programId = inst.programId.programId || inst.programId.toString() || null
        }
        
        if (programId && PROTOCOLS[programId]) {
          const protocol = PROTOCOLS[programId]
          protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1
        }
      })
      
      // Also check accountKeys directly for protocol program IDs
      accountKeys.forEach((accountKey: any) => {
        const key = typeof accountKey === 'string' ? accountKey : accountKey?.pubkey || accountKey?.toString() || ''
        if (key && PROTOCOLS[key]) {
          const protocol = PROTOCOLS[key]
          protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1
        }
      })
    })

    const protocols = Object.entries(protocolCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Extract token information from a swap/trade transaction (from WalletWrapper2)
    const extractTokenFromTransaction = (tx: any): { tokenMint: string | null, dex: string | null, type: string } => {
      try {
        const instructions = tx.transaction?.message?.instructions || []
        const accountKeys = tx.transaction?.message?.accountKeys || []
        const DEX_PROGRAMS = new Set([
          'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
          '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
          'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', // Raydium CLMM
          'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca
          'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLRk202ZR1jUd5', // Phoenix
        ])
        
        for (const instruction of instructions) {
          // Handle different programId formats
          let programId: string | null = null
          if (typeof instruction.programId === 'string') {
            programId = instruction.programId
          } else if (typeof instruction.programId === 'number') {
            const accountKey = accountKeys[instruction.programId]
            if (accountKey) {
              programId = typeof accountKey === 'string' ? accountKey : accountKey?.pubkey || accountKey?.toString() || null
            }
          } else if (instruction.programId) {
            programId = instruction.programId.programId || instruction.programId.toString() || null
          }
          
          // Check if it's a DEX swap
          if (programId && DEX_PROGRAMS.has(programId)) {
            let dexName = 'Unknown DEX'
            if (programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4') dexName = 'Jupiter'
            else if (programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' || programId === 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK') dexName = 'Raydium'
            else if (programId === 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc') dexName = 'Orca'
            else if (programId === 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLRk202ZR1jUd5') dexName = 'Phoenix'
            
            // Try to extract token mint from parsed instruction
            if (instruction.parsed) {
              const parsed = instruction.parsed
              
              // Jupiter swap format
              if (parsed.type === 'swap' || parsed.type === 'route' || parsed.type === 'routeV2') {
                const tokenMint = parsed.info?.sourceMint || parsed.info?.destinationMint || 
                                parsed.info?.inAmount?.mint || parsed.info?.outAmount?.mint ||
                                parsed.info?.inputMint || parsed.info?.outputMint ||
                                parsed.info?.routePlan?.route?.inputMint || parsed.info?.routePlan?.route?.outputMint
                if (tokenMint) {
                  return { tokenMint, dex: dexName, type: 'swap' }
                }
              }
              
              // Raydium swap format
              if (parsed.type === 'swap' || parsed.type === 'swapBaseIn' || parsed.type === 'swapBaseOut') {
                const tokenMint = parsed.info?.sourceMint || parsed.info?.destinationMint ||
                                parsed.info?.mintA || parsed.info?.mintB ||
                                parsed.info?.tokenAMint || parsed.info?.tokenBMint
                if (tokenMint) {
                  return { tokenMint, dex: dexName, type: 'swap' }
                }
              }
            }
            
            // If we found a DEX but couldn't extract token, return the DEX name
            return { tokenMint: null, dex: dexName, type: 'swap' }
          }
          
          // Check for token transfers (might be first token interaction)
          if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
            if (instruction.parsed) {
              const parsed = instruction.parsed
              if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
                const tokenMint = parsed.info?.mint || parsed.info?.authority
                if (tokenMint) {
                  return { tokenMint, dex: null, type: 'transfer' }
                }
              }
              if (parsed.type === 'mintTo') {
                const tokenMint = parsed.info?.mint
                if (tokenMint) {
                  return { tokenMint, dex: null, type: 'mint' }
                }
              }
            }
          }
        }
        
        // Fallback: Check token balances to find token interactions
        const meta = tx.meta || tx.transaction?.meta
        if (meta) {
          const preTokenBalances = meta.preTokenBalances || []
          const postTokenBalances = meta.postTokenBalances || []
          
          // Find tokens with balance changes (indicating exchange/interaction)
          for (const postBalance of postTokenBalances) {
            if (!postBalance.mint) continue
            
            const preBalance = preTokenBalances.find((pre: any) => 
              pre.accountIndex === postBalance.accountIndex && pre.mint === postBalance.mint
            )
            
            const preAmount = preBalance ? parseFloat(preBalance.uiTokenAmount?.uiAmountString || '0') : 0
            const postAmount = parseFloat(postBalance.uiTokenAmount?.uiAmountString || '0')
            
            // If balance changed significantly, this token was interacted with
            if (Math.abs(postAmount - preAmount) > 0.000001) {
              return { tokenMint: postBalance.mint, dex: null, type: 'balance_change' }
            }
          }
          
          // If no balance changes but tokens exist, return the first token mint found
          const tokenMints = new Set<string>()
          preTokenBalances.forEach((balance: any) => {
            if (balance.mint) tokenMints.add(balance.mint)
          })
          postTokenBalances.forEach((balance: any) => {
            if (balance.mint) tokenMints.add(balance.mint)
          })
          
          if (tokenMints.size > 0) {
            const firstTokenMint = Array.from(tokenMints)[0]
            return { tokenMint: firstTokenMint, dex: null, type: 'token_presence' }
          }
        }
        
        return { tokenMint: null, dex: null, type: 'unknown' }
      } catch (e) {
        console.error('[TOKEN] Error extracting token from transaction:', e)
        return { tokenMint: null, dex: null, type: 'error' }
      }
    }

    // Find first coin traded (sort by blockTime oldest first)
    let firstCoinTraded: { tokenMint: string | null, dex: string | null, date: string | null, signature: string | null, type: string | null } = {
      tokenMint: null,
      dex: null,
      date: null,
      signature: null,
      type: null
    }
    
    const sortedTransactions = [...successfulTransactions].sort((a: any, b: any) => {
      const timeA = a.blockTime || a.transaction?.blockTime || 0
      const timeB = b.blockTime || b.transaction?.blockTime || 0
      return timeA - timeB
    })
    
    // Prioritize swaps over transfers
    let firstSwap: any = null
    let firstTokenInteraction: any = null
    
    for (const tx of sortedTransactions) {
      const tokenInfo = extractTokenFromTransaction(tx)
      if (tokenInfo.tokenMint || tokenInfo.dex) {
        const blockTime = tx.blockTime || tx.transaction?.blockTime
        const date = blockTime ? new Date(blockTime * 1000).toISOString() : null
        
        const tokenData = {
          tokenMint: tokenInfo.tokenMint,
          dex: tokenInfo.dex,
          date: date,
          signature: tx.signature || tx.transaction?.signatures?.[0] || null,
          type: tokenInfo.type
        }
        
        // Prioritize swaps over transfers
        if (tokenInfo.type === 'swap' && !firstSwap) {
          firstSwap = tokenData
        }
        
        // Keep first token interaction as fallback
        if (!firstTokenInteraction) {
          firstTokenInteraction = tokenData
        }
        
        // If we found a swap, use it; otherwise use first token interaction
        if (firstSwap) {
          firstCoinTraded = firstSwap
          break
        }
      }
    }
    
    // If no swap found, use first token interaction
    if (!firstCoinTraded.tokenMint && firstTokenInteraction) {
      firstCoinTraded = firstTokenInteraction
    }

    // Fetch token metadata (name, symbol) if we found a first coin traded
    let tokenName: string | null = null
    let tokenSymbol: string | null = null
    
    if (firstCoinTraded.tokenMint) {
      console.log('[TRANSACTIONS] Fetching token metadata for:', firstCoinTraded.tokenMint.substring(0, 20) + '...')
      
      try {
        // Method 1: Try Jupiter Token List API (fast, reliable for popular tokens)
        const jupiterResponse = await fetch('https://token.jup.ag/strict', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (jupiterResponse.ok) {
          const tokens = await jupiterResponse.json()
          if (Array.isArray(tokens)) {
            const token = tokens.find((t: any) => t.address === firstCoinTraded.tokenMint)
            if (token && (token.name || token.symbol)) {
              tokenName = token.name || null
              tokenSymbol = token.symbol || null
              console.log('[TRANSACTIONS] Token metadata found via Jupiter:', { name: tokenName, symbol: tokenSymbol })
            }
          }
        }
      } catch (e) {
        console.log('[TRANSACTIONS] Jupiter API failed:', e instanceof Error ? e.message : String(e))
      }
      
      // If Jupiter didn't work, try Helius token metadata API
      if (!tokenName && !tokenSymbol && heliusApiKey) {
        try {
          const assetResponse = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${heliusApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mintAccounts: [firstCoinTraded.tokenMint]
            })
          })
          
          if (assetResponse.ok) {
            const assetData = await assetResponse.json()
            if (assetData && Array.isArray(assetData) && assetData.length > 0 && assetData[0]) {
              const token = assetData[0]
              tokenName = token.onChainMetadata?.metadata?.data?.name || 
                         token.offChainMetadata?.metadata?.name || 
                         token.content?.metadata?.name ||
                         null
              tokenSymbol = token.onChainMetadata?.metadata?.data?.symbol || 
                           token.offChainMetadata?.metadata?.symbol || 
                           token.content?.metadata?.symbol ||
                           null
              if (tokenName || tokenSymbol) {
                console.log('[TRANSACTIONS] Token metadata found via Helius:', { name: tokenName, symbol: tokenSymbol })
              }
            }
          }
        } catch (e) {
          console.log('[TRANSACTIONS] Helius token metadata API failed:', e instanceof Error ? e.message : String(e))
        }
      }
    }

    return NextResponse.json({
      data: successfulTransactions,
      summary: {
        totalTransactions: successfulTransactions.length,
        originalCount: transactions.length,
        removedSpam: 0, // Simplified - could add spam filtering later
        removedUnsigned: transactions.length - signedTransactions.length,
        pagesFetched: pageCount,
        protocols,
        firstCoinTraded: firstCoinTraded.tokenMint ? {
          tokenMint: firstCoinTraded.tokenMint,
          tokenName: tokenName,
          tokenSymbol: tokenSymbol,
          dex: firstCoinTraded.dex,
          date: firstCoinTraded.date,
          signature: firstCoinTraded.signature,
          type: firstCoinTraded.type
        } : null,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

