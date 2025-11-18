interface DeleteConfirmationModalProps {
  isOpen: boolean
  itemName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
  recoveryMessage?: string
}

function DeleteConfirmationModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isDeleting,
  recoveryMessage = "Are you sure? This action cannot be undone."
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Delete {itemName}?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {recoveryMessage}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 dark:bg-[#333] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#444] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal

