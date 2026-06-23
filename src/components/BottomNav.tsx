import type { NavTab } from '../types'

interface BottomNavProps {
  activeTab: NavTab
  onTab: (tab: NavTab) => void
}

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'start', label: 'Start',      icon: 'ti-home' },
  { id: 'check', label: 'Akut-Check', icon: 'ti-activity' },
  { id: 'akte',  label: 'Tierakte',   icon: 'ti-file-description' },
]

export function BottomNav({ activeTab, onTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTab(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          aria-label={tab.label}
        >
          <i className={`ti ${tab.icon}`} aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
