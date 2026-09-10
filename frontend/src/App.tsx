import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import EquityChart from './components/EquityChart'
import TradeTable from './components/TradeTable'
import AddTradeModal from './components/AddTradeModal'
import EditTradeModal from './components/EditTradeModal'
import { getTrades, getAnalytics } from './api'
import type { Trade, Analytics } from './types'
import './App.css'

export function App() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [tradesData, analyticsData] = await Promise.all([
        getTrades(),
        getAnalytics(),
      ])
      setTrades(tradesData)
      setAnalytics(analyticsData)
      setLastRefreshed(new Date())
    } catch (err: any) {
      console.error('Error fetching trading data:', err)
      setError(
        err.message ||
          'Failed to connect to FastAPI backend. Ensure backend is running at http://127.0.0.1:8000',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate live Total R directly from fetched trades
  const totalR = useMemo(() => {
    return trades.reduce((acc, trade) => acc + (Number(trade.result_r) || 0), 0)
  }, [trades])

  const winCount = useMemo(() => {
    return trades.filter((t) => Number(t.result_r) > 0).length
  }, [trades])

  const lossCount = useMemo(() => {
    return trades.filter((t) => Number(t.result_r) < 0).length
  }, [trades])

  const handleTradeAdded = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev])
    // Refresh analytics from backend
    getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
  }

  const handleTradeUpdated = (updatedTrade: Trade) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)),
    )
    // Refresh analytics
    getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
  }

  const handleTradeDeleted = (deletedTradeId: number) => {
    setTrades((prev) => prev.filter((t) => t.id !== deletedTradeId))
    // Refresh analytics
    getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
  }

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTradeClick={() => setIsAddModalOpen(true)}
      />

      <main className="main-content">
        {/* Sub-header status bar */}
        <div className="status-bar">
          <div className="status-left">
            <span className="account-badge">
              <span className="status-indicator"></span>
              Live Database Connected
            </span>
            <span className="account-details">
              Total Trades: <strong>{trades.length}</strong>
            </span>
          </div>

          <div className="status-right">
            <span className="last-synced">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              className="refresh-btn"
              onClick={loadData}
              disabled={loading}
              title="Refresh real data from FastAPI"
            >
              <svg
                className={loading ? 'spin' : ''}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <div className="error-content">
              <strong>Connection Warning:</strong> {error}
            </div>
            <button className="retry-btn" onClick={loadData}>
              Retry Connection
            </button>
          </div>
        )}

        {activeTab === 'Dashboard' && (
          <div className="dashboard-view">
            {/* 5 Key Metric Cards */}
            <div className="metrics-grid">
              <MetricCard
                label="TOTAL R PERFORMANCE"
                value={`${totalR >= 0 ? '+' : ''}${totalR.toFixed(2)}R`}
                description={trades.length > 0 ? `Calculated across ${trades.length} logged trades` : 'No trades logged'}
                positive={totalR >= 0}
                badge={trades.length > 0 ? (totalR >= 0 ? 'Profitable' : 'Drawdown') : undefined}
              />

              <MetricCard
                label="WIN RATE"
                value={
                  analytics?.win_rate != null
                    ? `${Number(analytics.win_rate).toFixed(1)}%`
                    : '—'
                }
                description={`${winCount}W · ${lossCount}L (${trades.length} Total)`}
                positive={analytics ? Number(analytics.win_rate) >= 50 : undefined}
              />

              <MetricCard
                label="EXPECTANCY"
                value={
                  analytics?.expectancy != null
                    ? `${Number(analytics.expectancy) >= 0 ? '+' : ''}${Number(
                        analytics.expectancy,
                      ).toFixed(2)}R`
                    : '—'
                }
                description={`Win: +${Number(analytics?.average_win_r || 0).toFixed(2)}R | Loss: ${Number(analytics?.average_losing_r || 0).toFixed(2)}R`}
                positive={analytics ? Number(analytics.expectancy) >= 0 : undefined}
                subValue="/ trade"
              />

              <MetricCard
                label="PROFIT FACTOR"
                value={
                  analytics?.profit_factor != null
                    ? Number(analytics.profit_factor).toFixed(2)
                    : '—'
                }
                description={
                  analytics?.profit_factor != null && Number(analytics.profit_factor) >= 2
                    ? 'Optimal Risk/Reward'
                    : 'Gross Win / Loss ratio'
                }
                positive={
                  analytics?.profit_factor != null
                    ? Number(analytics.profit_factor) >= 1.5
                    : undefined
                }
                badge={
                  analytics?.profit_factor != null && Number(analytics.profit_factor) >= 2
                    ? 'Elite Edge'
                    : undefined
                }
              />

              <MetricCard
                label="MAX DRAWDOWN"
                value={
                  analytics?.max_drawdown != null
                    ? `-${Math.abs(Number(analytics.max_drawdown)).toFixed(2)}R`
                    : '—'
                }
                description="Peak-to-trough risk exposure"
                positive={
                  analytics?.max_drawdown != null
                    ? Math.abs(Number(analytics.max_drawdown)) < 3
                    : undefined
                }
              />
            </div>

            {/* Equity Curve Area Chart */}
            <div className="section-block">
              <EquityChart trades={trades} />
            </div>

            {/* Real Trades Execution Log Table */}
            <div className="section-block">
              <TradeTable
                trades={trades}
                onEditTrade={(trade) => setEditingTrade(trade)}
              />
            </div>
          </div>
        )}

        {/* Tab placeholders leaving room for Journal, Analytics, Playbook, Calendar */}
        {activeTab !== 'Dashboard' && (
          <div className="placeholder-tab-card">
            <div className="placeholder-icon">📊</div>
            <h2>{activeTab} Module</h2>
            <p>
              This section is reserved for future expansion ({activeTab} deep-dive view).
              Switch back to <strong>Dashboard</strong> to view your live execution stream and cumulative equity curve.
            </p>
            <button
              className="back-dashboard-btn"
              onClick={() => setActiveTab('Dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTradeAdded={handleTradeAdded}
      />

      {/* Edit / Update Trade Modal */}
      <EditTradeModal
        trade={editingTrade}
        isOpen={!!editingTrade}
        onClose={() => setEditingTrade(null)}
        onTradeUpdated={handleTradeUpdated}
        onTradeDeleted={handleTradeDeleted}
      />
    </div>
  )
}

export default App
