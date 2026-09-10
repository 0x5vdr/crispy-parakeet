interface MetricCardProps {
  label: string
  value: string
  description?: string
  badge?: string
  positive?: boolean
  subValue?: string
}

function MetricCard({
  label,
  value,
  description,
  badge,
  positive,
  subValue,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <span className="metric-info-icon" title={label}>ⓘ</span>
      </div>

      <div className="metric-main">
        <div
          className={`metric-value ${
            positive === true
              ? 'positive'
              : positive === false
                ? 'negative'
                : ''
          }`}
        >
          {value}
        </div>
        {badge && (
          <span
            className={`metric-badge ${
              positive === true
                ? 'positive'
                : positive === false
                  ? 'negative'
                  : 'neutral'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {(description || subValue) && (
        <div className="metric-footer">
          {description && <span className="metric-description">{description}</span>}
          {subValue && <span className="metric-subvalue">{subValue}</span>}
        </div>
      )}
    </div>
  )
}

export default MetricCard
