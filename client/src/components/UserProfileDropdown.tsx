import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { authService } from '../services/authService'
import { Sun, Moon, Settings, LogOut, ChevronUp } from 'lucide-react'

interface UserProfileDropdownProps {
  isSidebarCollapsed: boolean
  onExpandSidebar: () => void
}

function UserProfileDropdown({ isSidebarCollapsed, onExpandSidebar }: UserProfileDropdownProps) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  if (!user) {
    return null
  }

  return (
    <div className={`relative p-4 border-t border-gray-50 dark:border-stone-950 mt-auto max-md:hidden ${isSidebarCollapsed ? 'flex justify-center' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => isSidebarCollapsed ? onExpandSidebar() : setIsDropdownOpen(!isDropdownOpen)}
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
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg shadow-lg overflow-hidden z-50">
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
          
          <div className="border-t border-gray-200 dark:border-stone-700"></div>
          
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
  )
}

export default UserProfileDropdown

