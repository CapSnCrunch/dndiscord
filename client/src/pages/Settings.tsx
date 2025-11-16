import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { ChevronRight, ChevronDown } from 'lucide-react'

type SettingsSection = {
  name: string
  items: string[]
}

const settingsSections: SettingsSection[] = [
  {
    name: 'Account',
    items: ['Profile', 'Display', 'Notifications', 'Security']
  },
  {
    name: 'Household',
    items: ['General', 'Members', 'Preferences', 'Institutions', 'Categories', 'Merchants', 'Rules', 'Tags', 'Data', 'Billing', 'Gift Monarch', 'Referrals']
  }
]

function Settings() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Account', 'Household'])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="m-0 mb-8 text-[2rem] font-semibold text-gray-900 dark:text-white">
        Settings
      </h1>
      
      <div className="flex gap-6 max-lg:flex-col">
        {/* Settings Sidebar Navigation */}
        <aside className="w-[280px] max-lg:w-full">
          <nav className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] overflow-hidden">
            {settingsSections.map((section, sectionIdx) => (
              <div key={section.name}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors border-none text-left"
                >
                  {section.name}
                  {expandedSections.includes(section.name) ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
                
                {/* Section Items */}
                {expandedSections.includes(section.name) && (
                  <div className={sectionIdx < settingsSections.length - 1 ? 'border-b border-gray-200 dark:border-[#333]' : ''}>
                    {section.items.map(item => {
                      const path = `/settings/${section.name.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`
                      return (
                        <NavLink
                          key={item}
                          to={path}
                          className={({ isActive }) =>
                            `block px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-[rgba(102,126,234,0.1)] hover:text-[#667eea] dark:hover:text-white transition-colors no-underline ${
                              isActive ? 'bg-purple-50 dark:bg-[rgba(102,126,234,0.15)] text-[#667eea] dark:text-white font-medium' : ''
                            }`
                          }
                        >
                          {item}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-8 min-h-[600px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Settings

