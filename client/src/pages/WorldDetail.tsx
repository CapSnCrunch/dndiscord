import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { worldService, type World } from '../services/worldService'
import { npcService, type NPC } from '../services/npcService'
import { botService, type Bot } from '../services/botService'
import PageHeader from '../components/PageHeader'
import UnsavedChangesBanner from '../components/UnsavedChangesBanner'
import WorldOverviewCard from '../components/WorldOverviewCard'
import NPCsListCard from '../components/NPCsListCard'
import BotsListCard from '../components/BotsListCard'
import ComingSoonCard from '../components/ComingSoonCard'
import { Map } from 'lucide-react'

function WorldDetail() {
  const { worldId } = useParams<{ worldId: string }>()
  const navigate = useNavigate()
  const [world, setWorld] = useState<World | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Editing state
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // NPC state
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [isLoadingNpcs, setIsLoadingNpcs] = useState(false)
  const [isCreatingNpc, setIsCreatingNpc] = useState(false)
  
  // Bot state
  const [bots, setBots] = useState<Bot[]>([])
  const [isLoadingBots, setIsLoadingBots] = useState(false)

  useEffect(() => {
    if (worldId) {
      loadWorld(worldId)
    }
  }, [worldId])

  const loadWorld = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedWorld = await worldService.getWorld(id)
      setWorld(fetchedWorld)
      setEditedName(fetchedWorld.name)
      setEditedDescription(fetchedWorld.description || '')
      
      // Load NPCs and Bots for this world
      loadNPCs(id)
      loadBots(id)
    } catch (err) {
      console.error('Error loading world:', err)
      setError('Failed to load world. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadNPCs = async (id: string) => {
    try {
      setIsLoadingNpcs(true)
      const fetchedNpcs = await npcService.getNPCs(id)
      setNpcs(fetchedNpcs)
    } catch (err) {
      console.error('Error loading NPCs:', err)
    } finally {
      setIsLoadingNpcs(false)
    }
  }

  const loadBots = async (id: string) => {
    try {
      setIsLoadingBots(true)
      const fetchedBots = await botService.getBots(id)
      setBots(fetchedBots)
    } catch (err) {
      console.error('Error loading bots:', err)
    } finally {
      setIsLoadingBots(false)
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
      
      // Reload NPCs
      await loadNPCs(worldId)
      
      // Navigate to the new NPC detail page
      navigate(`/worlds/${worldId}/npcs/${npcId}`)
    } catch (err) {
      console.error('Error creating NPC:', err)
      setError('Failed to create NPC. Please try again.')
    } finally {
      setIsCreatingNpc(false)
    }
  }

  const handleNameChange = (value: string) => {
    setEditedName(value)
    setHasUnsavedChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    setEditedDescription(value)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!world || !worldId) return
    
    setIsSaving(true)
    try {
      await worldService.updateWorld(worldId, {
        name: editedName,
        description: editedDescription
      })
      
      // Update local state
      setWorld({
        ...world,
        name: editedName,
        description: editedDescription,
        updatedAt: new Date().toISOString()
      })
      
      setHasUnsavedChanges(false)
      setIsEditingName(false)
      setIsEditingDescription(false)
    } catch (err) {
      console.error('Error saving world:', err)
      setError('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (!world) return
    
    setEditedName(world.name)
    setEditedDescription(world.description || '')
    setHasUnsavedChanges(false)
    setIsEditingName(false)
    setIsEditingDescription(false)
  }

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-stone-700 rounded w-48 mb-6"></div>
          <div className="h-8 bg-gray-200 dark:bg-stone-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-3/4"></div>
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
          <p className="text-red-600 dark:text-red-400">{error || 'World not found'}</p>
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
          { label: world.name }
        ]}
      />
      
      <WorldOverviewCard
        world={world}
        editedName={editedName}
        editedDescription={editedDescription}
        isEditingName={isEditingName}
        isEditingDescription={isEditingDescription}
        onNameChange={handleNameChange}
        onDescriptionChange={handleDescriptionChange}
        setIsEditingName={setIsEditingName}
        setIsEditingDescription={setIsEditingDescription}
      />

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NPCsListCard
          npcs={npcs}
          isLoading={isLoadingNpcs}
          isCreating={isCreatingNpc}
          worldId={worldId!}
          onAddNpc={handleAddNpc}
          onNavigateToNpc={(npcId) => navigate(`/worlds/${worldId}/npcs/${npcId}`)}
          onViewAll={() => navigate(`/worlds/${worldId}/npcs`)}
        />
        
        <BotsListCard
          bots={bots}
          isLoading={isLoadingBots}
          onNavigateToBot={(botId) => navigate(`/bots/${botId}`)}
          onViewAll={() => navigate('/bots')}
          onAddBot={() => navigate(`/bots?worldId=${worldId}`)}
        />
      </div>
      
      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ComingSoonCard 
          title="Locations" 
          Icon={Map} 
        />
      </div>

      <UnsavedChangesBanner
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
    </div>
  )
}

export default WorldDetail

