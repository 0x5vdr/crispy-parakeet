import { useState, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Trade } from '../types'

interface EquityChartProps {
  trades: Trade[]
}

type TimeFrame = '1W' | '1M' | '3M' | 'ALL'

function EquityChart({ trades }: EquityChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>('ALL')

  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime(),
    )
  }, [trades])

  // Filter based on selected timeframe
  const filteredTrades = useMemo(() => {
    if (timeframe === 'ALL' || sortedTrades.length === 0) return sortedTrades

    const now = new Date()
    const cutoff = new Date()

    if (timeframe === '1W') cutoff.setDate(now.getDate() - 7)
    else if (timeframe === '1M') cutoff.setMonth(now.getMonth() - 1)
    else if (timeframe === '3M') cutoff.setMonth(now.getMonth() - 3)

    const filtered = sortedTrades.filter(
      (t) => new Date(t.trade_date) >= cutoff,
    )
    return filtered.length > 0 ? filtered : sortedTrades
  }, [sortedTrades, timeframe])

  const { chartData, totalR, peakR } = useMemo(() => {
    let cumulative = 0
    let peak = 0

    const data = filteredTrades.map((trade, index) => {
      const rVal = Number(trade.result_r) || 0
      cumulative += rVal
      if (cumulative > peak) peak = cumulative

      return {
        tradeIndex: index + 1,
        date: new Date(trade.trade_date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: new Date(trade.trade_date).toLocaleString(),
        r: Number(cumulative.toFixed(2)),
        tradeR: Number(rVal.toFixed(2)),
        symbol: trade.symbol,
        direction: trade.direction,
        setup: trade.setup,
      }
    })

    return {
      chartData: data,
      totalR: cumulative,
      peakR: peak,
    }
  }, [filteredTrades])

  const minR = useMemo(() => {
    if (chartData.length === 0) return 0
    const values = chartData.map((d) => d.r)
    return Math.min(0, ...values)
  }, [chartData])

  const maxR = useMemo(() => {
    if (chartData.length === 0) return 5
    const values = chartData.map((d) => d.r)
    return Math.max(1, ...values)
  }, [chartData])

  const isPositive = totalR >= 0

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <div className="chart-title-row">
            <h2 className="chart-title">Equity Curve & Cumulative Return</h2>
            <span className="live-badge">REAL DATA</span>
          </div>
          <div className="chart-headline-stat">
            <span className={`total-r-display ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? `+${totalR.toFixed(2)}R` : `${totalR.toFixed(2)}R`}
            </span>
            <span className="peak-stat">
              Peak: <strong>+{peakR.toFixed(2)}R</strong>
            </span>
          </div>
        </div>

        <div className="chart-controls">
          <div className="chart-pill-group">
            <button className="chart-control active">R-Multiple</button>
          </div>
          <div className="chart-pill-group">
            {(['1W', '1M', '3M', 'ALL'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                className={`chart-control ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.22} />
                  <stop offset="70%" stopColor="#059669" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="equityGradientRose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.22} />
                  <stop offset="70%" stopColor="#DC2626" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />

              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />

              <YAxis
                stroke="#64748B"
                fontSize={11}
                domain={[Math.floor(minR - 1), Math.ceil(maxR + 1)]}
                tickFormatter={(val) => `${val}R`}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    const tradePos = d.tradeR >= 0
                    return (
                      <div className="custom-tooltip">
                        <div className="tooltip-header">
                          <span className="tooltip-date">{d.date}</span>
                          <span className="tooltip-trade-num">Trade #{d.tradeIndex}</span>
                        </div>
                        <div className="tooltip-body">
                          <div className="tooltip-symbol-row">
                            <span className="tooltip-symbol">{d.symbol}</span>
                            <span className={`tooltip-dir ${d.direction?.toLowerCase()}`}>
                              {d.direction}
                            </span>
                            <span className="tooltip-trade-r">
                              {tradePos ? `+${d.tradeR}R` : `${d.tradeR}R`}
                            </span>
                          </div>
                          {d.setup && <div className="tooltip-setup">{d.setup}</div>}
                          <div className="tooltip-cumulative-row">
                            <span>Cumulative:</span>
                            <strong className={d.r >= 0 ? 'positive' : 'negative'}>
                              {d.r >= 0 ? `+${d.r}R` : `${d.r}R`}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="r"
                stroke={isPositive ? '#059669' : '#DC2626'}
                strokeWidth={2.5}
                fill={isPositive ? 'url(#equityGradientEmerald)' : 'url(#equityGradientRose)'}
                dot={{ r: 3, fill: '#FFFFFF', stroke: isPositive ? '#059669' : '#DC2626', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: isPositive ? '#059669' : '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <p>No trade data recorded yet.</p>
            <span>Log trades to view your equity growth curve in R.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EquityChart
