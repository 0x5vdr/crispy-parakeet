import { normalizeSession } from '../utils'
import type { Trade } from '../types'

interface TradeDetailModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
  onEdit: (trade: Trade) => void
}

export function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onEdit,
}: TradeDetailModalProps) {
  if (!isOpen || !trade) return null

  const result = Number(trade.result_r) || 0
  const entry = Number(trade.entry_price) || 0
  const stop = Number(trade.stop_price) || 0
  const exit = Number(trade.exit_price) || 0
  const risk = Number(trade.risk_amount) || 0
  const isLong = trade.direction?.toLowerCase() === 'long'
  const dollarPnL = risk > 0 ? result * risk : null
  const isPositive = result > 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container trade-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="detail-header-left">
            <div className="detail-badge-group">
              <span className="symbol-large">{trade.symbol}</span>
              <span className={`direction-pill ${isLong ? 'long' : 'short'}`}>
                {isLong ? 'BUY' : 'SELL'} {trade.direction}
              </span>
              <span className="trade-id-tag">Trade #{trade.id}</span>
            </div>
            <p className="modal-subtitle">
              {new Date(trade.trade_date).toLocaleString(undefined, {
                dateStyle: 'full',
                timeStyle: 'medium',
              })}
            </p>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-body">
          {/* Main Outcome Banner */}
          <div
            className={`detail-outcome-banner ${
              isPositive ? 'positive' : result < 0 ? 'negative' : 'neutral'
            }`}
          >
            <div className="outcome-r">
              <span className="outcome-label">Result Multiple</span>
              <span className="outcome-val">
                {result > 0 ? `+${result.toFixed(2)}R` : `${result.toFixed(2)}R`}
              </span>
            </div>
            {dollarPnL !== null && (
              <div className="outcome-dollar">
                <span className="outcome-label">Estimated Net PnL</span>
                <span className="outcome-val">
                  {dollarPnL >= 0
                    ? `+$${dollarPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `-$${Math.abs(dollarPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="detail-section">
            <h4 className="detail-section-title">Execution Parameters</h4>
            <div className="detail-grid-4">
              <div className="detail-stat-card">
                <span className="detail-stat-label">Entry Price</span>
                <span className="detail-stat-val">
                  {entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="detail-stat-card">
                <span className="detail-stat-label">Stop Loss</span>
                <span className="detail-stat-val">
                  {stop.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="detail-stat-card">
                <span className="detail-stat-label">Exit Price</span>
                <span className="detail-stat-val">
                  {exit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="detail-stat-card">
                <span className="detail-stat-label">Risk Budget</span>
                <span className="detail-stat-val">${risk.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Setup & Session Context */}
          <div className="detail-section">
            <h4 className="detail-section-title">Context & Classification</h4>
            <div className="detail-grid-2">
              <div className="detail-stat-card">
                <span className="detail-stat-label">Setup / Strategy</span>
                <span className="detail-stat-val">
                  {trade.setup || <span className="muted-dash">Unassigned</span>}
                </span>
              </div>
              <div className="detail-stat-card">
                <span className="detail-stat-label">Market Session</span>
                <span className="detail-stat-val">
                  {trade.session ? (
                    normalizeSession(trade.session)
                  ) : (
                    <span className="muted-dash">Unassigned</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Psychological Reflection */}
          <div className="detail-section">
            <h4 className="detail-section-title">Journal Notes & Reflection</h4>
            <div className="detail-notes-box">
              {trade.notes ? (
                <p>{trade.notes}</p>
              ) : (
                <span className="no-notes-text">
                  No notes or post-trade reflections recorded for this execution.
                </span>
              )}
            </div>
          </div>

          {/* Screenshots Placeholder */}
          <div className="detail-section">
            <div className="section-title-row">
              <h4 className="detail-section-title">Chart Screenshots & Attachments</h4>
              <span className="feature-tag">Coming Soon</span>
            </div>
            <div className="screenshot-placeholder-box">
              <div className="placeholder-icon-small">📸</div>
              <p className="placeholder-primary">No chart attachments uploaded</p>
              <p className="placeholder-secondary">
                Direct chart pasting (TradingView / NinjaTrader screenshots) will be linked here in an upcoming release.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions-space">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-submit"
            onClick={() => {
              onClose()
              onEdit(trade)
            }}
          >
            Edit Trade Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default TradeDetailModal
