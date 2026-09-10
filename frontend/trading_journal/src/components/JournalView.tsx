import { useState, useMemo } from 'react'
import { normalizeSession } from '../utils'
import type { Trade } from '../types'

interface JournalViewProps {
  trades: Trade[]
  onEditTrade: (trade: Trade) => void
  onInspectTrade: (trade: Trade) => void
  onAddTradeClick: () => void
}

type OutcomeFilter = 'ALL' | 'WIN' | 'LOSS' | 'BE'
type SortField = 'date_desc' | 'date_asc' | 'r_desc' | 'r_asc' | 'risk_desc'

export function JournalView({
  trades,
  onEditTrade,
  onInspectTrade,
  onAddTradeClick,
}: JournalViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('ALL')
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL')
  const [setupFilter, setSetupFilter] = useState<string>('ALL')
  const [sessionFilter, setSessionFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<SortField>('date_desc')

  // Dynamic filter options extracted from actual trades
  const symbols = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.symbol).filter(Boolean))).sort()
  }, [trades])

  const setups = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.setup).filter(Boolean))).sort()
  }, [trades])

  const sessions = useMemo(() => {
    return Array.from(
      new Set(trades.map((t) => normalizeSession(t.session)).filter(Boolean)),
    ).sort()
  }, [trades])

  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        const r = Number(trade.result_r) || 0

        // Outcome filter
        if (outcomeFilter === 'WIN' && r <= 0) return false
        if (outcomeFilter === 'LOSS' && r >= 0) return false
        if (outcomeFilter === 'BE' && r !== 0) return false

        // Direction filter
        if (
          directionFilter !== 'ALL' &&
          trade.direction.toUpperCase() !== directionFilter
        ) {
          return false
        }

        // Symbol filter
        if (symbolFilter !== 'ALL' && trade.symbol !== symbolFilter) {
          return false
        }

        // Setup filter
        if (setupFilter !== 'ALL' && trade.setup !== setupFilter) {
          return false
        }

        // Session filter
        if (sessionFilter !== 'ALL' && normalizeSession(trade.session) !== sessionFilter) {
          return false
        }

        // Full text search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          const matchSym = trade.symbol.toLowerCase().includes(q)
          const matchSet = trade.setup?.toLowerCase().includes(q)
          const matchSes = trade.session?.toLowerCase().includes(q)
          const matchNote = trade.notes?.toLowerCase().includes(q)
          if (!matchSym && !matchSet && !matchSes && !matchNote) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortField === 'date_desc') {
          return new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
        }
        if (sortField === 'date_asc') {
          return new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
        }
        if (sortField === 'r_desc') {
          return (Number(b.result_r) || 0) - (Number(a.result_r) || 0)
        }
        if (sortField === 'r_asc') {
          return (Number(a.result_r) || 0) - (Number(b.result_r) || 0)
        }
        if (sortField === 'risk_desc') {
          return (Number(b.risk_amount) || 0) - (Number(a.risk_amount) || 0)
        }
        return 0
      })
  }, [
    trades,
    outcomeFilter,
    directionFilter,
    symbolFilter,
    setupFilter,
    sessionFilter,
    searchTerm,
    sortField,
  ])

  // Filtered summary calculations
  const totalR = useMemo(() => {
    return filteredTrades.reduce((acc, t) => acc + (Number(t.result_r) || 0), 0)
  }, [filteredTrades])

  const winCount = useMemo(() => {
    return filteredTrades.filter((t) => Number(t.result_r) > 0).length
  }, [filteredTrades])

  const winRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length) * 100 : 0
  const avgR = filteredTrades.length > 0 ? totalR / filteredTrades.length : 0

  const hasActiveFilters =
    outcomeFilter !== 'ALL' ||
    directionFilter !== 'ALL' ||
    symbolFilter !== 'ALL' ||
    setupFilter !== 'ALL' ||
    sessionFilter !== 'ALL' ||
    searchTerm.trim().length > 0

  const handleResetFilters = () => {
    setOutcomeFilter('ALL')
    setDirectionFilter('ALL')
    setSymbolFilter('ALL')
    setSetupFilter('ALL')
    setSessionFilter('ALL')
    setSearchTerm('')
    setSortField('date_desc')
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTrades.length === 0) return
    const headers = [
      'ID',
      'Date',
      'Symbol',
      'Direction',
      'Setup',
      'Session',
      'Entry Price',
      'Stop Price',
      'Exit Price',
      'Risk ($)',
      'Result (R)',
      'Notes',
    ]

    const rows = filteredTrades.map((t) => [
      t.id,
      `"${new Date(t.trade_date).toISOString()}"`,
      `"${t.symbol}"`,
      `"${t.direction}"`,
      `"${t.setup || ''}"`,
      `"${t.session || ''}"`,
      t.entry_price,
      t.stop_price,
      t.exit_price,
      t.risk_amount,
      t.result_r,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `rithm_trades_export_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="journal-view">
      {/* Journal Header Bar */}
      <div className="journal-header-card">
        <div className="journal-title-section">
          <div className="journal-title-row">
            <h2 className="journal-title">Trade Journal Database</h2>
            <span className="count-badge">{trades.length} Total Executions</span>
          </div>
          <p className="journal-subtitle">
            Comprehensive ledger with in-depth search, metrics filter, and execution notes
          </p>
        </div>

        <div className="journal-header-actions">
          <button className="export-csv-btn" onClick={handleExportCSV} title="Export filtered records as CSV">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button className="add-trade-button" onClick={onAddTradeClick}>
            <span className="plus-icon">+</span>
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* Filter Stats Mini Ribbon */}
      <div className="journal-stats-ribbon">
        <div className="stat-pill-item">
          <span className="stat-pill-label">Filtered Results</span>
          <span className="stat-pill-value">
            {filteredTrades.length} of {trades.length}
          </span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-pill-label">Segment Total R</span>
          <span className={`stat-pill-value ${totalR >= 0 ? 'positive' : 'negative'}`}>
            {totalR >= 0 ? `+${totalR.toFixed(2)}R` : `${totalR.toFixed(2)}R`}
          </span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-pill-label">Win Rate</span>
          <span className="stat-pill-value">{winRate.toFixed(1)}%</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-pill-label">Avg Expectancy</span>
          <span className={`stat-pill-value ${avgR >= 0 ? 'positive' : 'negative'}`}>
            {avgR >= 0 ? `+${avgR.toFixed(2)}R` : `${avgR.toFixed(2)}R`}
          </span>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="journal-filter-panel">
        <div className="search-box-large">
          <svg
            className="search-icon"
            width="16"
            height="16"
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
            placeholder="Search symbol, setup, market session, psychological notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <label>Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">Winners (+R)</option>
              <option value="LOSS">Losses (-R)</option>
              <option value="BE">Break-even (0R)</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Direction</label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as any)}
            >
              <option value="ALL">All Directions</option>
              <option value="LONG">Long (Buy)</option>
              <option value="SHORT">Short (Sell)</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Symbol</label>
            <select
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
            >
              <option value="ALL">All Symbols</option>
              {symbols.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Setup</label>
            <select
              value={setupFilter}
              onChange={(e) => setSetupFilter(e.target.value)}
            >
              <option value="ALL">All Setups</option>
              {setups.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
            >
              <option value="ALL">All Sessions</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Sort By</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="r_desc">Result (Highest R)</option>
              <option value="r_asc">Result (Lowest R)</option>
              <option value="risk_desc">Risk Amount ($)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="reset-filters-btn-journal" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Database */}
      <div className="table-card journal-table-card">
        <div className="table-wrapper">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Symbol</th>
                <th>Direction</th>
                <th>Setup</th>
                <th>Session</th>
                <th className="num-col">Entry</th>
                <th className="num-col">Stop</th>
                <th className="num-col">Exit</th>
                <th className="num-col">Risk ($)</th>
                <th className="num-col">Result</th>
                <th>Notes Preview</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrades.map((trade) => {
                const result = Number(trade.result_r) || 0
                const entry = Number(trade.entry_price)
                const stop = Number(trade.stop_price)
                const exit = Number(trade.exit_price)
                const risk = Number(trade.risk_amount)
                const isLong = trade.direction?.toLowerCase() === 'long'

                return (
                  <tr
                    key={trade.id}
                    className="table-row cursor-pointer"
                    onClick={() => onInspectTrade(trade)}
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
                        <span className="session-pill">{normalizeSession(trade.session)}</span>
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

                    <td className="notes-preview-cell">
                      {trade.notes ? (
                        <span className="notes-snippet" title={trade.notes}>
                          {trade.notes.length > 35
                            ? `${trade.notes.slice(0, 35)}...`
                            : trade.notes}
                        </span>
                      ) : (
                        <span className="muted-dash">—</span>
                      )}
                    </td>

                    <td className="action-col">
                      <div className="action-btn-group">
                        <button
                          className="row-inspect-btn"
                          title="Inspect Trade Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            onInspectTrade(trade)
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Details</span>
                        </button>

                        <button
                          className="row-edit-btn"
                          title="Update Trade"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTrade(trade)
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
                          <span>Edit</span>
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
              <p>No matching trades found in database</p>
              <span>{trades.length === 0 ? 'No trades have been added yet.' : 'Try adjusting your search criteria or filter tags.'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JournalView
