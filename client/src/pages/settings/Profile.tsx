import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function Profile() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '')
  const [birthday, setBirthday] = useState('')
  const [timezone, setTimezone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update
    console.log('Profile update:', { fullName, displayName, birthday, timezone })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-semibold text-2xl">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button 
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#444] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            Choose picture
          </button>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent transition-colors"
            placeholder="Enter your display name"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We'll address you by this name in the app and emails
          </p>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Birthday
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent transition-colors"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent transition-colors"
          >
            <option value="">Select...</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">GMT</option>
            <option value="Europe/Paris">Central European Time</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
        >
          Update Profile
        </button>
      </form>
    </div>
  )
}

export default Profile

