import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { normalizeSession } from '../utils'
import type { Trade, Analytics } from '../types'

interface AnalyticsViewProps {
  trades: Trade[]
  analytics: Analytics | null
}

export function AnalyticsView({ trades, analytics }: AnalyticsViewProps) {
  // Sort trades chronologically
  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime(),
    )
  }, [trades])

  // 1. Performance by Setup
  const setupPerformance = useMemo(() => {
    const groups: Record<
      string,
      { trades: number; wins: number; totalR: number; grossWinR: number; grossLossR: number }
    > = {}

    trades.forEach((t) => {
      const key = t.setup?.trim() || 'Unassigned'
      if (!groups[key]) {
        groups[key] = { trades: 0, wins: 0, totalR: 0, grossWinR: 0, grossLossR: 0 }
      }
      const r = Number(t.result_r) || 0
      groups[key].trades += 1
      groups[key].totalR += r
      if (r > 0) {
        groups[key].wins += 1
        groups[key].grossWinR += r
      } else if (r < 0) {
        groups[key].grossLossR += Math.abs(r)
      }
    })

    return Object.entries(groups)
      .map(([setup, data]) => {
        const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
        const avgR = data.trades > 0 ? data.totalR / data.trades : 0
        const profitFactor =
          data.grossLossR > 0
            ? data.grossWinR / data.grossLossR
            : data.grossWinR > 0
              ? 99
              : 0
        return {
          setup,
          trades: data.trades,
          winRate: Number(winRate.toFixed(1)),
          totalR: Number(data.totalR.toFixed(2)),
          avgR: Number(avgR.toFixed(2)),
          profitFactor: profitFactor >= 99 ? '∞' : profitFactor.toFixed(2),
        }
      })
      .sort((a, b) => b.totalR - a.totalR)
  }, [trades])

  // 2. Performance by Symbol
  const symbolPerformance = useMemo(() => {
    const groups: Record<
      string,
      { trades: number; wins: number; totalR: number; grossWinR: number; grossLossR: number }
    > = {}

    trades.forEach((t) => {
      const sym = t.symbol?.toUpperCase() || 'UNKNOWN'
      if (!groups[sym]) {
        groups[sym] = { trades: 0, wins: 0, totalR: 0, grossWinR: 0, grossLossR: 0 }
      }
      const r = Number(t.result_r) || 0
      groups[sym].trades += 1
      groups[sym].totalR += r
      if (r > 0) {
        groups[sym].wins += 1
        groups[sym].grossWinR += r
      } else if (r < 0) {
        groups[sym].grossLossR += Math.abs(r)
      }
    })

    return Object.entries(groups)
      .map(([symbol, data]) => {
        const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
        const avgR = data.trades > 0 ? data.totalR / data.trades : 0
        const pf =
          data.grossLossR > 0
            ? data.grossWinR / data.grossLossR
            : data.grossWinR > 0
              ? 99
              : 0
        return {
          symbol,
          trades: data.trades,
          winRate: Number(winRate.toFixed(1)),
          totalR: Number(data.totalR.toFixed(2)),
          avgR: Number(avgR.toFixed(2)),
          pf: pf >= 99 ? '∞' : pf.toFixed(2),
        }
      })
      .sort((a, b) => b.totalR - a.totalR)
  }, [trades])

  // 3. Performance by Session
  const sessionPerformance = useMemo(() => {
    const groups: Record<
      string,
      { trades: number; wins: number; totalR: number }
    > = {}

    trades.forEach((t) => {
      const s = normalizeSession(t.session)
      if (!groups[s]) {
        groups[s] = { trades: 0, wins: 0, totalR: 0 }
      }
      const r = Number(t.result_r) || 0
      groups[s].trades += 1
      groups[s].totalR += r
      if (r > 0) groups[s].wins += 1
    })

    return Object.entries(groups)
      .map(([session, data]) => {
        const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
        const avgR = data.trades > 0 ? data.totalR / data.trades : 0
        return {
          session,
          trades: data.trades,
          winRate: Number(winRate.toFixed(1)),
          totalR: Number(data.totalR.toFixed(2)),
          avgR: Number(avgR.toFixed(2)),
        }
      })
      .sort((a, b) => b.totalR - a.totalR)
  }, [trades])

  // 4. Long vs Short Breakdown
  const directionStats = useMemo(() => {
    const longs = trades.filter((t) => t.direction?.toLowerCase() === 'long')
    const shorts = trades.filter((t) => t.direction?.toLowerCase() === 'short')

    const calcSide = (arr: Trade[]) => {
      const count = arr.length
      const wins = arr.filter((t) => Number(t.result_r) > 0).length
      const totalR = arr.reduce((acc, t) => acc + (Number(t.result_r) || 0), 0)
      const winRate = count > 0 ? (wins / count) * 100 : 0
      const avgR = count > 0 ? totalR / count : 0
      return { count, wins, totalR, winRate, avgR }
    }

    return {
      longs: calcSide(longs),
      shorts: calcSide(shorts),
    }
  }, [trades])

  // 5. Distribution of Winners / Losers (Histogram Bins)
  const distributionData = useMemo(() => {
    const bins = [
      { label: '< -2R', count: 0, range: 'Big Loss', color: '#dc2626' },
      { label: '-2R to -1R', count: 0, range: 'Standard Loss', color: '#ef4444' },
      { label: '-1R to 0R', count: 0, range: 'Scratch / Loss', color: '#f87171' },
      { label: '0R to +1R', count: 0, range: 'Small Win', color: '#6ee7b7' },
      { label: '+1R to +2R', count: 0, range: 'Standard Win', color: '#34d399' },
      { label: '+2R to +3R', count: 0, range: 'Great Win', color: '#10b981' },
      { label: '> +3R', count: 0, range: 'Home Run', color: '#059669' },
    ]

    trades.forEach((t) => {
      const r = Number(t.result_r) || 0
      if (r < -2) bins[0].count += 1
      else if (r >= -2 && r < -1) bins[1].count += 1
      else if (r >= -1 && r < 0) bins[2].count += 1
      else if (r >= 0 && r < 1) bins[3].count += 1
      else if (r >= 1 && r < 2) bins[4].count += 1
      else if (r >= 2 && r < 3) bins[5].count += 1
      else if (r >= 3) bins[6].count += 1
    })

    return bins
  }, [trades])

  // 6. Drawdown & Streak Metrics
  const { maxDD, currentDD, peakR, totalR, maxWinStreak, maxLossStreak, stdDevR } =
    useMemo(() => {
      let cumR = 0
      let peak = 0
      let maxDrawdown = 0
      let curStreakWins = 0
      let curStreakLoss = 0
      let maxWins = 0
      let maxLoss = 0

      const rValues: number[] = []

      sortedTrades.forEach((t) => {
        const r = Number(t.result_r) || 0
        rValues.push(r)
        cumR += r
        if (cumR > peak) peak = cumR
        const dd = peak - cumR
        if (dd > maxDrawdown) maxDrawdown = dd

        if (r > 0) {
          curStreakWins += 1
          curStreakLoss = 0
          if (curStreakWins > maxWins) maxWins = curStreakWins
        } else if (r < 0) {
          curStreakLoss += 1
          curStreakWins = 0
          if (curStreakLoss > maxLoss) maxLoss = curStreakLoss
        } else {
          curStreakWins = 0
          curStreakLoss = 0
        }
      })

      const currentDrawdown = peak - cumR

      // Standard Deviation of R returns
      let stdDev = 0
      if (rValues.length > 1) {
        const mean = cumR / rValues.length
        const variance =
          rValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          (rValues.length - 1)
        stdDev = Math.sqrt(variance)
      }

      return {
        maxDD: maxDrawdown,
        currentDD: currentDrawdown,
        peakR: peak,
        totalR: cumR,
        maxWinStreak: maxWins,
        maxLossStreak: maxLoss,
        stdDevR: stdDev,
      }
    }, [sortedTrades])

  // 7. Monthly Performance Ledger
  const monthlyPerformance = useMemo(() => {
    const months: Record<
      string,
      { label: string; totalR: number; wins: number; trades: number; bestTradeR: number }
    > = {}

    trades.forEach((t) => {
      const d = new Date(t.trade_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

      if (!months[key]) {
        months[key] = { label, totalR: 0, wins: 0, trades: 0, bestTradeR: -999 }
      }

      const r = Number(t.result_r) || 0
      months[key].trades += 1
      months[key].totalR += r
      if (r > 0) months[key].wins += 1
      if (r > months[key].bestTradeR) months[key].bestTradeR = r
    })

    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => ({
        key,
        month: data.label,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        totalR: Number(data.totalR.toFixed(2)),
        bestTrade: data.bestTradeR === -999 ? 0 : Number(data.bestTradeR.toFixed(2)),
      }))
  }, [trades])

  return (
    <div className="analytics-view">
      {/* Analytics Top Executive Header */}
      <div className="analytics-header-card">
        <div>
          <div className="journal-title-row">
            <h2 className="journal-title">Quantitative Analytics & Edge Matrix</h2>
            <span className="live-badge">PROPRIETARY METRICS</span>
          </div>
          <p className="journal-subtitle">
            Systematic edge diagnostics, setup expectancy, risk profiling, and consistency distributions
          </p>
        </div>
      </div>

      {/* Row 1: Consistency & Edge Scorecards */}
      <div className="analytics-scorecard-grid">
        <div className="stat-score-card">
          <span className="score-label">PROFIT FACTOR</span>
          <span className="score-value highlight-emerald">
            {analytics?.profit_factor != null
              ? Number(analytics.profit_factor).toFixed(2)
              : '—'}
          </span>
          <span className="score-sub">
            Gross Win R / Gross Loss R ratio
          </span>
        </div>

        <div className="stat-score-card">
          <span className="score-label">TRADE EXPECTANCY</span>
          <span className="score-value">
            {analytics?.expectancy != null
              ? `${Number(analytics.expectancy) >= 0 ? '+' : ''}${Number(
                  analytics.expectancy,
                ).toFixed(2)}R`
              : '—'}
          </span>
          <span className="score-sub">Expected return per execution</span>
        </div>

        <div className="stat-score-card">
          <span className="score-label">AVERAGE WIN / LOSS</span>
          <div className="score-split-val">
            <span className="positive">
              +{Number(analytics?.average_win_r || 0).toFixed(2)}R
            </span>
            <span className="score-split-divider">/</span>
            <span className="negative">
              {Number(analytics?.average_losing_r || 0).toFixed(2)}R
            </span>
          </div>
          <span className="score-sub">Realized payoff ratio</span>
        </div>

        <div className="stat-score-card">
          <span className="score-label">MAX STREAKS</span>
          <div className="score-split-val">
            <span className="positive">{maxWinStreak}W</span>
            <span className="score-split-divider">streak ·</span>
            <span className="negative">{maxLossStreak}L</span>
          </div>
          <span className="score-sub">Discipline run endurance</span>
        </div>

        <div className="stat-score-card">
          <span className="score-label">RETURN VOLATILITY (σ)</span>
          <span className="score-value">{stdDevR.toFixed(2)}R</span>
          <span className="score-sub">Standard deviation of trade outcomes</span>
        </div>
      </div>

      {/* Row 2: Distribution of Winners & Losers + Drawdown Analysis */}
      <div className="analytics-grid-2col">
        {/* R-Multiple Distribution Histogram */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3 className="card-section-title">Distribution of Returns (R-Multiple)</h3>
              <p className="card-section-sub">Outcome density profile across all trades</p>
            </div>
          </div>

          <div className="chart-container-analytics">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={distributionData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '12px',
                    boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any, _name: any, props: any) => [
                    `${val} trades (${props.payload.range})`,
                    'Count',
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drawdown & Recovery Diagnostics */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3 className="card-section-title">Drawdown & Risk Exposure</h3>
              <p className="card-section-sub">Peak-to-trough resilience and recovery health</p>
            </div>
          </div>

          <div className="dd-metrics-container">
            <div className="dd-metric-box">
              <span className="dd-label">Max Drawdown (R)</span>
              <span className="dd-val negative">-{maxDD.toFixed(2)}R</span>
              <span className="dd-desc">Largest capital erosion from peak</span>
            </div>

            <div className="dd-metric-box">
              <span className="dd-label">Current Drawdown</span>
              <span className={`dd-val ${currentDD > 0 ? 'negative' : 'positive'}`}>
                {currentDD > 0 ? `-${currentDD.toFixed(2)}R` : 'At All-Time Peak 🏆'}
              </span>
              <span className="dd-desc">Distance from highest equity mark</span>
            </div>

            <div className="dd-metric-box">
              <span className="dd-label">Peak Equity Achieved</span>
              <span className="dd-val positive">+{peakR.toFixed(2)}R</span>
              <span className="dd-desc">Maximum high watermark</span>
            </div>

            <div className="dd-metric-box">
              <span className="dd-label">Recovery Factor</span>
              <span className="dd-val highlight-emerald">
                {maxDD > 0 ? (totalR / maxDD).toFixed(2) : totalR > 0 ? '∞' : '0.00'}
              </span>
              <span className="dd-desc">Total R generated per unit of Max DD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Long vs Short Directional Edge */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="card-section-title">Directional Edge: Long vs Short</h3>
            <p className="card-section-sub">Assessing execution balance and bias profitability</p>
          </div>
        </div>

        <div className="direction-comparison-grid">
          {/* Long Side */}
          <div className="direction-side-card long-side">
            <div className="side-header">
              <span className="direction-pill long">BUY / LONG</span>
              <span className="side-trade-count">{directionStats.longs.count} Executions</span>
            </div>
            <div className="side-stats-row">
              <div className="side-stat">
                <span className="stat-sub">Win Rate</span>
                <span className="stat-num">{directionStats.longs.winRate.toFixed(1)}%</span>
              </div>
              <div className="side-stat">
                <span className="stat-sub">Total Return</span>
                <span
                  className={`stat-num ${
                    directionStats.longs.totalR >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {directionStats.longs.totalR >= 0 ? '+' : ''}
                  {directionStats.longs.totalR.toFixed(2)}R
                </span>
              </div>
              <div className="side-stat">
                <span className="stat-sub">Avg Trade R</span>
                <span
                  className={`stat-num ${
                    directionStats.longs.avgR >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {directionStats.longs.avgR >= 0 ? '+' : ''}
                  {directionStats.longs.avgR.toFixed(2)}R
                </span>
              </div>
            </div>
          </div>

          {/* Short Side */}
          <div className="direction-side-card short-side">
            <div className="side-header">
              <span className="direction-pill short">SELL / SHORT</span>
              <span className="side-trade-count">{directionStats.shorts.count} Executions</span>
            </div>
            <div className="side-stats-row">
              <div className="side-stat">
                <span className="stat-sub">Win Rate</span>
                <span className="stat-num">{directionStats.shorts.winRate.toFixed(1)}%</span>
              </div>
              <div className="side-stat">
                <span className="stat-sub">Total Return</span>
                <span
                  className={`stat-num ${
                    directionStats.shorts.totalR >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {directionStats.shorts.totalR >= 0 ? '+' : ''}
                  {directionStats.shorts.totalR.toFixed(2)}R
                </span>
              </div>
              <div className="side-stat">
                <span className="stat-sub">Avg Trade R</span>
                <span
                  className={`stat-num ${
                    directionStats.shorts.avgR >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {directionStats.shorts.avgR >= 0 ? '+' : ''}
                  {directionStats.shorts.avgR.toFixed(2)}R
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Performance by Setup & Performance by Symbol Tables */}
      <div className="analytics-grid-2col">
        {/* By Setup */}
        <div className="table-card">
          <div className="table-header-block">
            <h3 className="card-section-title">Performance by Strategy / Setup</h3>
            <p className="table-subtitle">Identifying which playbooks yield true positive expectancy</p>
          </div>

          <div className="table-wrapper">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Setup</th>
                  <th className="num-col">Trades</th>
                  <th className="num-col">Win Rate</th>
                  <th className="num-col">Total R</th>
                  <th className="num-col">Avg R</th>
                  <th className="num-col">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {setupPerformance.map((item) => (
                  <tr key={item.setup} className="table-row">
                    <td>
                      <span className="setup-pill">{item.setup}</span>
                    </td>
                    <td className="num-cell muted-num">{item.trades}</td>
                    <td className="num-cell">{item.winRate}%</td>
                    <td
                      className={`num-cell ${
                        item.totalR > 0 ? 'positive' : item.totalR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.totalR > 0 ? `+${item.totalR}R` : `${item.totalR}R`}
                    </td>
                    <td
                      className={`num-cell ${
                        item.avgR > 0 ? 'positive' : item.avgR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.avgR > 0 ? `+${item.avgR}R` : `${item.avgR}R`}
                    </td>
                    <td className="num-cell highlight-emerald">{item.profitFactor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Symbol */}
        <div className="table-card">
          <div className="table-header-block">
            <h3 className="card-section-title">Performance by Symbol / Asset</h3>
            <p className="table-subtitle">Asset-class edge breakdown</p>
          </div>

          <div className="table-wrapper">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="num-col">Trades</th>
                  <th className="num-col">Win Rate</th>
                  <th className="num-col">Total R</th>
                  <th className="num-col">Avg R</th>
                  <th className="num-col">PF</th>
                </tr>
              </thead>
              <tbody>
                {symbolPerformance.map((item) => (
                  <tr key={item.symbol} className="table-row">
                    <td className="symbol-cell">
                      <span className="symbol-badge">{item.symbol}</span>
                    </td>
                    <td className="num-cell muted-num">{item.trades}</td>
                    <td className="num-cell">{item.winRate}%</td>
                    <td
                      className={`num-cell ${
                        item.totalR > 0 ? 'positive' : item.totalR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.totalR > 0 ? `+${item.totalR}R` : `${item.totalR}R`}
                    </td>
                    <td
                      className={`num-cell ${
                        item.avgR > 0 ? 'positive' : item.avgR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.avgR > 0 ? `+${item.avgR}R` : `${item.avgR}R`}
                    </td>
                    <td className="num-cell highlight-emerald">{item.pf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: Session Performance & Monthly Breakdown */}
      <div className="analytics-grid-2col">
        {/* By Session */}
        <div className="table-card">
          <div className="table-header-block">
            <h3 className="card-section-title">Performance by Market Session</h3>
            <p className="table-subtitle">Time-of-day execution profitability</p>
          </div>

          <div className="table-wrapper">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Market Session</th>
                  <th className="num-col">Trades</th>
                  <th className="num-col">Win Rate</th>
                  <th className="num-col">Total R</th>
                  <th className="num-col">Avg R</th>
                </tr>
              </thead>
              <tbody>
                {sessionPerformance.map((item) => (
                  <tr key={item.session} className="table-row">
                    <td>
                      <span className="session-pill">{item.session}</span>
                    </td>
                    <td className="num-cell muted-num">{item.trades}</td>
                    <td className="num-cell">{item.winRate}%</td>
                    <td
                      className={`num-cell ${
                        item.totalR > 0 ? 'positive' : item.totalR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.totalR > 0 ? `+${item.totalR}R` : `${item.totalR}R`}
                    </td>
                    <td
                      className={`num-cell ${
                        item.avgR > 0 ? 'positive' : item.avgR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.avgR > 0 ? `+${item.avgR}R` : `${item.avgR}R`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="table-card">
          <div className="table-header-block">
            <h3 className="card-section-title">Monthly Performance Ledger</h3>
            <p className="table-subtitle">Month-by-month return trajectory</p>
          </div>

          <div className="table-wrapper">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="num-col">Trades</th>
                  <th className="num-col">Win Rate</th>
                  <th className="num-col">Total R</th>
                  <th className="num-col">Best Trade</th>
                </tr>
              </thead>
              <tbody>
                {monthlyPerformance.map((item) => (
                  <tr key={item.key} className="table-row">
                    <td className="primary-date">{item.month}</td>
                    <td className="num-cell muted-num">{item.trades}</td>
                    <td className="num-cell">{item.winRate.toFixed(1)}%</td>
                    <td
                      className={`num-cell ${
                        item.totalR > 0 ? 'positive' : item.totalR < 0 ? 'negative' : ''
                      }`}
                    >
                      {item.totalR > 0 ? `+${item.totalR}R` : `${item.totalR}R`}
                    </td>
                    <td className="num-cell positive">+{item.bestTrade}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView
