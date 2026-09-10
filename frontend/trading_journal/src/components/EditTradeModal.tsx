import React, { useState, useEffect } from 'react'
import type { Trade } from '../types'
import { updateTrade, deleteTrade } from '../api'

interface EditTradeModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
  onTradeUpdated: (updatedTrade: Trade) => void
  onTradeDeleted?: (deletedTradeId: number) => void
}

export function EditTradeModal({
  trade,
  isOpen,
  onClose,
  onTradeUpdated,
  onTradeDeleted,
}: EditTradeModalProps) {
  const [symbol, setSymbol] = useState('')
  const [direction, setDirection] = useState('Long')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [riskAmount, setRiskAmount] = useState('')
  const [resultR, setResultR] = useState('')
  const [setup, setSetup] = useState('')
  const [session, setSession] = useState('NY AM')
  const [tradeDate, setTradeDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (trade) {
      setSymbol(trade.symbol || '')
      setDirection(trade.direction || 'Long')
      setEntryPrice(trade.entry_price != null ? String(trade.entry_price) : '')
      setStopPrice(trade.stop_price != null ? String(trade.stop_price) : '')
      setExitPrice(trade.exit_price != null ? String(trade.exit_price) : '')
      setRiskAmount(trade.risk_amount != null ? String(trade.risk_amount) : '')
      setResultR(trade.result_r != null ? String(trade.result_r) : '')
      setSetup(trade.setup || '')
      setSession(trade.session || 'NY AM')
      if (trade.trade_date) {
        try {
          const dateObj = new Date(trade.trade_date)
          // Format to YYYY-MM-DDTHH:MM for datetime-local
          const iso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
          setTradeDate(iso)
        } catch {
          setTradeDate('')
        }
      }
      setNotes(trade.notes || '')
      setError(null)
    }
  }, [trade])

  if (!isOpen || !trade) return null

  const handleAutoCalcR = (entry: number, stop: number, exit: number, dir: string) => {
    if (!entry || !stop || !exit) return
    const risk = dir === 'Long' ? entry - stop : stop - entry
    if (risk === 0) return
    const reward = dir === 'Long' ? exit - entry : entry - exit
    const calcR = reward / risk
    setResultR(calcR.toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trade) return
    setError(null)
    setIsSubmitting(true)

    try {
      const payload: Partial<Omit<Trade, 'id'>> = {
        symbol: symbol.toUpperCase(),
        direction,
        entry_price: parseFloat(entryPrice),
        stop_price: parseFloat(stopPrice),
        exit_price: parseFloat(exitPrice),
        risk_amount: parseFloat(riskAmount) || 0,
        result_r: parseFloat(resultR) || 0,
        setup: setup.trim(),
        session,
        trade_date: new Date(tradeDate).toISOString(),
        notes: notes.trim() || null,
      }

      const updated = await updateTrade(trade.id, payload)
      onTradeUpdated(updated)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error updating trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!trade) return
    if (!window.confirm(`Are you sure you want to delete Trade #${trade.id} (${trade.symbol})?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTrade(trade.id)
      onTradeDeleted?.(trade.id)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error deleting trade')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title-row">
              <h3 className="modal-title">Edit Trade #{trade.id}</h3>
              <span className="badge-trade-id">{trade.symbol}</span>
            </div>
            <p className="modal-subtitle">Update execution parameters or notes</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Symbol / Ticker</label>
              <input
                type="text"
                required
                value={symbol}
                placeholder="e.g. NQ, ES, EURUSD"
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Direction</label>
              <select
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value)
                  handleAutoCalcR(
                    parseFloat(entryPrice),
                    parseFloat(stopPrice),
                    parseFloat(exitPrice),
                    e.target.value,
                  )
                }}
              >
                <option value="Long">Long (Buy)</option>
                <option value="Short">Short (Sell)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Entry Price</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => {
                  setEntryPrice(e.target.value)
                  handleAutoCalcR(
                    parseFloat(e.target.value),
                    parseFloat(stopPrice),
                    parseFloat(exitPrice),
                    direction,
                  )
                }}
              />
            </div>

            <div className="form-group">
              <label>Stop Loss Price</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => {
                  setStopPrice(e.target.value)
                  handleAutoCalcR(
                    parseFloat(entryPrice),
                    parseFloat(e.target.value),
                    parseFloat(exitPrice),
                    direction,
                  )
                }}
              />
            </div>

            <div className="form-group">
              <label>Exit Price</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => {
                  setExitPrice(e.target.value)
                  handleAutoCalcR(
                    parseFloat(entryPrice),
                    parseFloat(stopPrice),
                    parseFloat(e.target.value),
                    direction,
                  )
                }}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Risk Amount ($)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="500"
                value={riskAmount}
                onChange={(e) => setRiskAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Result in R (Multiple)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 2.5 or -1.0"
                value={resultR}
                onChange={(e) => setResultR(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Setup / Playbook</label>
              <input
                type="text"
                placeholder="e.g. Breakout Retest, Liquidity Sweep"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Market Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option value="NY AM">NY AM (09:30 - 12:00)</option>
                <option value="NY PM">NY PM (13:30 - 16:00)</option>
                <option value="London Open">London Open</option>
                <option value="Asia">Asia Session</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              required
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Notes & Post-Trade Review</label>
            <textarea
              rows={3}
              placeholder="Key lessons, discipline score, execution notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions-space">
            <button
              type="button"
              className="btn-delete"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Trade'}
            </button>

            <div className="modal-actions-right">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? 'Saving...' : 'Update Trade'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTradeModal
