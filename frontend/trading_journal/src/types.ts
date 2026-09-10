export interface Trade {
  id: number
  trader_name?: string
  symbol: string
  direction: string
  entry_price: number | string
  stop_price: number | string
  exit_price: number | string
  risk_amount: number | string
  result_r: number | string
  setup: string
  session: string
  trade_date: string
  notes: string | null
}

export interface Analytics {
  win_rate: number
  losing_rate: number
  average_win_r: number
  average_losing_r: number
  expectancy: number
  profit_factor: number | null
  max_drawdown: number
}