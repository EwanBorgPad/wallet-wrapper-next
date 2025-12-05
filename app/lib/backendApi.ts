/**
 * Backend API Client for Next.js
 * 
 * This module provides functions to interact with the API endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'

// Wallet Wrapped API Types
export type TransactionData = {
  data: Array<{
    signature: string
    blockTime: number
    transaction: {
      message: {
        instructions: Array<{
          programId: string | { programId: string }
        }>
      }
    }
  }>
  paginationToken?: string
  summary?: {
    totalTransactions?: number
    removedSpam?: number
    removedUnsigned?: number
    pagesFetched?: number
    protocols?: Array<{
      name: string
      count: number
    }>
    firstCoinTraded?: {
      tokenMint: string
      tokenName?: string
      tokenSymbol?: string
      date?: string
      dex?: string
      signature?: string
    }
  }
}

type GetTransactionsArgs = {
  address: string
  limit?: number
}

export const getTransactions = async ({ address, limit = 100 }: GetTransactionsArgs): Promise<TransactionData> => {
  if (!address) {
    throw new Error("Address is required")
  }

  // Use GET with query parameters
  const url = new URL(`${API_BASE_URL}/transactions`, window.location.origin)
  url.searchParams.set("address", address)
  if (limit) {
    url.searchParams.set("limit", limit.toString())
  }

  const response = await fetch(url.toString(), {
    method: "GET",
  })

  const json = (await response.json()) as TransactionData & { message?: string }

  if (!response.ok) {
    throw new Error(json?.message ?? "Failed to fetch transactions")
  }

  return json
}

export const backendApi = {
  getTransactions,
}

