import { useAuth } from '@/contexts/AuthContext'
import { useUserAchievements } from '@/hooks/api/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/themeMerger'
import { FastAverageColor } from 'fast-average-color'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Iconify from '@/components/iconify'
import { LiquidGlassEffect } from '@/components/ui/LiquidGlassEffect'
import { Modal } from '@/components/ui/Modal'
import { BonusAchievementsDetailsModal } from './bonus-achievements-details-modal'
import { BonusAchievementsLockedModal } from './bonus-achievements-locked-modal'

type BonusAchievementsModalProps = {
  isOpen: boolean
  onClose: () => void
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  completed: boolean
  category: 'gaming' | 'crypto' | 'social' | 'special'
  totalReward?: number
  currentStep?: number
  achievedDate?: string
  rewardCurrency?: string
  totalSteps?: number
}

export const BonusAchievementsModal = ({ isOpen, onClose }: BonusAchievementsModalProps) => {
  const { t } = useTranslation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [cardColors, setCardColors] = useState<Record<string, string>>({})
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false)
  
  // 获取用户信息和VIP等级
  const { status, isAuthenticated, isInitialized } = useAuth()
  const userVipLevel = status?.vip || 0
  const isAchievementLocked = !isAuthenticated || userVipLevel < 2
  
  // 获取所有成就数据（包括用户进度）
  const { data: achievementsData, isLoading: isDataLoading } = useUserAchievements('asc')
  
  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading
  
  // Handle image load and extract dominant color
  const handleImageLoad = useCallback(async (achievementId: string, imgElement: HTMLImageElement) => {
    try {
      const fac = new FastAverageColor()
      const color = await fac.getColorAsync(imgElement)
      
      // Create a very light version of the color for shadow (low opacity)
      const shadowColor = `${color.rgb.replace('rgb', 'rgba').replace(')', ', 0.15)')}`
      
      setCardColors(prev => ({
        ...prev,
        [achievementId]: shadowColor
      }))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to extract color for achievement:', achievementId, error)
      }
    }
  }, [])

  // 将API数据映射到UI格式
  const achievements: Achievement[] = useMemo(() => {
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) {
      return []
    }

    return achievementsData.data.map((achievement: any) => {
      // 计算当前进度和最大进度
      const userAchievement = achievement.userAchievement
      const achievementSteps = achievement.achievementStep || []
      
      // 按step排序
      const sortedSteps = [...achievementSteps].sort((a: any, b: any) => a.step - b.step)
      
      // 找到当前步骤和下一步骤
      let currentStep = 0
      let currentProgress = 0
      let maxProgress = 1
      let completed = false
      
      if (userAchievement && userAchievement.step) {
        currentStep = userAchievement.step
        // 找到当前步骤的信息
        const currentStepInfo = sortedSteps.find((s: any) => s.step === currentStep)
        const nextStepInfo = sortedSteps.find((s: any) => s.step === currentStep + 1)
        
        if (currentStepInfo) {
          currentProgress = currentStepInfo.number || 0
        }
        
        if (nextStepInfo) {
          maxProgress = nextStepInfo.number || 1
        } else {
          // 如果没有下一步，说明已完成所有步骤
          completed = currentStep === sortedSteps.length
          maxProgress = currentProgress
        }
      } else {
        // 用户还没开始这个成就
        if (sortedSteps.length > 0) {
          maxProgress = sortedSteps[0].number || 1
        }
      }
      
      // 确定分类
      let category: 'gaming' | 'crypto' | 'social' | 'special' = 'special'
      const key = achievement.key?.toLowerCase() || ''
      
      if (key.includes('game') || key.includes('explorer') || key.includes('conquistador')) {
        category = 'gaming'
      } else if (key.includes('crypto') || key.includes('money')) {
        category = 'crypto'
      } else if (key.includes('spreader') || key.includes('social')) {
        category = 'social'
      } else if (key.includes('verify')) {
        category = 'special'
      }
      
      // 获取图标路径
      const iconMap: Record<string, string> = {
        'achievement_verify_email': '/images/illustrations/achievement-face-of-fortune.png',
        'achievement_verify_phone': '/images/illustrations/achievement-dynamo.png',
        'achievement_super_spreader': '/images/illustrations/achievement-super-spreader.png',
        'achievement_conquistador': '/images/illustrations/achievement-the-challenger.png',
        'achievement_game_explorer': '/images/illustrations/achievement-game-explorer.png',
      }
      
      // 获取成就完成日期（如果有）
      const achievedDate = userAchievement?.updated_at ? 
        new Date(userAchievement.updated_at * 1000).toISOString() : undefined
      
      // 获取当前步骤的奖励信息
      const currentStepInfo = sortedSteps.find((s: any) => s.step === currentStep)
      const rewardAmount = currentStepInfo?.reward_amount || achievement.reward || 0
      const rewardCurrency = currentStepInfo?.reward_currency || 'BUCK'
      
      // 获取翻译的成就名称
      const achievementKey = achievement.key?.toLowerCase() || ''
      const translationKey = `bonus:${achievementKey}`
      const achievementTranslation = t(translationKey, { returnObjects: true })
      
      let translatedName = achievement.name
      
      // 获取简短描述 - 优先从翻译文件获取，否则使用API返回的描述
      const shortDescriptionKey = `bonus:achievement_short_descriptions.${achievementKey}`
      let shortDescription = t(shortDescriptionKey, { defaultValue: null })
      
      // 如果翻译文件中没有简短描述，使用API返回的描述
      if (!shortDescription || shortDescription === shortDescriptionKey) {
        shortDescription = achievement.description || achievement.note || ''
      }
      
      // 如果有翻译对象，使用翻译的名称
      if (typeof achievementTranslation === 'object' && achievementTranslation) {
        if ('name' in achievementTranslation) {
          translatedName = (achievementTranslation as any).name || achievement.name
        }
      }
      
      return {
        id: achievement.id.toString(),
        name: translatedName,
        description: shortDescription,
        icon: iconMap[achievement.key] || '/images/illustrations/achievement-champion.png',
        progress: currentProgress,
        maxProgress: maxProgress,
        completed: completed,
        category: category,
        totalReward: rewardAmount,
        currentStep: currentStep,
        nextStepRequirement: maxProgress,
        achievedDate: achievedDate,
        rewardCurrency: rewardCurrency,
        level: currentStep || 1,
        totalSteps: sortedSteps.length,
      }
    })
  }, [achievementsData])

  // Mock achievements for fallback
  const mockAchievements: Achievement[] = [
    {
      id: 'achievement_sniper',
      name: 'Sniper',
      description: t('bonus:achievement_short_descriptions.achievement_sniper', { defaultValue: 'Master precision gaming' }),
      icon: '/images/illustrations/achievement-sniper.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_champion',
      name: 'Champion',
      description: t('bonus:achievement_short_descriptions.achievement_champion', { defaultValue: 'Achieve ultimate victory' }),
      icon: '/images/illustrations/achievement-champion.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_name_of_fame',
      name: 'Name of Fame',
      description: t('bonus:achievement_short_descriptions.achievement_name_of_fame', { defaultValue: 'Become legendary' }),
      icon: '/images/illustrations/achievement-name-of-fame.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'special'
    },
    {
      id: 'achievement_guiding_star',
      name: 'Guiding Star',
      description: t('bonus:achievement_short_descriptions.achievement_guiding_star', { defaultValue: 'Lead the way for others' }),
      icon: '/images/illustrations/avhievement-guiding-star.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'social'
    },
    {
      id: 'achievement_face_of_fortune',
      name: 'Face of Fortune',
      description: t('bonus:achievement_short_descriptions.achievement_face_of_fortune', { defaultValue: 'Master the art of luck' }),
      icon: '/images/illustrations/achievement-face-of-fortune.png',
      progress: 1,
      maxProgress: 1,
      completed: true,
      category: 'special'
    },
    {
      id: 'achievement_super_spreader',
      name: 'Super Spreader',
      description: t('bonus:achievement_short_descriptions.achievement_super_spreader', { defaultValue: 'Share the gaming experience' }),
      icon: '/images/illustrations/achievement-super-spreader.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'social'
    },
    {
      id: 'achievement_dynamo',
      name: 'Dynamo',
      description: t('bonus:achievement_short_descriptions.achievement_dynamo', { defaultValue: 'Unstoppable energy and power' }),
      icon: '/images/illustrations/achievement-dynamo.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_inferno',
      name: 'Inferno',
      description: t('bonus:achievement_short_descriptions.achievement_inferno', { defaultValue: 'Burn through challenges' }),
      icon: '/images/illustrations/achievement-inferno.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_the_challenger',
      name: 'The Challenger',
      description: t('bonus:achievement_short_descriptions.achievement_the_challenger', { defaultValue: 'Face every obstacle' }),
      icon: '/images/illustrations/achievement-the-challenger.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_game_explorer',
      name: 'Game Explorer',
      description: t('bonus:achievement_short_descriptions.achievement_game_explorer', { defaultValue: 'Discover new gaming worlds' }),
      icon: '/images/illustrations/achievement-game-explorer.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    },
    {
      id: 'achievement_crypto_bro',
      name: 'Crypto Bro',
      description: t('bonus:achievement_short_descriptions.achievement_crypto_bro', { defaultValue: 'Master cryptocurrency trading' }),
      icon: '/images/illustrations/achievement-crypto-bro.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'crypto'
    },
    {
      id: 'achievement_crypto_baron',
      name: 'Crypto Baron',
      description: t('bonus:achievement_short_descriptions.achievement_crypto_baron', { defaultValue: 'Dominate the crypto market' }),
      icon: '/images/illustrations/achievement-crypto-baron.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'crypto'
    },
    {
      id: 'achievement_chain_shifter',
      name: 'Chain Shifter',
      description: t('bonus:achievement_short_descriptions.achievement_chain_shifter', { defaultValue: 'Navigate blockchain networks' }),
      icon: '/images/illustrations/achievement-chain-shifter.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'crypto'
    },
    {
      id: 'achievement_money_master',
      name: 'Money Master',
      description: t('bonus:achievement_short_descriptions.achievement_money_master', { defaultValue: 'Master financial strategies' }),
      icon: '/images/illustrations/achievement-money-master.png',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'crypto'
    },
    {
      id: 'achievement_card_shark',
      name: 'Card Shark',
      description: t('bonus:achievement_short_descriptions.achievement_card_shark', { defaultValue: 'Dominate card games' }),
      icon: '/images/illustrations/isometric9.svg',
      progress: 6,
      maxProgress: 40,
      completed: false,
      category: 'gaming'
    }
  ]
  
  // 使用真实数据或 mock 数据
  const displayAchievements = achievements.length > 0 ? achievements : mockAchievements
  
  // 将Achievement转换为AchievementDetail格式
  const convertToAchievementDetail = (achievement: Achievement, rawData: any) => {
    if (!rawData?.data) {
      // Mock data - create single step
      return {
        id: achievement.id, // Mock data使用现有ID
        name: achievement.name,
        description: achievement.description, // Mock data保持使用简短描述
        icon: achievement.icon,
        category: achievement.category,
        currentStep: achievement.currentStep || 1,
        userProgress: achievement.progress,
        steps: [{
          id: 1,
          step: 1,
          number: achievement.maxProgress,
          reward_amount: achievement.totalReward?.toString() || '0',
          reward_currency: achievement.rewardCurrency || 'BUCK',
          completed: achievement.completed
        }]
      }
    }
    
    // Find the raw achievement data
    const rawAchievement = rawData.data.find((a: any) => a.id.toString() === achievement.id)
    if (!rawAchievement) {
      // Fallback to single step  
      return {
        id: achievement.id, // Fallback使用现有ID
        name: achievement.name,
        description: achievement.description, // Fallback保持使用简短描述
        icon: achievement.icon,
        category: achievement.category,
        currentStep: achievement.currentStep || 1,
        userProgress: achievement.progress,
        steps: [{
          id: 1,
          step: 1,
          number: achievement.maxProgress,
          reward_amount: achievement.totalReward?.toString() || '0',
          reward_currency: achievement.rewardCurrency || 'BUCK',
          completed: achievement.completed
        }]
      }
    }
    
    // Get achievement steps from raw data
    const achievementSteps = rawAchievement.achievementStep || []
    const sortedSteps = [...achievementSteps].sort((a: any, b: any) => a.step - b.step)
    
    // Get user progress
    const userAchievement = rawAchievement.userAchievement
    const userCurrentStep = userAchievement?.step || 1
    
    // 根据成就类型获取用户实际进度值
    let userActualProgress = 0
    const achievementKey = rawAchievement.key?.toLowerCase() || ''
    
    if (achievementKey.includes('game_explorer')) {
      // Game Explorer: 用户玩过的游戏种类数量
      userActualProgress = status?.game_explorer_num || 0
    } else if (achievementKey.includes('conquistador')) {
      // Conquistador: 完成的征服数量
      userActualProgress = status?.finish_conquests_num || 0
    } else if (achievementKey.includes('super_spreader')) {
      // Super Spreader: 直接邀请数量
      userActualProgress = status?.direct_invitations || 0
    } else {
      // 其他成就类型，使用默认值或 API 返回的值
      userActualProgress = rawAchievement.join_achievement_user_number || 0
    }
    
    // Convert steps to AchievementStep format
    const steps = sortedSteps.map((step: any) => ({
      id: step.id,
      step: step.step,
      number: step.number,
      reward_amount: step.reward_amount || step.reward || '0',
      reward_currency: step.reward_currency || 'BUCK',
      // 步骤完成条件：用户当前步骤大于该步骤，或者在当前步骤且实际进度达到目标
      completed: userCurrentStep > step.step || (userCurrentStep === step.step && userActualProgress >= step.number)
    }))
    
    return {
      id: rawAchievement.key || achievement.id, // 使用原始的key而不是数字ID
      name: achievement.name,
      description: achievement.description, // 这里保持传递简短描述，详细描述在详情页内部获取
      icon: achievement.icon,
      category: achievement.category,
      currentStep: userCurrentStep,
      userProgress: userActualProgress, // 使用实际进度值
      steps: steps.length > 0 ? steps : [{
        id: 1,
        step: 1,
        number: achievement.maxProgress,
        reward_amount: achievement.totalReward?.toString() || '0',
        reward_currency: achievement.rewardCurrency || 'BUCK',
        completed: achievement.completed
      }]
    }
  }
  
  // 处理成就卡片点击
  const handleAchievementClick = (index: number) => {
    // 检查是否未登录或VIP等级不足
    if (isAchievementLocked) {
      setIsLockedModalOpen(true)
    } else {
      // 已登录且VIP等级足够，打开详情弹窗
      const achievement = displayAchievements[index]
      setSelectedAchievement(achievement)
      setIsDetailsModalOpen(true)
    }
  }
  
  // 关闭详情弹窗
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedAchievement(null)
  }


  const headerContent = (
    <div className="flex items-center gap-x-2 h-8">
      <Iconify icon="custom:achievement" className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      <p className="text-base md:text-xl font-semibold">Achievements</p>
    </div>
  )

  // 计算移动端合适的高度
  // 每行3个卡片，根据成就数量计算需要的行数
  const achievementCount = displayAchievements.length
  
  // 计算合适的高度类
  const getMobileHeightClass = () => {
    if (!isMobile) return ''
    
    if (achievementCount === 0) {
      return 'h-[400px]' // 空状态给足够空间显示提示
    }
    
    // 根据成就数量动态调整高度
    if (achievementCount <= 3) {
      return 'h-[350px]' // 1行卡片
    } else if (achievementCount <= 6) {
      return 'h-[450px]' // 2行卡片  
    } else if (achievementCount <= 9) {
      return 'h-[550px]' // 3行卡片
    } else {
      return 'max-h-[75vh] min-h-[600px]' // 超过3行时使用滚动
    }
  }

  return (
    <>
    <Modal
      position={isMobile ? 'modal-bottom' : 'modal-middle'}
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent}
      className={cn(
        "bg-base-400 md:w-[600px] max-w-2xl mx-auto overflow-hidden",
        isMobile ? getMobileHeightClass() : "md:max-h-[600px]"
      )}
    >
      <div className={cn(
        "flex flex-col h-full",
        isMobile ? "overflow-hidden" : "max-h-[calc(600px-120px)]"
      )}>
        
        {/* Achievement Grid - Scrollable */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          isMobile && achievementCount <= 6 ? "overflow-hidden" : ""
        )}>
          <div className="bg-base-400 rounded-field p-0 sm:p-4">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                <p className="text-base-content/60">Loading achievements...</p>
              </div>
            )}
            
            {/* Achievements Grid */}
            {!isLoading && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {displayAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative rounded-box transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg overflow-hidden",
                    achievement.completed && "bg-primary/10"
                  )}
                  onClick={() => handleAchievementClick(index)}
                >
                  {/* Liquid Glass Effect - with pointer-events-none to prevent click interference */}
                  <LiquidGlassEffect
                    className="absolute inset-0 pointer-events-none h-full w-full"
                  >
                    <div className="w-full h-full"></div>
                  </LiquidGlassEffect>
                  
                  <div className="relative z-10 p-2 sm:p-3 h-full flex flex-col">
                    {/* Achievement Icon */}
                    <div className="flex justify-center mb-0.5 sm:mb-2">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative">
                      <img
                        src={achievement.icon}
                        alt={achievement.name}
                        className="w-8 h-8 sm:w-12 sm:h-12 object-contain transition-all duration-300"
                        style={{
                          filter: cardColors[achievement.id] 
                            ? `drop-shadow(0 0 12px ${cardColors[achievement.id]}) drop-shadow(0 0 36px ${cardColors[achievement.id].replace('0.15', '0.6')})`
                            : undefined
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement
                          handleImageLoad(achievement.id, target)
                        }}
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <Iconify 
                        icon="custom:achievement" 
                        className="w-8 h-8 sm:w-12 sm:h-12 text-primary hidden" 
                      />
                    </div>
                  </div>

                  {/* Achievement Name - fixed height container */}
                  <div className="h-8 sm:h-6 flex items-start justify-center mb-0.5 sm:mb-1">
                    <h3 className="text-xs sm:text-sm font-bold text-center text-base-content/90 leading-tight line-clamp-2">
                      {achievement.name}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-1 sm:mb-2">
                  <div className="w-full bg-base-100/30 rounded-full h-1.5 mb-2 px-2">
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          achievement.completed ? 'bg-primary' : 'bg-primary'
                        )}
                        style={{
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-base-content/60">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>

                  </div>

                    {/* Achievement Description - hidden on mobile */}
                    <p className="text-xs text-base-content/50 text-center leading-tight hidden md:block">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && displayAchievements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Iconify icon="custom:achievement" className="w-12 h-12 text-base-content/30 mb-4" />
                <p className="text-base-content/60 font-medium">No achievements available</p>
                <p className="text-xs text-base-content/40 mt-1">Check back later for new achievements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
    
    {/* Achievement Details Modal */}
    {selectedAchievement && (
      <BonusAchievementsDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        achievement={convertToAchievementDetail(selectedAchievement, achievementsData)}
      />
    )}
    
    {/* Achievement Locked Modal */}
    <BonusAchievementsLockedModal
      isOpen={isLockedModalOpen}
      onClose={() => setIsLockedModalOpen(false)}
    />
    </>
  )
}
