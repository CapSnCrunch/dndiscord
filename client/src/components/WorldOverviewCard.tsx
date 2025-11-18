import type { World } from '../services/worldService'

interface WorldOverviewCardProps {
  world: World
  editedName: string
  editedDescription: string
  isEditingName: boolean
  isEditingDescription: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  setIsEditingName: (value: boolean) => void
  setIsEditingDescription: (value: boolean) => void
}

function WorldOverviewCard({
  world,
  editedName,
  editedDescription,
  isEditingName,
  isEditingDescription,
  onNameChange,
  onDescriptionChange,
  setIsEditingName,
  setIsEditingDescription
}: WorldOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm mb-6 overflow-hidden">
      {/* Banner */}
      <div className="h-40 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              className="w-full text-[2rem] font-semibold text-gray-900 dark:text-white mb-2 border-none outline-none bg-gray-200/70 dark:bg-[#333] rounded px-2 -ml-2"
            />
          ) : (
            <h1 
              className="m-0 text-[2rem] font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded px-2 -ml-2 transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Click to edit"
            >
              {editedName}
            </h1>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Updated {new Date(world.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Description
          </h2>
          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onBlur={() => setIsEditingDescription(false)}
              autoFocus
              rows={6}
              className="w-full text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed border-none outline-none bg-gray-200/70 dark:bg-[#333] rounded p-3 resize-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
              placeholder="Add a description..."
            />
          ) : (
            <div
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded p-3 -ml-3 transition-colors max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
              onClick={() => setIsEditingDescription(true)}
              title="Click to edit"
            >
              {editedDescription ? (
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {editedDescription}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-500 italic">
                  No description yet. Click to add one...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorldOverviewCard

