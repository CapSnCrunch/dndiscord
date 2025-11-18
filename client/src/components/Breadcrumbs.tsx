import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-3 mb-8">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={index} className="flex items-center gap-3">
            {index > 0 && (
              <ChevronRight 
                size={20} 
                className="text-gray-400 dark:text-gray-600 flex-shrink-0" 
              />
            )}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-lg font-medium no-underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white text-lg font-semibold">
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs

