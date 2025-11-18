import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { botService, type Bot } from '../services/botService'
import { worldService, type World } from '../services/worldService'
import PageHeader from '../components/PageHeader'
import { Bot as BotIcon, Power, PowerOff, Trash2 } from 'lucide-react'

function BotDetail() {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()
  const [bot, setBot] = useState<Bot | null>(null)
  const [world, setWorld] = useState<World | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (botId) {
      loadBot(botId)
    }
  }, [botId])

  const loadBot = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedBot = await botService.getBot(id)
      setBot(fetchedBot)
      
      // Load the associated world
      if (fetchedBot.worldId) {
        const fetchedWorld = await worldService.getWorld(fetchedBot.worldId)
        setWorld(fetchedWorld)
      }
    } catch (err) {
      console.error('Error loading bot:', err)
      setError('Failed to load bot. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!bot || !confirm(`Are you sure you want to delete "${bot.name}"?`)) return
    
    try {
      setIsDeleting(true)
      await botService.deleteBot(bot.id)
      navigate('/bots')
    } catch (err) {
      console.error('Error deleting bot:', err)
      alert('Failed to delete bot. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-[#444] rounded w-48 mb-6"></div>
          <div className="h-8 bg-gray-200 dark:bg-[#444] rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#444] rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#444] rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || !bot) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: 'Bots', path: '/bots' },
            { label: 'Error' }
          ]}
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Bot not found'}</p>
          <button
            onClick={() => navigate('/bots')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Back to Bots
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Bots', path: '/bots' },
          { label: bot.name }
        ]}
      />
      
      <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-200 dark:border-[#333]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white flex-shrink-0">
            <BotIcon size={32} />
          </div>
          <div>
            <h1 className="m-0 text-[2rem] font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">
              {bot.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Updated {new Date(bot.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-none"
        >
          <Trash2 size={16} className="flex-shrink-0" />
          <span className="leading-none">{isDeleting ? 'Deleting...' : 'Delete Bot'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444]">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            {bot.description ? (
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {bot.description}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 italic">
                No description yet
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444]">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Bot Token
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={bot.discordBotToken}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {bot.discordUserId && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Discord User ID
                  </label>
                  <input
                    type="text"
                    value={bot.discordUserId}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Associated World
            </h2>
            {world ? (
              <div
                onClick={() => navigate(`/worlds/${world.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white flex-shrink-0">
                  🌍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors truncate">
                    {world.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Click to view
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Loading world...
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 border border-gray-200 dark:border-[#444]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg transition-colors cursor-pointer border-none text-left leading-none"
                onClick={() => alert('Start bot functionality coming soon!')}
              >
                <Power size={20} className="flex-shrink-0" />
                <span className="font-medium leading-none">Start Bot</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors cursor-pointer border-none text-left leading-none"
                onClick={() => alert('Stop bot functionality coming soon!')}
              >
                <PowerOff size={20} className="flex-shrink-0" />
                <span className="font-medium leading-none">Stop Bot</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotDetail

