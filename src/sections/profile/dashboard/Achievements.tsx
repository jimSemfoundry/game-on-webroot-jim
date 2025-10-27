import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { Carousel, useCarousel } from "@/components/carousel";
import { useUserAchievements } from "@/hooks/api/useAuth.ts";
import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { FastAverageColor } from "fast-average-color";
import { BonusAchievementsDetailsModal, BonusAchievementsLockedModal } from "@/sections/bonus";
import { cn } from "@/utils/themeMerger.ts";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect.tsx";
import { times } from "lodash-es";

export function Achievements() {
  const { t } = useTranslation();

  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: false, // 保持循环功能
    containScroll: "trimSnaps" // 防止滚动超出边界
  });

  const [cardColors, setCardColors] = useState<Record<string, string>>({})
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false)

  // 获取用户信息和VIP等级
  const { status, isAuthenticated, isInitialized } = useAuth()
  const userVipLevel = status?.vip || 0
  const isAchievementLocked = !isAuthenticated || userVipLevel < 2

  // 获取所有成就数据（包括用户进度）
  const { data: achievementsData, isLoading: isDataLoading } = useUserAchievements('asc')

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
  const achievements: any[] = useMemo(() => {
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

  // 将Achievement转换为AchievementDetail格式
  const convertToAchievementDetail = (achievement: any, rawData: any) => {
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
      const achievement = achievements[index]
      setSelectedAchievement(achievement)
      setIsDetailsModalOpen(true)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedAchievement(null)
  }

  return (
    <Card title={t("common.achievements")} icon={<Iconify icon='custom:profile-achievements' className='text-primary' />}>
      <Carousel carousel={carousel} className='mx-0'>
        {(isDataLoading || !isInitialized) && times(5,(i) => (<div key={i} className="skeleton h-31 md:h-37.5 w-28 rounded-box" />))}
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className={cn(
              "relative rounded-box cursor-pointer overflow-hidden w-27 h-full",
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

            <div className="relative z-10 p-2 sm:p-3 h-full flex flex-col justify-between gap-2">
              {/* Achievement Icon */}
              <div className="flex justify-center">
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
              <div className="flex items-start justify-center mb-0.5 sm:mb-1">
                <h3
                  className="text-xs sm:text-xs font-semibold text-center text-base-content/90 leading-tight line-clamp-2">
                  {achievement.name}
                </h3>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-base-content/10 rounded-full h-1 mb-2">
                  <div
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      achievement.completed ? 'bg-primary' : 'bg-primary'
                    )}
                    style={{
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-center">
                      <span className="text-[10px] text-base-content/60">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                </div>

              </div>
            </div>
          </div>
        ))}
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
      </Carousel>
    </Card>
  );
}
