import { ChevronRight, Bot as BotIcon } from 'lucide-react'
import type { Bot } from '../services/botService'

interface BotsListCardProps {
  bots: Bot[]
  isLoading: boolean
  onNavigateToBot: (botId: string) => void
  onViewAll: () => void
  onAddBot?: () => void
}

function BotsListCard({
  bots,
  isLoading,
  onNavigateToBot,
  onViewAll,
  onAddBot
}: BotsListCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-2 leading-tight"
          onClick={onViewAll}
          title="View all Bots"
        >
          <BotIcon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <span className="leading-tight">Bots</span>
        </h3>
        {onAddBot && (
          <button
            onClick={onAddBot}
            className="p-2 rounded-full transition-all cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5"
            title="Add New Bot"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="border-t border-gray-100 dark:border-stone-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 py-3 px-6 border-b border-gray-100 dark:border-stone-800">
              <div className="w-12 h-12 bg-gray-200 dark:bg-stone-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-24 mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : bots.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm px-6 pb-6">
          No bots configured yet. Visit the Bots page to create one.
        </p>
      ) : (
        <>
          <div className="border-t border-gray-100 dark:border-stone-800">
            {bots.slice(0, 3).map((bot) => (
              <div
                key={bot.id}
                onClick={() => onNavigateToBot(bot.id)}
                className="flex items-center gap-3 py-3 px-6 border-b border-gray-100 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <BotIcon size={28} className="text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {bot.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-500 dark:text-gray-500">
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
              </div>
            ))}
          </div>
          {bots.length > 3 && (
            <div 
              onClick={onViewAll}
              className="py-4 px-6 text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm cursor-pointer transition-colors"
            >
              View All Bots ({bots.length})
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BotsListCard

