import { NavLink } from 'react-router-dom'
import { Earth, Bot } from 'lucide-react'
import Tooltip from './Tooltip'

interface SidebarNavProps {
  isSidebarCollapsed: boolean
}

function SidebarNav({ isSidebarCollapsed }: SidebarNavProps) {
  if (isSidebarCollapsed) {
    return (
      <nav className="flex flex-col py-4 flex-1 px-3 space-y-1">
        <Tooltip text="Worlds" position="right">
          <NavLink 
            to="/worlds" 
            className={({ isActive }) => 
              `flex items-center justify-center w-full py-3 text-gray-700 dark:text-[#aaa] no-underline transition-all rounded-lg ${
                isActive 
                  ? 'bg-gray-200/70 dark:bg-[#111] text-gray-900 dark:text-white font-medium' 
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
                  ? 'bg-gray-200/70 dark:bg-[#111] text-gray-900 dark:text-white font-medium' 
                  : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
              }`
            }
          >
            <Bot size={22} className="flex-shrink-0" />
          </NavLink>
        </Tooltip>
      </nav>
    )
  }

  return (
    <nav className="flex flex-col py-4 flex-1 px-3 space-y-1">
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
    </nav>
  )
}

export default SidebarNav

