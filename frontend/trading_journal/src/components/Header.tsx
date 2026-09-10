interface HeaderProps {
  onAddTradeClick?: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

function Header({
  onAddTradeClick,
  activeTab = 'Dashboard',
  onTabChange,
}: HeaderProps) {
  const tabs = ['Dashboard', 'Journal', 'Analytics', 'Playbook', 'Calendar']

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span className="brand-title">TradePulse</span>
      </div>

      <nav className="nav">
        {tabs.map((tab) => (
          <a
            key={tab}
            href={`#${tab.toLowerCase()}`}
            className={activeTab === tab ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              onTabChange?.(tab)
            }}
          >
            {tab}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className="add-trade-button"
          onClick={onAddTradeClick}
        >
          <span className="plus-icon">+</span>
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  )
}

export default Header
