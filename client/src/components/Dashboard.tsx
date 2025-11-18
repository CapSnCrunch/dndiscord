import { ReactNode, useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { authService } from '../services/authService'
import { 
  Earth,
  Bot,
  Sun,
  Moon,
  Settings,
  LogOut,
  ChevronUp,
  Bell,
  PanelLeft
} from 'lucide-react'

interface DashboardProps {
  children: ReactNode
}

interface TooltipProps {
  text: string
  children: ReactNode
  position?: 'bottom' | 'right'
}

function Tooltip({ text, children, position = 'bottom' }: TooltipProps) {
  if (position === 'right') {
    return (
      <div className="relative group">
        {children}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-black text-white text-xs font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
          {text}
          <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-black"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black text-white text-xs font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
        {text}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-black"></div>
      </div>
    </div>
  )
}

function Dashboard({ children }: DashboardProps) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Check if we're on specific pages
  const isOnSettingsPage = location.pathname.startsWith('/settings')
  const isOnNotificationsPage = location.pathname.startsWith('/notifications')

  // Get user's name from email (everything before @)
  const userName = user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await authService.logout()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  const handleToggleTheme = () => {
    toggleTheme()
    setIsDropdownOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <aside className={`${isSidebarCollapsed ? 'w-[70px]' : 'w-[250px]'} bg-gray-50 dark:bg-[#0f0f0f] border-r border-gray-50 dark:border-[#0f0f0f] flex flex-col fixed h-screen left-0 top-0 max-md:w-[70px] transition-all duration-300`}>
        {!isSidebarCollapsed ? (
          <div className="p-4 border-b border-gray-50 dark:border-[#0f0f0f] flex items-center justify-between">
            <div className="flex items-center pl-2">
              <span className="text-[2rem]">🎲</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => console.log('Notifications clicked')}
                className={`p-2 rounded-full transition-all cursor-pointer border-none relative ${
                  isOnNotificationsPage
                    ? 'bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-white'
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
                    ? 'bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-white'
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
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-2 rounded-full transition-all cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <PanelLeft size={20} />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-50 dark:border-[#0f0f0f] flex items-center">
            <Tooltip text="Expand" position="right">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa] ml-[2px]"
              >
                <span className="text-[2rem]">🎲</span>
              </button>
            </Tooltip>
          </div>
        )}
        
        <nav className="flex flex-col py-4 flex-1 px-3 space-y-1">
          {isSidebarCollapsed ? (
            <>
              <Tooltip text="Worlds" position="right">
                <NavLink 
                  to="/worlds" 
                  className={({ isActive }) => 
                    `flex items-center justify-center w-full py-3 text-gray-700 dark:text-[#aaa] no-underline transition-all rounded-lg ${
                      isActive 
                        ? 'bg-gray-200/70 dark:bg-[#333] text-gray-900 dark:text-white font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                    }`
                  }
                >
                  <Earth size={22} className="flex-shrink-0" />
                </NavLink>
              </Tooltip>
              <Tooltip text="Bots" position="right">
                <NavLink 
                  to="/bots" 
                  className={({ isActive }) => 
                    `flex items-center justify-center w-full py-3 text-gray-700 dark:text-[#aaa] no-underline transition-all rounded-lg ${
                      isActive 
                        ? 'bg-gray-200/70 dark:bg-[#333] text-gray-900 dark:text-white font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                    }`
                  }
                >
                  <Bot size={22} className="flex-shrink-0" />
                </NavLink>
              </Tooltip>
            </>
          ) : (
            <>
              <NavLink 
                to="/worlds" 
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-[#aaa] no-underline transition-all rounded-lg leading-none ${
                    isActive 
                      ? 'bg-gray-200/70 dark:bg-[#333] text-gray-900 dark:text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                  }`
                }
              >
                <Earth size={22} className="flex-shrink-0" />
                <span className="max-md:hidden leading-none">Worlds</span>
              </NavLink>
              <NavLink 
                to="/bots" 
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-[#aaa] no-underline transition-all rounded-lg leading-none ${
                    isActive 
                      ? 'bg-gray-200/70 dark:bg-[#333] text-gray-900 dark:text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                  }`
                }
              >
                <Bot size={22} className="flex-shrink-0" />
                <span className="max-md:hidden leading-none">Bots</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Profile Section with Dropdown */}
        {user && (
          <div className={`relative p-4 border-t border-gray-50 dark:border-[#0f0f0f] mt-auto max-md:hidden ${isSidebarCollapsed ? 'flex justify-center' : ''}`} ref={dropdownRef}>
            <button
              onClick={() => isSidebarCollapsed ? setIsSidebarCollapsed(false) : setIsDropdownOpen(!isDropdownOpen)}
              className={`${isSidebarCollapsed ? 'w-auto' : 'w-full'} flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent`}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Account menu'}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {userInitial}
              </div>
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-gray-900 dark:text-white font-medium truncate">{userName}</div>
                    <div className="text-xs text-gray-500 dark:text-[#aaa] truncate">{user.email}</div>
                  </div>
                  <ChevronUp className={`w-5 h-5 text-gray-500 dark:text-[#aaa] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !isSidebarCollapsed && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#444] rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleToggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent text-left leading-none"
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="flex-shrink-0" />
                  ) : (
                    <Moon size={20} className="flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium leading-none">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/settings')
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent text-left leading-none"
                >
                  <Settings size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium leading-none">Settings</span>
                </button>
                
                <div className="border-t border-gray-200 dark:border-[#444]"></div>
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent text-left disabled:opacity-60 disabled:cursor-not-allowed leading-none"
                >
                  <LogOut size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium leading-none">
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
      
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'} bg-gray-50 dark:bg-[#0f0f0f] min-h-screen max-md:ml-[70px] transition-all duration-300 p-6`}>
        {children}
      </main>
    </div>
  )
}

export default Dashboard

