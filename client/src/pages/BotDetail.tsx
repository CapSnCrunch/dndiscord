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
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

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

  const handleStartBot = async () => {
    if (!bot) return
    
    try {
      setIsTogglingStatus(true)
      const updatedBot = await botService.startBot(bot.id)
      setBot(updatedBot)
    } catch (err) {
      console.error('Error starting bot:', err)
      alert('Failed to start bot. Please try again.')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleStopBot = async () => {
    if (!bot) return
    
    try {
      setIsTogglingStatus(true)
      const updatedBot = await botService.stopBot(bot.id)
      setBot(updatedBot)
    } catch (err) {
      console.error('Error stopping bot:', err)
      alert('Failed to stop bot. Please try again.')
    } finally {
      setIsTogglingStatus(false)
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
        actions={
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed leading-none"
            title="Delete Bot"
          >
            <Trash2 size={18} className="flex-shrink-0" />
            <span className="leading-none">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        }
      />
      
      {/* Bot Overview Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm mb-6 overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20"></div>
        
        {/* Content */}
        <div className="p-6 -mt-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 shadow-lg flex items-center justify-center flex-shrink-0">
              <BotIcon size={48} className="text-gray-900 dark:text-white" />
            </div>
            <div className="flex-1 pt-8">
              <h1 className="m-0 text-[2rem] font-semibold text-gray-900 dark:text-white mb-2">
                {bot.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-600 dark:text-gray-400">{bot.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Updated {new Date(bot.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {bot.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                {bot.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Discord Server ID
              </label>
              <input
                type="text"
                value={bot.discordServerId}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            {bot.discordChannelId && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Discord Channel ID
                </label>
                <input
                  type="text"
                  value={bot.discordChannelId}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Bot is configured for this specific channel
                </p>
              </div>
            )}
            {!bot.discordChannelId && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bot is configured to work in all channels of the server
              </p>
            )}
            
            <div className="pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Associated World
              </label>
              {world ? (
                <div
                  onClick={() => navigate(`/worlds/${world.id}`)}
                  className="text-[#667eea] font-medium hover:text-[#5568d3] transition-colors cursor-pointer"
                >
                  {world.name}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {bot.isActive ? (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors cursor-pointer border-none text-left leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStopBot}
                disabled={isTogglingStatus}
              >
                <PowerOff size={20} className="flex-shrink-0" />
                <span className="font-medium leading-none">{isTogglingStatus ? 'Stopping...' : 'Stop Bot'}</span>
              </button>
            ) : (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg transition-colors cursor-pointer border-none text-left leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartBot}
                disabled={isTogglingStatus}
              >
                <Power size={20} className="flex-shrink-0" />
                <span className="font-medium leading-none">{isTogglingStatus ? 'Starting...' : 'Start Bot'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotDetail

