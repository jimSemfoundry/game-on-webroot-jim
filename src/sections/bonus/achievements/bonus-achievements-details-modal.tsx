import { Modal } from '@/components/ui/Modal'
import Iconify from '@/components/iconify'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/utils/themeMerger'
import { useTranslation, Trans } from 'react-i18next'
import { useDisplayCurrencyFormatter } from '@/contexts/DisplayCurrencyContext'
import { Carousel, useCarousel, CarouselDotButtons } from '@/components/carousel'
import { FastAverageColor } from 'fast-average-color'

export interface AchievementStep {
  id: number
  step: number
  number: number              // 目标数量
  reward_amount: string
  reward_currency: string
  completed?: boolean         // 该步骤是否已完成
}

export interface AchievementDetail {
  id: string
  name: string
  description: string
  icon: string
  category: 'gaming' | 'crypto' | 'social' | 'special'
  currentStep: number         // 用户当前步骤
  steps: AchievementStep[]    // 所有步骤
  userProgress?: number       // 用户当前进度值
}

type BonusAchievementsDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  achievement: AchievementDetail | null
}

export const BonusAchievementsDetailsModal = ({ 
  isOpen, 
  onClose, 
  achievement
}: BonusAchievementsDetailsModalProps) => {
  const { t } = useTranslation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { formatWithConversion } = useDisplayCurrencyFormatter()
  const [iconColor, setIconColor] = useState<string>('')
  
  // 使用carousel hooks
  const carousel = useCarousel({
    loop: true,
    startIndex: achievement ? Math.max(0, achievement.currentStep - 1) : 0
  })

  // Handle image load and extract dominant color for background gradient
  const handleImageLoad = useCallback(async (imgElement: HTMLImageElement) => {
    try {
      const fac = new FastAverageColor()
      const color = await fac.getColorAsync(imgElement)
      
      // Create a radial gradient with the extracted color, similar to the reference design
      // Using 162.99% 78.23% size and positioning like the reference
      const gradientColor = `
        radial-gradient(162.99% 78.23% at 50.15% 21.77%, ${color.rgb.replace('rgb', 'rgba').replace(')', ', 0.20)')} 0%, rgba(0, 0, 0, 0.00) 100%),
        var(--color-base-400)
      `
      setIconColor(gradientColor)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to extract color for achievement icon:', error)
      }
      // Fallback gradient with stronger purple color
      setIconColor(`
        radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(139, 92, 246, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
        var(--color-base-400)
      `)
    }
  }, [])

  useEffect(() => {
    if (achievement && achievement.steps.length > 0 && carousel.mainApi) {
      // 默认滚动到用户当前步骤，如果没有则显示第一步
      const userCurrentIndex = Math.max(0, achievement.currentStep - 1)
      const targetIndex = Math.min(userCurrentIndex, achievement.steps.length - 1)
      carousel.mainApi.scrollTo(targetIndex)
    }
  }, [achievement, isOpen, carousel.mainApi])

  if (!achievement || achievement.steps.length === 0) return null
  
  const hasMultipleSteps = achievement.steps.length > 1
  
  const handlePrevious = () => {
    if (!achievement || !carousel.arrows.onClickPrev) return
    carousel.arrows.onClickPrev()
  }

  const handleNext = () => {
    if (!achievement || !carousel.arrows.onClickNext) return
    carousel.arrows.onClickNext()
  }

  // 生成成就描述组件 - 使用翻译系统，支持动态参数和 Trans 组件
  const getAchievementDescriptionComponent = (achievement: AchievementDetail, currentStep: any) => {
    // 根据成就key获取翻译描述
    const achievementKey = achievement.id.toLowerCase()
    
    // 准备翻译参数 - 使用当前步骤的number值
    let translationParams: any = {}
    
    // 根据成就类型确定需要的参数
    if (achievementKey.includes('game_explorer')) {
      // Game Explorer: 需要 count 参数 - 使用当前步骤的目标数量
      translationParams = { count: currentStep.number }
    } else if (achievementKey.includes('super_spreader')) {
      // Super Spreader: 需要 count 参数 - 使用当前步骤的目标数量
      translationParams = { count: currentStep.number }
    } else if (achievementKey.includes('conquistador')) {
      // Conquistador: 需要 count 参数 - 使用当前步骤的目标数量
      translationParams = { count: currentStep.number }
    } else if (achievementKey.includes('card_shark') || achievementKey.includes('slotmaster')) {
      // Card Shark / Slotmaster: 需要 amount 参数 - 使用当前步骤的目标金额
      translationParams = { amount: `₱${currentStep.number.toLocaleString()}` }
    }
    
    // 构建翻译key
    const translationKey = `bonus:${achievementKey}.description`
    
    // 检查翻译是否存在
    const hasTranslation = t(translationKey, { defaultValue: '__NOT_FOUND__' }) !== '__NOT_FOUND__'
    
    if (hasTranslation) {
      // 使用 Trans 组件来处理 <0></0> 标签
      return (
        <Trans
          i18nKey={translationKey}
          values={translationParams}
          components={[
            <span className="font-semibold text-primary" /> // <0></0> 标签的样式
          ]}
        />
      )
    }
    
    // 备用：尝试获取成就进度名称翻译
    const progressNameKey = `bonus:achievements_progress_name.${achievementKey}`
    const progressName = t(progressNameKey, { defaultValue: null })
    
    if (progressName && progressName !== progressNameKey) {
      // 如果有进度名称翻译，使用通用描述模板
      return t('bonus:unlock', { defaultValue: 'Complete tasks to unlock this achievement and earn rewards.' })
    }
    
    // 最后备用：使用原始描述或默认文本
    return achievement.description || t('bonus:unlock', { defaultValue: 'Complete tasks to unlock this achievement and earn rewards.' })
  }


  return (
    <Modal
      position={isMobile ? 'modal-bottom' : 'modal-middle'}
      isOpen={isOpen}
      onClose={onClose}
      hideTitle={true}
      className="md:w-[500px] max-w-lg mx-auto overflow-hidden"
    >
      <div 
        className="flex flex-col gap-6 -mx-5 -my-4 px-5 py-4"
        style={{
          background: iconColor || `
            radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(139, 92, 246, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
            var(--color-base-400)
          `
        }}
      >
        {/* Header Content */}
        <div className="flex items-center gap-x-2 h-8 pt-4">
          <Iconify icon="custom:achievement" className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <p className="text-base md:text-xl font-semibold">Achievement Details</p>
        </div>
        {/* Carousel Navigation and Achievement Icon */}
        <div className="flex items-center justify-between px-4 py-6 relative overflow-hidden">
          {/* Previous Button */}
          {hasMultipleSteps ? (
            <button
              onClick={handlePrevious}
              disabled={carousel.arrows.disablePrev}
              className="btn btn-circle btn-ghost btn-sm z-10"
              aria-label="Previous step"
            >
              <Iconify icon="mdi:chevron-left" className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}

          {/* Achievement Icon and Title */}
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-32 h-32 flex items-center justify-center">
              <img
                src={achievement.icon}
                alt={achievement.name}
                className="w-full h-full object-contain"
                onLoad={(e) => handleImageLoad(e.target as HTMLImageElement)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/illustrations/achievement-champion.png'
                }}
              />
            </div>
            
            {/* Achievement Name */}
            <h2 className="text-2xl font-bold text-center">
              {achievement.name}
            </h2>
          </div>

          {/* Next Button */}
          {hasMultipleSteps ? (
            <button
              onClick={handleNext}
              disabled={carousel.arrows.disableNext}
              className="btn btn-circle btn-ghost btn-sm z-10"
              aria-label="Next step"
            >
              <Iconify icon="mdi:chevron-right" className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Steps Carousel */}
        <div className="h-[360px]">
          <Carousel carousel={carousel}>
            {achievement.steps.map((step) => (
              <div key={step.id} className="px-6 h-full flex flex-col">
                {/* Step Info */}
                <div className="text-center mb-6">
                  <p className="text-base text-base-content/50">
                    {t("bonus:level")} {step.step} / {achievement.steps.length}
                  </p>
                </div>

                {/* Progress Bar Section - Fixed height container */}
                <div className="mb-6 h-[52px] flex flex-col justify-center">
                  {!step.completed && achievement.userProgress !== undefined ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-base-content/50">Progress</span>
                        <span className="text-sm text-base-content/50">
                          {achievement.userProgress} / {step.number}
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                          style={{
                            width: `${Math.min((achievement.userProgress / step.number) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>

                {/* Step Reward - Fixed height */}
                <div className="mb-6 h-[20px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/50">{t("bonus:achievement_reward")}</span>
                    <span className="text-sm text-primary">
                      {formatWithConversion(
                        parseFloat(step.reward_amount) || 0, 
                        step.reward_currency || 'BUCK'
                      ).formatted}
                    </span>
                  </div>
                </div>

                {/* Step Description - Flexible height with minimum */}
                <div className="mb-6 flex-1 min-h-[80px] flex items-start">
                  <div className="text-sm text-base-content/50 leading-relaxed">
                    {getAchievementDescriptionComponent(achievement, step)}
                  </div>
                </div>

                {/* Action Button - Fixed at bottom */}
                <div className="h-[48px] flex items-end">
                  <button 
                    className={cn(
                      "btn btn-block",
                      step.completed 
                        ? "btn-primary btn-soft" 
                        : "btn-primary"
                    )}
                    onClick={() => {
                      // Navigate to games or claim reward
                      if (!step.completed) {
                        // Navigate to games section
                        window.location.href = '/casino'
                      } else {
                        // Claim logic here if needed
                        onClose()
                      }
                    }}
                  >
                    {step.completed ? t('bonus:completed') : 'Play Now'}
                  </button>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Carousel Dots - only show if multiple steps */}
        {hasMultipleSteps && (
          <div className="px-4">
            <CarouselDotButtons 
              {...carousel.dots}
              className="flex items-center justify-center"
              variant="circular"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
