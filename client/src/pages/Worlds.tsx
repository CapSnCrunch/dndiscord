import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { worldService, type World } from '../services/worldService'
import PageHeader from '../components/PageHeader'

function Worlds() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [worlds, setWorlds] = useState<World[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadWorlds()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadWorlds = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedWorlds = await worldService.getWorlds()
      setWorlds(fetchedWorlds)
    } catch (err) {
      console.error('Error loading worlds:', err)
      setError('Failed to load worlds. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCreateManually = async () => {
    if (!user) return
    
    setIsCreating(true)
    try {
      await worldService.createWorld({
        name: 'New World',
        description: ''
      })
      setIsModalOpen(false)
      // Refresh worlds list
      await loadWorlds()
    } catch (error) {
      console.error('Error creating world:', error)
      setError('Failed to create world. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKankaImport = () => {
    // Coming soon
    console.log('Kanka import coming soon')
  }

  const handleWorldAnvilImport = () => {
    // Coming soon
    console.log('World Anvil import coming soon')
  }

  return (
    <div>
      <PageHeader 
        breadcrumbs={[{ label: 'Worlds' }]}
        actions={
          <button 
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all hover:from-[#5568d3] hover:to-[#6a3e8f] flex items-center gap-2 leading-none"
            onClick={handleCreateNewClick}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="leading-none">Add New</span>
          </button>
        }
      />
      
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-md animate-pulse"
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
            onClick={loadWorlds}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : worlds.length === 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          <p className="text-gray-600 dark:text-gray-400 text-center col-span-full">
            No worlds yet. Click "Create New" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          {worlds.map((world) => (
            <div
              key={world.id}
              className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/worlds/${world.id}`)}
            >
              {/* Thin Banner */}
              <div className="h-16 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-2">
                  {world.name}
                </h3>
                {world.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {world.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                  <span>
                    Updated {new Date(world.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create World Modal */}
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
              Create New World
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose how you want to create your world
            </p>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Integrations
              </h3>
              
              {/* Kanka Option (Coming Soon) */}
              <button
                onClick={handleKankaImport}
                disabled
                className="w-full p-4 border-2 border-blue-200 dark:border-blue-900/50 rounded-lg text-left bg-blue-50 dark:bg-blue-950/30 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border-2 border-blue-200 dark:border-blue-900/50 flex items-center justify-center p-1">
                    <img src="/kanka.png" alt="Kanka" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Kanka
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Coming soon
                    </p>
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </button>

              {/* World Anvil Option (Coming Soon) */}
              <button
                onClick={handleWorldAnvilImport}
                disabled
                className="w-full p-4 border-2 border-orange-200 dark:border-orange-900/50 rounded-lg text-left bg-orange-50 dark:bg-orange-950/30 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border-2 border-orange-200 dark:border-orange-900/50 flex items-center justify-center p-1">
                    <img src="/world-anvil.png" alt="World Anvil" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      World Anvil
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Coming soon
                    </p>
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </button>
            </div>

            <button
              onClick={handleCreateManually}
              disabled={isCreating}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isCreating ? 'Creating...' : 'Create Manually'}
            </button>

            <button
              onClick={handleCloseModal}
              className="w-full mt-3 px-6 py-3 bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#444] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Worlds

