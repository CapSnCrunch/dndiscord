import { CircleUserRound } from 'lucide-react'
import type { NPC } from '../services/npcService'

interface NPCOverviewCardProps {
  npc: NPC
  editedName: string
  editedDescription: string
  editedImageUrl: string
  isEditingName: boolean
  isEditingDescription: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImageClick: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  setIsEditingName: (value: boolean) => void
  setIsEditingDescription: (value: boolean) => void
}

function NPCOverviewCard({
  npc,
  editedName,
  editedDescription,
  editedImageUrl,
  isEditingName,
  isEditingDescription,
  fileInputRef,
  onNameChange,
  onDescriptionChange,
  onImageClick,
  onFileChange,
  setIsEditingName,
  setIsEditingDescription
}: NPCOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm mb-4">
      <div className="flex items-start gap-4 mb-6">
        <div 
          onClick={onImageClick}
          className={`w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden transition-all ${
            editedImageUrl 
              ? 'hover:opacity-80 cursor-pointer' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 text-gray-500 dark:text-gray-400 p-4 cursor-pointer'
          }`}
          title="Click to upload image"
        >
          {editedImageUrl ? (
            <img src={editedImageUrl} alt={editedName} className="w-full h-full object-cover" />
          ) : (
            <CircleUserRound size={96} strokeWidth={1.5} />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              className="text-[2rem] font-semibold text-gray-900 dark:text-white mb-2 border-none outline-none bg-gray-200/70 dark:bg-stone-700 rounded px-2 -ml-2 w-full"
            />
          ) : (
            <h1 
              className="m-0 text-[2rem] font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-800 rounded px-2 -ml-2 transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Click to edit"
            >
              {editedName}
            </h1>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Updated {new Date(npc.updatedAt).toLocaleDateString()}
          </p>
        </div>
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
            className="w-full text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed border-none outline-none bg-gray-200/70 dark:bg-stone-700 rounded p-3 resize-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
            placeholder="Add a description..."
          />
        ) : (
          <div
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-800 rounded p-3 -ml-3 transition-colors max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
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
  )
}

export default NPCOverviewCard

