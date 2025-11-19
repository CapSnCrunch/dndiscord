import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { botService, type Bot } from '../services/botService'
import { worldService, type World } from '../services/worldService'
import { npcService, type NPC } from '../services/npcService'
import PageHeader from '../components/PageHeader'
import { Bot as BotIcon, X, ExternalLink } from 'lucide-react'

function Bots() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bots, setBots] = useState<Bot[]>([])
  const [worlds, setWorlds] = useState<World[]>([])
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Form state
  const [selectedWorldId, setSelectedWorldId] = useState<string>('')
  const [selectedNpcId, setSelectedNpcId] = useState<string>('')
  const [discordServerId, setDiscordServerId] = useState<string>('')
  const [discordChannelId, setDiscordChannelId] = useState<string>('')
  const [botName, setBotName] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

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

  const loadNPCs = async (worldId: string) => {
    try {
      const fetchedNpcs = await npcService.getNPCs(worldId)
      setNpcs(fetchedNpcs)
    } catch (err) {
      console.error('Error loading NPCs:', err)
      setNpcs([])
    }
  }

  useEffect(() => {
    if (selectedWorldId) {
      loadNPCs(selectedWorldId)
      setSelectedNpcId('') // Reset NPC selection when world changes
    } else {
      setNpcs([])
      setSelectedNpcId('')
    }
  }, [selectedWorldId])

  const handleCreateNewClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWorldId('')
    setSelectedNpcId('')
    setDiscordServerId('')
    setDiscordChannelId('')
    setBotName('')
    setInviteUrl(null)
  }

  const handleCreateBot = async () => {
    if (!selectedWorldId || !selectedNpcId || !discordServerId.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const selectedNPC = npcs.find(n => n.id === selectedNpcId)
      const botNameToUse = botName.trim() || selectedNPC?.name || 'Discord Bot'
      
      const result = await botService.createBot({
        name: botNameToUse,
        discordServerId: discordServerId.trim(),
        discordChannelId: discordChannelId.trim() || undefined,
        worldId: selectedWorldId,
        npcId: selectedNpcId,
      })

      if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl)
      } else {
        // If no invite URL returned, close modal and reload
        handleCloseModal()
        loadBots()
      }
    } catch (err: any) {
      console.error('Error creating bot:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create bot. Please try again.'
      setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const handleInviteComplete = () => {
    handleCloseModal()
    loadBots()
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
              className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm animate-pulse overflow-hidden"
            >
              <div className="h-16 bg-gray-200 dark:bg-[#444]"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 dark:bg-[#444] rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#444] rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#444] rounded w-3/4"></div>
              </div>
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
              className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/bots/${bot.id}`)}
            >
              {/* Gradient Banner */}
              <div className="h-16 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20"></div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-2">
                  {bot.name}
                </h3>
                {bot.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {bot.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="text-gray-500 dark:text-gray-500">World:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {getWorldName(bot.worldId)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{bot.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <span>
                    Updated {new Date(bot.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bot Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-[#2a2a2a] rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Bot
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {inviteUrl ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                    Bot created successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Use the link below to invite your bot to your Discord server.
                  </p>
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-medium underline"
                  >
                    Open Invite Link
                    <ExternalLink size={16} />
                  </a>
                </div>
                <button
                  onClick={handleInviteComplete}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    World <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWorldId}
                    onChange={(e) => setSelectedWorldId(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  >
                    <option value="">Select a world...</option>
                    {worlds.map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NPC <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedNpcId}
                    onChange={(e) => setSelectedNpcId(e.target.value)}
                    disabled={!selectedWorldId || npcs.length === 0}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#667eea] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedWorldId 
                        ? 'Select a world first...' 
                        : npcs.length === 0 
                        ? 'No NPCs in this world' 
                        : 'Select an NPC...'}
                    </option>
                    {npcs.map((npc) => (
                      <option key={npc.id} value={npc.id}>
                        {npc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder={selectedNpcId ? npcs.find(n => n.id === selectedNpcId)?.name || 'Bot name' : 'Bot name'}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to use the NPC's name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discord Server ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={discordServerId}
                    onChange={(e) => setDiscordServerId(e.target.value)}
                    placeholder="Enter your Discord server ID"
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Right-click your Discord server → Server Settings → Widget → Server ID (enable Developer Mode first)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discord Channel ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={discordChannelId}
                    onChange={(e) => setDiscordChannelId(e.target.value)}
                    placeholder="Enter Discord channel ID (leave empty for all channels)"
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Right-click a channel → Copy ID (requires Developer Mode). Leave empty to work in all channels.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseModal}
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-[#444] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBot}
                    disabled={isCreating || !selectedWorldId || !selectedNpcId || !discordServerId.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCreating ? 'Creating...' : 'Create Bot'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Bots

