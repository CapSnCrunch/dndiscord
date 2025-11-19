import { useEffect, useState } from 'react'
import { botService, type BotResponse } from '../services/botService'
import { MessageSquare, User } from 'lucide-react'

interface RecentBotResponsesProps {
  botId: string
}

function RecentBotResponses({ botId }: RecentBotResponsesProps) {
  const [responses, setResponses] = useState<BotResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResponses()
  }, [botId])

  const loadResponses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedResponses = await botService.getRecentResponses(botId, 10)
      setResponses(fetchedResponses)
    } catch (err) {
      console.error('Error loading bot responses:', err)
      setError('Failed to load recent responses')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Responses
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-stone-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-stone-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Responses
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Responses
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {responses.length} {responses.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No responses yet. Your bot will start logging messages once it receives Discord mentions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((response, index) => (
            <div
              key={`${response.channelId}-${index}`}
              className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-stone-800 hover:border-gray-300 dark:hover:border-stone-700 transition-colors"
            >
              {/* NPC Avatar */}
              <div className="flex-shrink-0">
                {response.npcImageUrl ? (
                  <img
                    src={response.npcImageUrl}
                    alt={response.npcName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold ${response.npcImageUrl ? 'hidden' : ''}`}>
                  {response.npcImageUrl ? (
                    <User size={20} />
                  ) : (
                    response.npcName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {response.npcName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {formatTimestamp(response.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
                  {response.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentBotResponses

