import { useState, useMemo } from 'react'
import type { Trade } from '../types'

interface TradeTableProps {
  trades: Trade[]
  onTradeSelect?: (trade: Trade) => void
  onEditTrade?: (trade: Trade) => void
}

function TradeTable({ trades, onTradeSelect, onEditTrade }: TradeTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [sessionFilter, setSessionFilter] = useState<string>('ALL')

  const availableSessions = useMemo(() => {
    const sessions = new Set<string>()
    trades.forEach((t) => {
      if (t.session) sessions.add(t.session)
    })
    return Array.from(sessions)
  }, [trades])

  const filteredTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime())
      .filter((trade) => {
        if (
          directionFilter !== 'ALL' &&
          trade.direction.toUpperCase() !== directionFilter
        ) {
          return false
        }
        if (sessionFilter !== 'ALL' && trade.session !== sessionFilter) {
          return false
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          const matchSymbol = trade.symbol.toLowerCase().includes(q)
          const matchSetup = trade.setup?.toLowerCase().includes(q)
          const matchSession = trade.session?.toLowerCase().includes(q)
          const matchNotes = trade.notes?.toLowerCase().includes(q)
          if (!matchSymbol && !matchSetup && !matchSession && !matchNotes) {
            return false
          }
        }
        return true
      })
  }, [trades, directionFilter, sessionFilter, searchTerm])

  return (
    <div className="table-card">
      <div className="table-header-block">
        <div className="section-header">
          <div>
            <div className="table-title-row">
              <h2 className="table-title">Recent Trades & Execution Log</h2>
              <span className="count-badge">{trades.length} Total</span>
            </div>
            <p className="table-subtitle">Your latest logged trades from database</p>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg
              className="search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search symbol, setup, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-group">
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as any)}
              className="table-filter-select"
            >
              <option value="ALL">All Directions</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>

            {availableSessions.length > 0 && (
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="table-filter-select"
              >
                <option value="ALL">All Sessions</option>
                {availableSessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {(directionFilter !== 'ALL' || sessionFilter !== 'ALL' || searchTerm) && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setDirectionFilter('ALL')
                  setSessionFilter('ALL')
                  setSearchTerm('')
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="trades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Direction</th>
              <th>Setup</th>
              <th>Session</th>
              <th className="num-col">Entry</th>
              <th className="num-col">Stop</th>
              <th className="num-col">Exit</th>
              <th className="num-col">Risk ($)</th>
              <th className="num-col">Result</th>
              <th className="action-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTrades.map((trade) => {
              const result = Number(trade.result_r)
              const entry = Number(trade.entry_price)
              const stop = Number(trade.stop_price)
              const exit = Number(trade.exit_price)
              const risk = Number(trade.risk_amount)
              const isLong = trade.direction.toLowerCase() === 'long'

              return (
                <tr
                  key={trade.id}
                  className="table-row"
                  onClick={() => {
                    if (onEditTrade) {
                      onEditTrade(trade)
                    } else if (onTradeSelect) {
                      onTradeSelect(trade)
                    }
                  }}
                >
                  <td className="date-cell">
                    <span className="primary-date">
                      {new Date(trade.trade_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="sub-time">
                      {new Date(trade.trade_date).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  <td className="symbol-cell">
                    <span className="symbol-badge">{trade.symbol}</span>
                  </td>

                  <td>
                    <span className={`direction-pill ${isLong ? 'long' : 'short'}`}>
                      {isLong ? 'BUY' : 'SELL'} {trade.direction}
                    </span>
                  </td>

                  <td>
                    {trade.setup ? (
                      <span className="setup-pill">{trade.setup}</span>
                    ) : (
                      <span className="muted-dash">—</span>
                    )}
                  </td>

                  <td>
                    {trade.session ? (
                      <span className="session-pill">{trade.session}</span>
                    ) : (
                      <span className="muted-dash">—</span>
                    )}
                  </td>

                  <td className="num-cell">
                    {isNaN(entry) ? '—' : entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="num-cell muted-num">
                    {isNaN(stop) ? '—' : stop.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="num-cell">
                    {isNaN(exit) ? '—' : exit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="num-cell muted-num">
                    {isNaN(risk) ? '—' : `$${risk.toLocaleString()}`}
                  </td>

                  <td className="num-cell result-cell">
                    <span
                      className={`result-tag ${
                        result > 0 ? 'positive' : result < 0 ? 'negative' : 'neutral'
                      }`}
                    >
                      {result > 0 ? `+${result.toFixed(2)}R` : `${result.toFixed(2)}R`}
                    </span>
                  </td>

                  <td className="action-col">
                    <div className="action-btn-group">
                      {trade.notes && (
                        <span className="notes-indicator" title={trade.notes}>
                          📝
                        </span>
                      )}
                      <button
                        className="row-edit-btn"
                        title={`Update Trade #${trade.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditTrade?.(trade)
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Update</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredTrades.length === 0 && (
          <div className="empty-table-state">
            <p>No matching trades found</p>
            <span>{trades.length === 0 ? 'No trades have been added yet.' : 'Try adjusting your search or filters.'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradeTable
