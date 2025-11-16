import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/signin')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1b4e] to-[#1a1a1a] overflow-hidden relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(118,75,162,0.15)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="text-center max-w-[700px] px-8 relative z-10">
        <div className="mb-12">
          <h1 className="font-medieval text-[5rem] m-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent font-normal tracking-[2px] animate-pulse max-md:text-[3.5rem] max-[480px]:text-[2.5rem]">
            🎲 DnDiscord
          </h1>
        </div>
        
        <div className="mb-12">
          <h2 className="text-[2rem] text-white m-0 mb-6 font-semibold leading-[1.3] max-md:text-[1.5rem] max-[480px]:text-[1.3rem]">
            Bridge Your World Anvil Campaigns to Discord
          </h2>
          <p className="text-[1.1rem] text-[#bbb] leading-[1.8] m-0 max-md:text-base">
            Seamlessly sync your World Anvil campaign data with Discord. 
            Bring your NPCs, maps, items, and lore directly into your server 
            with AI-powered interactions and automated game management.
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-12 flex-wrap max-md:gap-4 max-[480px]:flex-col max-[480px]:gap-3">
          <div className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl min-w-[140px] transition-all hover:-translate-y-1 hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.3)] max-[480px]:min-w-[120px]">
            <span className="text-[2rem]">🌍</span>
            <span className="text-[#ddd] text-sm font-medium">World Anvil Integration</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl min-w-[140px] transition-all hover:-translate-y-1 hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.3)] max-[480px]:min-w-[120px]">
            <span className="text-[2rem]">🤖</span>
            <span className="text-[#ddd] text-sm font-medium">AI-Powered NPCs</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl min-w-[140px] transition-all hover:-translate-y-1 hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.3)] max-[480px]:min-w-[120px]">
            <span className="text-[2rem]">💬</span>
            <span className="text-[#ddd] text-sm font-medium">Discord Bot</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center max-md:flex-col max-md:items-stretch">
          <button 
            className="px-12 py-4 text-[1.1rem] font-semibold rounded-xl cursor-pointer transition-all border-none min-w-[140px] bg-transparent text-white border-2 border-[#667eea] hover:bg-[rgba(102,126,234,0.1)] hover:-translate-y-0.5 active:translate-y-0 max-md:w-full"
            onClick={handleSignIn}
          >
            Sign In
          </button>
          <button 
            className="px-12 py-4 text-[1.1rem] font-semibold rounded-xl cursor-pointer transition-all border-none min-w-[140px] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(102,126,234,0.6)] active:translate-y-0 max-md:w-full"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home

