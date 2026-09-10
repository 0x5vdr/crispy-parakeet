import type { Analytics, Trade } from './types'

const API_URL = 'http://127.0.0.1:8000'

export async function getTraders(): Promise<string[]> {
  const response = await fetch(`${API_URL}/traders`)
  if (!response.ok) return ['Savdar']
  return response.json()
}

export async function getTrades(traderName?: string): Promise<Trade[]> {
  const url = traderName && traderName !== 'ALL'
    ? `${API_URL}/trades?trader_name=${encodeURIComponent(traderName)}`
    : `${API_URL}/trades`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch trades: ${response.statusText}`)
  return response.json()
}

export async function getAnalytics(traderName?: string): Promise<Analytics> {
  const url = traderName && traderName !== 'ALL'
    ? `${API_URL}/trades/analytics?trader_name=${encodeURIComponent(traderName)}`
    : `${API_URL}/trades/analytics`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.statusText}`)
  return response.json()
}

export async function createTrade(tradeData: Omit<Trade, 'id'>): Promise<Trade> {
  const response = await fetch(`${API_URL}/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeData),
  })
  if (!response.ok) {
    const errData = await response.json().catch(() => null)
    throw new Error(errData?.detail || `Failed to create trade: ${response.statusText}`)
  }
  return response.json()
}

export async function updateTrade(id: number, tradeData: Partial<Omit<Trade, 'id'>>): Promise<Trade> {
  const response = await fetch(`${API_URL}/trades/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeData),
  })
  if (!response.ok) {
    const errData = await response.json().catch(() => null)
    throw new Error(errData?.detail || `Failed to update trade: ${response.statusText}`)
  }
  return response.json()
}

export async function deleteTrade(id: number): Promise<Trade> {
  const response = await fetch(`${API_URL}/trades/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const errData = await response.json().catch(() => null)
    throw new Error(errData?.detail || `Failed to delete trade: ${response.statusText}`)
  }
  return response.json()
}