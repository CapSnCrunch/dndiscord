import { ReactNode, useState } from 'react'
import SidebarHeader from './SidebarHeader'
import SidebarNav from './SidebarNav'
import UserProfileDropdown from './UserProfileDropdown'

interface DashboardProps {
  children: ReactNode
}

function Dashboard({ children }: DashboardProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111] transition-colors">
      <aside className={`${isSidebarCollapsed ? 'w-[70px]' : 'w-[250px]'} bg-gray-50 dark:bg-[#111] border-r border-gray-50 dark:border-[#111] flex flex-col fixed h-screen left-0 top-0 max-md:w-[70px] transition-all duration-300`}>
        <SidebarHeader 
          isSidebarCollapsed={isSidebarCollapsed}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
        />
        
        <SidebarNav isSidebarCollapsed={isSidebarCollapsed} />

        <UserProfileDropdown 
          isSidebarCollapsed={isSidebarCollapsed}
          onExpandSidebar={() => setIsSidebarCollapsed(false)}
        />
      </aside>
      
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'} bg-gray-50 dark:bg-[#111] min-h-screen max-md:ml-[70px] transition-all duration-300 p-6`}>
        {children}
      </main>
    </div>
  )
}

export default Dashboard

