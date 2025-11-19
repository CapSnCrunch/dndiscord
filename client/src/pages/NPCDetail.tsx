import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { worldService, type World } from '../services/worldService'
import { npcService, type NPC } from '../services/npcService'
import PageHeader from '../components/PageHeader'
import UnsavedChangesBanner from '../components/UnsavedChangesBanner'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import NPCOverviewCard from '../components/NPCOverviewCard'
import { Trash2, Users, StickyNote } from 'lucide-react'

function NPCDetail() {
  const { worldId, npcId } = useParams<{ worldId: string; npcId: string }>()
  const navigate = useNavigate()
  const [world, setWorld] = useState<World | null>(null)
  const [npc, setNpc] = useState<NPC | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Editing state
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedImageUrl, setEditedImageUrl] = useState('')
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (worldId && npcId) {
      loadData(worldId, npcId)
    }
  }, [worldId, npcId])

  const loadData = async (worldId: string, npcId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load both world and NPC data
      const [fetchedWorld, fetchedNpc] = await Promise.all([
        worldService.getWorld(worldId),
        npcService.getNPC(npcId)
      ])
      
      setWorld(fetchedWorld)
      setNpc(fetchedNpc)
      setEditedName(fetchedNpc.name)
      setEditedDescription(fetchedNpc.description || '')
      setEditedImageUrl(fetchedNpc.imageUrl || '')
    } catch (err) {
      console.error('Error loading NPC:', err)
      setError('Failed to load NPC. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!npc) {
      setHasUnsavedChanges(false)
      return
    }
    
    const nameChanged = editedName !== npc.name
    const descriptionChanged = editedDescription !== (npc.description || '')
    const imageChanged = pendingImageFile !== null
    
    setHasUnsavedChanges(nameChanged || descriptionChanged || imageChanged)
  }, [editedName, editedDescription, pendingImageFile, npc])

  const handleNameChange = (value: string) => {
    setEditedName(value)
  }

  const handleDescriptionChange = (value: string) => {
    setEditedDescription(value)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Store the file for later upload when Save is clicked
    // Create a preview URL for immediate display
    const previewUrl = URL.createObjectURL(file)
    setEditedImageUrl(previewUrl)
    setPendingImageFile(file)
  }

  const handleSave = async () => {
    if (!npc || !worldId || !npcId) return
    
    setIsSaving(true)
    try {
      // Upload image and save other changes together
      const updatedNPC = await npcService.updateNPC(
        npcId,
        {
          name: editedName,
          description: editedDescription,
        },
        pendingImageFile || undefined
      )
      
      // Clean up preview URL if we created one
      if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editedImageUrl)
      }
      
      // Clear pending file
      setPendingImageFile(null)
      
      // Update local state with response (includes new signed URL if image was uploaded)
      setNpc(updatedNPC)
      setEditedImageUrl(updatedNPC.imageUrl || '')
      
      setHasUnsavedChanges(false)
      setIsEditingName(false)
      setIsEditingDescription(false)
    } catch (err) {
      console.error('Error saving NPC:', err)
      setError('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (!npc) return
    
    // Clean up preview URL if we created one
    if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editedImageUrl)
    }
    
    // Clear pending file
    setPendingImageFile(null)
    
    setEditedName(npc.name)
    setEditedDescription(npc.description || '')
    setEditedImageUrl(npc.imageUrl || '')
    setHasUnsavedChanges(false)
    setIsEditingName(false)
    setIsEditingDescription(false)
  }

  const handleDelete = async () => {
    if (!npcId || !worldId) return
    
    setIsDeleting(true)
    try {
      await npcService.deleteNPC(npcId)
      // Navigate back to the world page
      navigate(`/worlds/${worldId}`)
    } catch (err) {
      console.error('Error deleting NPC:', err)
      setError('Failed to delete NPC. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
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

  if (error || !npc || !world) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: 'Worlds', path: '/worlds' },
            { label: 'Error' }
          ]}
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'NPC not found'}</p>
          <button
            onClick={() => navigate(`/worlds/${worldId}`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Back to World
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
          { label: 'NPCs', path: `/worlds/${worldId}/npcs` },
          { label: npc.name }
        ]}
        actions={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed leading-none"
            title="Delete NPC"
          >
            <Trash2 size={18} className="flex-shrink-0" />
            <span className="leading-none">Delete</span>
          </button>
        }
      />
      
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        itemName={npc.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isDeleting}
        recoveryMessage="Are you sure? You'll be able to recover this NPC for the next 30 days from your world settings."
      />
      
      <NPCOverviewCard
        npc={npc}
        editedName={editedName}
        editedDescription={editedDescription}
        editedImageUrl={editedImageUrl}
        isEditingName={isEditingName}
        isEditingDescription={isEditingDescription}
        fileInputRef={fileInputRef}
        onNameChange={handleNameChange}
        onDescriptionChange={handleDescriptionChange}
        onImageClick={handleImageClick}
        onFileChange={handleFileChange}
        setIsEditingName={setIsEditingName}
        setIsEditingDescription={setIsEditingDescription}
      />

      {/* Additional NPC Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 leading-tight">
            <Users size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="leading-tight">Relationships</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Coming soon...
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 leading-tight">
            <StickyNote size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="leading-tight">Notes</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Coming soon...
          </p>
        </div>
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

export default NPCDetail

