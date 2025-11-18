import { ReactNode } from 'react'
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs'

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
}

function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <Breadcrumbs items={breadcrumbs} />
      {actions && <div className="flex items-start gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader

