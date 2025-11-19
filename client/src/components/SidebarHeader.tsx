import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { Bell, Settings, PanelLeft } from 'lucide-react'
import Tooltip from './Tooltip'

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean
  onCollapse: () => void
  onExpand: () => void
}

function SidebarHeader({ isSidebarCollapsed, onCollapse, onExpand }: SidebarHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  
  const isOnSettingsPage = location.pathname.startsWith('/settings')
  const isOnNotificationsPage = location.pathname.startsWith('/notifications')

  if (isSidebarCollapsed) {
    return (
      <div className="p-4 border-b border-gray-50 dark:border-stone-950 flex items-center">
        <Tooltip text="Expand" position="right">
          <button
            onClick={onExpand}
            className="p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa]"
          >
            <span className="text-[2rem]">🎲</span>
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-gray-50 dark:border-[#111] flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-[2rem]">🎲</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => console.log('Notifications clicked')}
          className={`p-2 rounded-full transition-all cursor-pointer border-none relative ${
            isOnNotificationsPage
              ? 'bg-gray-200 dark:bg-stone-700 text-gray-800 dark:text-white'
              : 'bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
          style={isOnNotificationsPage ? { 
            boxShadow: theme === 'dark' 
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)' 
              : 'inset 0 2px 4px rgba(0, 0, 0, 0.12)' 
          } : undefined}
        >
          <Bell size={20} />
          {/* Notification badge - can be conditionally shown */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>
        
        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-full transition-all cursor-pointer border-none ${
            isOnSettingsPage
              ? 'bg-gray-200 dark:bg-stone-700 text-gray-800 dark:text-white'
              : 'bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
          style={isOnSettingsPage ? { 
            boxShadow: theme === 'dark' 
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)' 
              : 'inset 0 2px 4px rgba(0, 0, 0, 0.12)' 
          } : undefined}
        >
          <Settings size={20} />
        </button>
        
        <Tooltip text="Collapse">
          <button
            onClick={onCollapse}
            className="p-2 rounded-full transition-all cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <PanelLeft size={20} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default SidebarHeader

