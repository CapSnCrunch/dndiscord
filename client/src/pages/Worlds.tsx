function Worlds() {
  const handleImport = () => {
    // TODO: Implement World Anvil import
    console.log('Import from World Anvil clicked')
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200 dark:border-[#333] max-md:flex-col max-md:items-start max-md:gap-4">
        <h1 className="m-0 text-[2rem] font-medieval bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent tracking-wide">
          🌍 Worlds
        </h1>
        <button 
          className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)]"
          onClick={handleImport}
        >
          Import from World Anvil
        </button>
      </div>
      
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
        <p className="text-gray-600 dark:text-gray-400 text-center col-span-full">
          {/* Worlds will appear here once imported */}
          No worlds yet. Click "Import from World Anvil" to get started.
        </p>
      </div>
    </div>
  )
}

export default Worlds

