import { LucideIcon } from 'lucide-react'

interface ComingSoonCardProps {
  title: string
  Icon: LucideIcon
  message?: string
}

function ComingSoonCard({ 
  title, 
  Icon, 
  message = "Coming soon..." 
}: ComingSoonCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 leading-tight">
        <Icon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
        <span className="leading-tight">{title}</span>
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {message}
      </p>
    </div>
  )
}

export default ComingSoonCard

