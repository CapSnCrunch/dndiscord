import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { botService, type Bot } from '../services/botService'
import { worldService, type World } from '../services/worldService'
import PageHeader from '../components/PageHeader'
import { Bot as BotIcon } from 'lucide-react'

function Bots() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bots, setBots] = useState<Bot[]>([])
  const [worlds, setWorlds] = useState<World[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadBots()
      loadWorlds()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadBots = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedBots = await botService.getBots()
      setBots(fetchedBots)
    } catch (err) {
      console.error('Error loading bots:', err)
      setError('Failed to load bots. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorlds = async () => {
    try {
      const fetchedWorlds = await worldService.getWorlds()
      setWorlds(fetchedWorlds)
    } catch (err) {
      console.error('Error loading worlds:', err)
    }
  }

  const handleCreateNewClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const getWorldName = (worldId: string) => {
    const world = worlds.find(w => w.id === worldId)
    return world?.name || 'Unknown World'
  }

  return (
    <div>
      <PageHeader 
        breadcrumbs={[{ label: 'Bots' }]}
        actions={
          <button 
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all hover:from-[#5568d3] hover:to-[#6a3e8f] flex items-center gap-2 leading-none"
            onClick={handleCreateNewClick}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="leading-none">Add Bot</span>
          </button>
        }
      />
      
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444] animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-[#444] rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#444] rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#444] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadBots}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : bots.length === 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <BotIcon size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bots yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first Discord bot to bring your worlds to life!
            </p>
            <button
              onClick={handleCreateNewClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] leading-none"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="leading-none">Create Your First Bot</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors cursor-pointer group"
              onClick={() => navigate(`/bots/${bot.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {bot.name}
                </h3>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white flex-shrink-0">
                  <BotIcon size={20} />
                </div>
              </div>
              {bot.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {bot.description}
                </p>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-500">World:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {getWorldName(bot.worldId)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#444]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Updated {new Date(bot.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bot Modal - Coming Soon */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-[#2a2a2a] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Create New Bot
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bot creation coming soon! You'll be able to create Discord bots linked to your worlds and NPCs.
            </p>

            <button
              onClick={handleCloseModal}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bots

