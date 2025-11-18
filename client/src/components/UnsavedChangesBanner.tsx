import { Check, X } from 'lucide-react'

interface UnsavedChangesBannerProps {
  hasUnsavedChanges: boolean
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

function UnsavedChangesBanner({
  hasUnsavedChanges,
  onSave,
  onCancel,
  isSaving
}: UnsavedChangesBannerProps) {
  if (!hasUnsavedChanges) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ml-[125px] max-md:ml-[35px] z-50 max-md:w-[90vw]">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg px-8 max-md:px-4 py-3 flex items-center justify-between min-w-[700px] max-md:min-w-full">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-gray-900 dark:text-white font-medium text-sm">
            You have unsaved changes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-none"
          >
            <X size={16} className="flex-shrink-0" />
            <span className="leading-none">Cancel</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-none"
          >
            <Check size={16} className="flex-shrink-0" />
            <span className="leading-none">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesBanner

