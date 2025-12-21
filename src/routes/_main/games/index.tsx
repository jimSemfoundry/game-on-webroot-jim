import { createFileRoute } from '@tanstack/react-router'
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'

// Types
interface GameSummary {
  id: string
  title: string
  imageUrl: string
  category: string
  provider: string
  rating: number
  isNew?: boolean
  isFeatured?: boolean
}

// Games List Component
const GamesList = () => {
  const navigate = Route.useNavigate()
  
  const [games, setGames] = useState<GameSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'action', 'adventure', 'strategy', 'puzzle', 'sports']

  // Fetch games list
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        // const response = await gameService.getGames()
        
        // Mock data
        const mockGames: GameSummary[] = [
          {
            id: '1',
            title: 'Adventure Quest',
            imageUrl: '/images/game-1.jpg',
            category: 'adventure',
            provider: 'Epic Games',
            rating: 4.8,
            isNew: true,
            isFeatured: true
          },
          {
            id: '2',
            title: 'Strategy Master',
            imageUrl: '/images/game-2.jpg',
            category: 'strategy',
            provider: 'Strategy Studios',
            rating: 4.6,
            isFeatured: true
          },
          {
            id: '3',
            title: 'Action Hero',
            imageUrl: '/images/game-3.jpg',
            category: 'action',
            provider: 'Action Corp',
            rating: 4.9,
            isNew: true
          },
          {
            id: '4',
            title: 'Puzzle Solver',
            imageUrl: '/images/game-4.jpg',
            category: 'puzzle',
            provider: 'Puzzle World',
            rating: 4.3
          }
        ]
        
        await new Promise(resolve => setTimeout(resolve, 800))
        setGames(mockGames)
      } catch (err) {
        console.error('Error fetching games:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleGameClick = (gameId: string) => {
    navigate({ to: '/games/$gameId', params: { gameId }, search: {} })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-base-300">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-base-content mb-4">Games</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-base-content/50" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-bordered"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/70">Loading games...</p>
            </div>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-base-content mb-4">No games found</h2>
            <p className="text-base-content/70">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleGameClick(game.id)}
              >
                {/* Game Image */}
                <figure className="relative aspect-video">
                  <img 
                    src={game.imageUrl} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/game-placeholder.jpg'
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {game.isNew && (
                      <span className="badge badge-primary badge-sm">New</span>
                    )}
                    {game.isFeatured && (
                      <span className="badge badge-warning badge-sm">Featured</span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1 flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs">{game.rating}</span>
                  </div>
                </figure>

                {/* Game Info */}
                <div className="card-body p-4">
                  <h3 className="card-title text-base font-semibold truncate">{game.title}</h3>
                  <div className="flex items-center justify-between text-xs text-base-content/70">
                    <span className="badge badge-outline badge-sm">{game.category}</span>
                    <span className="truncate ml-2">{game.provider}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Route Configuration
export const Route = createFileRoute('/_main/games/')({
  component: GamesList,
  // Optional: Add search params validation
  // validateSearch: (search) => ({
  //   category: search.category || 'all',
  //   search: search.search || '',
  // }),
  // Optional: Pre-load games data
  // loader: async () => {
  //   return await gameService.getGames()
  // }
})