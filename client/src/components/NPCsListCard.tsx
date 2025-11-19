import { ChevronRight, CircleUserRound } from 'lucide-react'
import type { NPC } from '../services/npcService'

interface NPCsListCardProps {
  npcs: NPC[]
  isLoading: boolean
  isCreating: boolean
  worldId: string
  onAddNpc: () => void
  onNavigateToNpc: (npcId: string) => void
  onViewAll: () => void
}

function NPCsListCard({
  npcs,
  isLoading,
  isCreating,
  worldId,
  onAddNpc,
  onNavigateToNpc,
  onViewAll
}: NPCsListCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-2 leading-tight"
          onClick={onViewAll}
          title="View all NPCs"
        >
          <CircleUserRound size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <span className="leading-tight">NPCs</span>
        </h3>
        <button
          onClick={onAddNpc}
          disabled={isCreating}
          className="p-2 rounded-full transition-all cursor-pointer border-none bg-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add New NPC"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="border-t border-gray-100 dark:border-stone-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 py-3 px-6 border-b border-gray-100 dark:border-stone-800">
              <div className="w-12 h-12 bg-gray-200 dark:bg-stone-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-24 mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : npcs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm px-6 pb-6">
          No NPCs yet. Click the + button to create one.
        </p>
      ) : (
        <>
          <div className="border-t border-gray-100 dark:border-stone-800">
            {npcs.slice(0, 3).map((npc) => (
              <div
                key={npc.id}
                onClick={() => onNavigateToNpc(npc.id)}
                className="flex items-center gap-3 py-3 px-6 border-b border-gray-100 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  npc.imageUrl ? '' : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-500 dark:text-gray-400 p-1.5'
                }`}>
                  {npc.imageUrl ? (
                    <img src={npc.imageUrl} alt={npc.name} className="w-full h-full object-cover" />
                  ) : (
                    <CircleUserRound size={44} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {npc.name}
                  </h4>
                  {npc.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                      {npc.description}
                    </p>
                  )}
                </div>
                <ChevronRight size={20} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
              </div>
            ))}
          </div>
          {npcs.length > 3 && (
            <div 
              onClick={onViewAll}
              className="py-4 px-6 text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm cursor-pointer transition-colors"
            >
              View All NPCs ({npcs.length})
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NPCsListCard

