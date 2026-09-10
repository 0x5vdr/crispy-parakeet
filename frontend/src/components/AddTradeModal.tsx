import React, { useState } from 'react'
import type { Trade } from '../types'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onTradeAdded: (newTrade: Trade) => void
}

export function AddTradeModal({ isOpen, onClose, onTradeAdded }: AddTradeModalProps) {
  const [symbol, setSymbol] = useState('NQ')
  const [direction, setDirection] = useState('Long')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [riskAmount, setRiskAmount] = useState('500')
  const [resultR, setResultR] = useState('')
  const [setup, setSetup] = useState('Breakout Retest')
  const [session, setSession] = useState('NY AM')
  const [tradeDate, setTradeDate] = useState(
    new Date().toISOString().slice(0, 16),
  )
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Auto-calculate Result R when entry, stop, and exit prices are provided
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
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        direction,
        entry_price: parseFloat(entryPrice),
        stop_price: parseFloat(stopPrice),
        exit_price: parseFloat(exitPrice),
        risk_amount: parseFloat(riskAmount) || 0,
        result_r: parseFloat(resultR) || 0,
        setup,
        session,
        trade_date: new Date(tradeDate).toISOString(),
        notes: notes.trim() || null,
      }

      const response = await fetch('http://127.0.0.1:8000/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.detail || 'Failed to create trade')
      }

      const created: Trade = await response.json()
      onTradeAdded(created)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error submitting trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Log New Execution</h3>
            <p className="modal-subtitle">Record your real execution details</p>
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
                placeholder="e.g. NQ, ES, EURUSD, AAPL"
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
            <label>Notes & Psychological Reflection</label>
            <textarea
              rows={3}
              placeholder="Key notes, execution quality, emotional state..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging Trade...' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTradeModal
