import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import { GameShuffleSlider } from '@/components/ui/GameShuffleSlider'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import Iconify from '@/components/iconify'
import { m } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'

interface Game {
  id: string
  inner_game_id?: string
  game_provider?: string
  display_game_name: string
  image: string
  provider?: string
}

interface QuickActionsProps {
  games?: Game[]
}

export const QuickActions = ({ games = [] }: QuickActionsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isShuffling, setIsShuffling] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const handleShuffleClick = useCallback(() => {
    if (games.length === 0) return

    // 直接设置isShuffling=true触发新动画
    setIsShuffling(true)
    setIsButtonDisabled(true)
  }, [games.length])

  const handleGameSelected = useCallback((game: Game) => {
    // console.log('Selected game:', game)
    setSelectedGame(game)
  }, [])

  const handleAnimationComplete = useCallback(() => {
    setIsShuffling(false)
    // 动画完成后恢复按钮状态
    setIsButtonDisabled(false)
  }, [])

  return (
    <div className="h-100 sm:h-[465px] w-full relative overflow-hidden z-20">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)',
          backgroundPosition: isDesktop ? '0px -100px' : '0px 0px',
        }}
      />
      
      {/* Gradient Overlay Layers */}
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: 'linear-gradient(90deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 60%) 99.82%)',
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: 'linear-gradient(270deg, transparent 81.67%, color-mix(in oklch, var(--color-base-300), transparent 80%) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: 'linear-gradient(0deg, transparent 20.33%, color-mix(in oklch, var(--color-base-300), transparent 15%) 85.41%)',
        }}
      />
      <div
        className="absolute inset-0 z-0 rounded-box"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 15%) 59.51%)',
        }}
      />
      
      {/* Performance optimizations */}
      <div
        className="absolute inset-0 z-30 rounded-box"
        style={{
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
      />
      <div className="absolute top-7 left-6 sm:top-[95px] sm:left-[64px] flex flex-col z-30">
        {/* 桌面端：两个单词分行显示 */}
        <div className="hidden sm:block text-5xl font-bold">
          {t('casino:needHelpChoosingGame')
            .split(' ')
            .map((word, index) => (
              <div key={index}>{word}</div>
            ))}
        </div>
        {/* 移动端：一行显示 */}
        <p className="block sm:hidden text-3xl font-bold">{t('casino:needHelpChoosingGame')}</p>
        <span className="text-base-content/50 leading-5 text-md sm:text-lg font-bold mt-4 sm:mt-12 max-w-[223px]">
          {t('casino:scrollThroughAndWeWillMatchYouWithAGame')}
        </span>
        <div className="sm:mt-12 mt-4 hidden sm:block">
          <button
            className={`w-32 h-12 font-semibold rounded-field cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center ${
              isButtonDisabled ? 'bg-base-300 text-base-content/50 cursor-not-allowed' : 'bg-primary/20 text-primary hover:bg-primary/30'
            }`}
            onClick={handleShuffleClick}
            disabled={isButtonDisabled || games.length === 0}
          >
            <p>{t('casino:shuffle')}</p>
            {isButtonDisabled ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Iconify icon="custom:refresh" className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex sm:hidden left-8 right-8 absolute bottom-4 z-50 items-center justify-between">
        <button className="w-10 h-10 rounded-field cursor-pointer bg-primary/10 text-primary">
          <Iconify icon="custom:heart" className="w-5 h-5" />
        </button>
        {!isButtonDisabled && selectedGame && (
          <m.button
            className="btn btn-primary w-30 btn-md"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => {
              if (selectedGame?.inner_game_id) {
                const gameId = selectedGame.game_provider 
                  ? `${selectedGame.game_provider}:${selectedGame.inner_game_id}`
                  : selectedGame.inner_game_id
                navigate({ to: `/games/${gameId}` })
              }
            }}
          >
            {t('bonus:play')?.toUpperCase()}
          </m.button>
        )}
        <button
          className={`w-10 h-10 rounded-field cursor-pointer transition-all duration-200 ${
            isButtonDisabled ? 'bg-base-300 text-base-content/50 cursor-not-allowed' : 'bg-primary/10 text-primary'
          }`}
          onClick={handleShuffleClick}
          disabled={isButtonDisabled || games.length === 0}
        >
          {isButtonDisabled ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Iconify icon="custom:refresh" className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="absolute top-[62%] sm:top-[50%] left-0 right-0 z-30">
        <GameShuffleSlider
          games={games}
          isShuffling={isShuffling}
          onGameSelected={handleGameSelected}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
    </div>
  )
}
