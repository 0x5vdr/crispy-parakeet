import logoSvg from '../assets/Untitled design.svg'
import rLogo from '../assets/R.png'

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
  const tabs = ['Dashboard', 'Journal', 'Analytics']

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo-box">
          <img src={logoSvg} alt="Rithm Icon" className="brand-logo-img" />
        </div>
        <div className="brand-title">
          <img src={rLogo} alt="R" className="brand-r-img" />
          <span className="brand-suffix">ithm</span>
        </div>
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
