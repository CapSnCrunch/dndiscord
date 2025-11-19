import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { npcService, type NPC } from '../services/npcService'
import { worldService, type World } from '../services/worldService'
import PageHeader from '../components/PageHeader'
import { CircleUserRound, ChevronRight } from 'lucide-react'

function NPCs() {
  const { worldId } = useParams<{ worldId: string }>()
  const navigate = useNavigate()
  const [world, setWorld] = useState<World | null>(null)
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingNpc, setIsCreatingNpc] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (worldId) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId])

  const loadData = async () => {
    if (!worldId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Load both world and NPCs
      const [fetchedWorld, fetchedNpcs] = await Promise.all([
        worldService.getWorld(worldId),
        npcService.getNPCs(worldId)
      ])
      
      setWorld(fetchedWorld)
      setNpcs(fetchedNpcs)
    } catch (err) {
      console.error('Error loading NPCs:', err)
      setError('Failed to load NPCs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNpc = async () => {
    if (!worldId) return
    
    setIsCreatingNpc(true)
    try {
      const npcId = await npcService.createNPC({
        name: 'New NPC',
        description: '',
        campaignId: worldId
      })
      
      // Navigate to the new NPC detail page
      navigate(`/worlds/${worldId}/npcs/${npcId}`)
    } catch (err) {
      console.error('Error creating NPC:', err)
      setError('Failed to create NPC. Please try again.')
    } finally {
      setIsCreatingNpc(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-stone-700 rounded w-48 mb-6"></div>
          <div className="h-8 bg-gray-200 dark:bg-stone-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-md:grid-cols-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-stone-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-24 mb-2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-stone-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-stone-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !world) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: 'Worlds', path: '/worlds' },
            { label: 'Error' }
          ]}
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Campaign not found'}</p>
          <button
            onClick={() => navigate('/worlds')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Back to Worlds
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Worlds', path: '/worlds' },
          { label: world.name, path: `/worlds/${worldId}` },
          { label: 'NPCs' }
        ]}
        actions={
          <button 
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all hover:from-[#5568d3] hover:to-[#6a3e8f] flex items-center gap-2 leading-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddNpc}
            disabled={isCreatingNpc}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="leading-none">{isCreatingNpc ? 'Adding...' : 'Add NPC'}</span>
          </button>
        }
      />
      
      {npcs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <CircleUserRound size={64} className="mx-auto text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No NPCs yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Click "Create New" to add your first NPC to this campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-md:grid-cols-1">
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors cursor-pointer group"
              onClick={() => navigate(`/worlds/${worldId}/npcs/${npc.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {npc.name}
                  </h3>
                </div>
                <ChevronRight size={20} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
              </div>
              {npc.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {npc.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NPCs

