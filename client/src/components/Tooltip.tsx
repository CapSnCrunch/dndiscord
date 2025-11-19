import { ReactNode } from 'react'

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

export default Tooltip

