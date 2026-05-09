import { useAuth } from "@/contexts/AuthContext";
import { useBonusSwitch, useUserAchievements } from "@/hooks/api/useAuth";
import { cn } from "@/utils/themeMerger";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { BonusAchievementsDetailsModal } from "./bonus-achievements-details-modal";
import { BonusAchievementsLockedModal } from "./bonus-achievements-locked-modal";
import { AchievementStep } from "@/types/bonus";
import { Carousel, useCarousel } from "@/components/carousel";
import { Card } from "@/sections/profile/c/Card.tsx";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  bg: string;
  rgba: string;
  btnText: string;
  link?: string;
  modal?: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  steps: AchievementStep[];
}

// 成就背景渐变配置
const ACHIEVEMENT_BACKGROUNDS = {
  achievement_verify_email: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(176, 36, 56, 0.4) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_verify_email_rgba: "rgba(176, 36, 56, 0.4)",
  achievement_super_verify_phone: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(0, 231, 192, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_super_verify_phone_rgba: "rgba(0, 231, 192, 0.2)",
  achievement_super_spreader: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(190, 251, 254, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_super_spreader_rgba: "rgba(190, 251, 254, 0.2)",
  achievement_champion: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(165, 145, 64, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_champion_rgba: "rgba(165, 145, 64, 0.2)",
  achievement_conquistador: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(255, 42, 80, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_conquistador_rgba: "rgba(255, 42, 80, 0.2)",
  achievement_game_explorer: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(114, 95, 229, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_game_explorer_rgba: "rgba(114, 95, 229, 0.2)",
  achievement_card_shark: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(255, 42, 80, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_card_shark_rgba: "rgba(255, 42, 80, 0.2)",
  achievement_slot_master: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(186, 24, 50, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_slot_master_rgba: "rgba(186, 24, 50, 0.2)",
  achievement_the_challenger: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(44, 129, 254, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_the_challenger_rgba: "rgba(44, 129, 254, 0.2)",
  achievement_dynamo: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(84, 129, 255, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_dynamo_rgba: "rgba(84, 129, 255, 0.2)",
  achievement_face_of_fortune: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(255, 220, 80, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_face_of_fortune_rgba: "rgba(255, 220, 80, 0.2)",
  achievement_name_of_fame: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(99, 108, 147, 0.4) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_name_of_fame_rgba: "rgba(99, 108, 147, 0.4)",
  achievement_guiding_star: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(186, 211, 14, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_guiding_star_rgba: "rgba(186, 211, 14, 0.2)",
  achievement_highroller: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(255, 42, 80, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_highroller_rgba: "rgba(255, 42, 80, 0.2)",
  achievement_inferno: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(73, 222, 22, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
  achievement_inferno_rgba: "rgba(73, 222, 22, 0.2)",
  achievement_money_maverick: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(0, 124, 39, 0.2) 0%, rgba(15, 20, 26, 0) 100%)",
  achievement_money_maverick_rgba: "rgba(0, 124, 39, 0.2)",
  achievement_money_master: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(201, 112, 40, 0.2) 0%, rgba(15, 20, 26, 0) 100%)",
  achievement_money_master_rgba: "rgba(201, 112, 40, 0.2)",
  achievement_crypto_bro: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(169, 107, 25, 0.2) 0%, rgba(15, 20, 26, 0) 100%)",
  achievement_crypto_bro_rgba: "rgba(169, 107, 25, 0.2)",
  achievement_crypto_baron: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(174, 29, 81, 0.2) 0%, rgba(15, 20, 26, 0) 100%)",
  achievement_crypto_baron_rgba: "rgba(174, 29, 81, 0.2)",
  achievement_chain_shifter: "radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(183, 112, 2, 0.2) 0%, rgba(15, 20, 26, 0) 100%)",
  achievement_chain_shifter_rgba: "rgba(183, 112, 2, 0.2)"
} as const;

// 成就图标和背景配置
const ACHIEVEMENT_CONFIG: Record<string, {
  icon: string;
  bg: string;
  rgba: string,
  btnText: string;
  link?: string;
  modal?: string
}> = {
  achievement_verify_email: {
    icon: "/images/achievement/email.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_verify_email,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_verify_email_rgba,
    btnText: "bonus:go",
    link: "/profile?tab=security"
  },
  achievement_verify_phone: {
    icon: "/images/achievement/phone.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_super_verify_phone,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_super_verify_phone_rgba,
    btnText: "bonus:go",
    link: "/profile?tab=security"
  },
  achievement_super_spreader: {
    icon: "/images/achievement/super-spreader.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_super_spreader,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_super_spreader_rgba,
    btnText: "bonus:tell_a_friend",
    link: "/referral"
  },
  achievement_champion: {
    icon: "/images/achievement/champion.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_champion,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_champion_rgba,
    btnText: "bonus:play_now",
    link: "/casino"
  },
  achievement_conquistador: {
    icon: "/images/achievement/conquistador.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_conquistador,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_conquistador_rgba,
    btnText: "bonus:play_now",
    link: "/casino"
  },
  achievement_game_explorer: {
    icon: "/images/achievement/game-explorer.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_game_explorer,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_game_explorer_rgba,
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_card_shark: {
    icon: "/images/achievement/card-shark.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_card_shark,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_card_shark_rgba,
    btnText: "bonus:play_now",
    link: "/explore?category=poker"
  },
  achievement_slot_master: {
    icon: "/images/achievement/slot-master.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_slot_master,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_slot_master_rgba,
    btnText: "bonus:play_now",
    link: "/explore?type=slots"
  },
  achievement_the_challenger: {
    icon: "/images/achievement/the-challenger.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_the_challenger,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_the_challenger_rgba,
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_dynamo: {
    icon: "/images/achievement/dynamo.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_dynamo,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_dynamo_rgba,
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_change_avatar: {
    icon: "/images/achievement/face-of-fortune.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_face_of_fortune,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_face_of_fortune_rgba,
    btnText: "bonus:change_avatar_now",
    link: "/profile?tab=profile"
  },
  achievement_set_username: {
    icon: "/images/achievement/name-of-fame.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_name_of_fame,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_name_of_fame_rgba,
    btnText: "bonus:set_username_now",
    link: "/profile?tab=profile"
  },
  achievement_guiding_star: {
    icon: "/images/achievement/guiding-star.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_guiding_star,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_guiding_star_rgba,
    btnText: "bonus:add_to_home_screen",
    link: "/casino"
  },
  achievement_highroller: {
    icon: "/images/achievement/highroller.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_highroller,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_highroller_rgba,
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_inferno: {
    icon: "/images/achievement/inferno.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_inferno,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_inferno_rgba,
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_money_maverick: {
    icon: "/images/achievement/money-maverick.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_money_maverick,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_money_maverick_rgba,
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_money_master: {
    icon: "/images/achievement/money-master.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_money_master,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_money_master_rgba,
    btnText: "bonus:withdraw_now",
    link: "/finance?tab=withdraw"
  },
  achievement_crypto_bro: {
    icon: "/images/achievement/crypto-bro.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_crypto_bro,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_crypto_bro_rgba,
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_crypto_baron: {
    icon: "/images/achievement/crypto-baron.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_crypto_baron,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_crypto_baron_rgba,
    btnText: "bonus:withdraw_now",
    link: "/finance?tab=withdraw"
  },
  achievement_chain_shifter: {
    icon: "/images/achievement/chain-shifter.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter_rgba,
    btnText: "bonus:swap_now",
    link: "/finance?tab=swap"
  },
  achievement_first_swap_non_buck: {
    icon: "/images/achievement/chain-shifter.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter_rgba,
    btnText: "bonus:swap_now",
    modal: "OPEN_SWAP"
  },
  achievement_first_swap_buck: {
    icon: "/images/achievement/chain-shifter.png",
    bg: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter,
    rgba: ACHIEVEMENT_BACKGROUNDS.achievement_chain_shifter_rgba,
    btnText: "bonus:swap_now",
    modal: "OPEN_SWAP"
  }
};

const DEFAULT_ACHIEVEMENT_ICON = "/images/illustrations/achievement-champion.png";

export const BonusAchievementsList = ({
                                        enableCarousel = false,
                                        closeModal,
                                        layout = "grid"
                                      }: {
  enableCarousel?: boolean
  closeModal: () => void
  layout?: "grid" | "list"
}) => {
  const { t } = useTranslation();
  // const [cardColors, setCardColors] = useState<Record<string, string>>({})
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);

  const { isInitialized } = useAuth();
  const { data: achievementsData, isLoading: isDataLoading } = useUserAchievements("asc");
  const isLoading = !isInitialized || isDataLoading;

  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: false, // 保持循环功能
    containScroll: "trimSnaps" // 防止滚动超出边界
  });


  // const handleImageLoad = useCallback(async (achievementId: string, imgElement: HTMLImageElement) => {
  //   try {
  //     // 使用 extractVibrantColor 工具函数
  //     const { rgb } = await extractVibrantColor(imgElement.src)

  //     if (rgb) {
  //       const shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`
  //       setCardColors(prev => ({ ...prev, [achievementId]: shadowColor }))
  //     }
  //   } catch (error) {
  //     if (import.meta.env.DEV) {
  //       console.warn('Failed to extract color for achievement:', achievementId, error)
  //     }
  //   }
  // }, [])

  const achievements: Achievement[] = useMemo(() => {
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) {
      return [];
    }

    return achievementsData.data.map((achievement: any) => {
      const achievementSteps = achievement.achievementStep || [];
      const sortedSteps = [...achievementSteps].sort((a: any, b: any) => a.step - b.step);
      const completedSteps = sortedSteps.filter((s: any) => s.is_finish === true);
      const progress = completedSteps.length;
      const maxProgress = sortedSteps.length;
      const completed = progress === maxProgress && maxProgress > 0;

      const achievementKey = achievement.key || "";
      const translationKey = `bonus:${achievementKey}`;
      const achievementTranslation = t(translationKey, { returnObjects: true });
      const shortDescriptionKey = `bonus:${achievementKey}.description`;

      let translatedName = achievement.name;
      if (typeof achievementTranslation === "object" && achievementTranslation && "name" in achievementTranslation) {
        translatedName = (achievementTranslation as any).name || achievement.name;
      }

      let shortDescription = t(shortDescriptionKey, { defaultValue: null });
      if (!shortDescription || shortDescription === shortDescriptionKey) {
        shortDescription = achievement.description || achievement.note || "";
      }

      const config = ACHIEVEMENT_CONFIG[achievement.key] || { icon: DEFAULT_ACHIEVEMENT_ICON, bg: "" };

      return {
        id: achievement.id.toString(),
        key: achievement?.key || "",
        name: translatedName,
        description: shortDescription,
        icon: config.icon,
        bg: config.bg,
        rgba: config.rgba || "",
        btnText: config.btnText,
        link: config.link,
        modal: config.modal,
        progress,
        maxProgress,
        completed,
        steps: sortedSteps
      };
    });
  }, [achievementsData, t]);

  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);

  const handleAchievementClick = (achievementId: string) => {
    setSelectedAchievementId(achievementId);
  };

  useEffect(() => {
    if (selectedAchievementId) {
      setSelectedAchievement(achievements.find((achievement) => achievement.id === selectedAchievementId) || null);
      setIsDetailsModalOpen(true);
    }
  }, [selectedAchievementId, achievements]);

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAchievement(null);
    setSelectedAchievementId(null);
  };

  const completedAchievements = useMemo(
    () => achievements.filter((achievement: Achievement) => achievement.progress > 0),
    [achievements]
  );

  const achievementCards = (data: Achievement[]) => {

    return data.map((achievement) => {
      const isClaimable = achievement.steps.some((step) => step.is_finish && !step.is_claim);

      return (
      <InnerGuardAchievementContainer
        key={achievement.id}
        item={achievement}>
        {layout === "list" && !enableCarousel ? (
          <div
            className={cn(
              "h-[80px] rounded-field border bg-base-200 p-4 transition-all duration-200 cursor-pointer",
              "hover:bg-base-200/90",
              isClaimable ? "border-warning" : "border-base-200/60"
            )}
            onClick={() => handleAchievementClick(achievement.id)}
          >
            <div className="flex h-full items-center gap-3">
              <div className="size-[50px] flex items-center justify-center shrink-0">
                <img src={achievement.icon} alt={achievement.name} className="size-[50px] object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-base-content truncate">{achievement.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 bg-base-content/20 rounded-full flex-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-base-content/50">{achievement.progress}/{achievement.maxProgress}</span>
                </div>
              </div>
              {isClaimable ? (
                <button
                  type="button"
                  className="btn btn-primary btn-md sm:btn-lg w-[80px]"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAchievementClick(achievement.id);
                  }}
                >
                  {t("bonus:claim")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-square btn-sm bg-primary/20 border-0 text-primary hover:bg-primary/30"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAchievementClick(achievement.id);
                  }}
                >
                  <Iconify icon="mdi:chevron-right" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
        <div
          className={cn(
            enableCarousel ? "relative rounded-box cursor-pointer overflow-hidden w-28 md:w-32 h-full" : "relative rounded-box transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg overflow-hidden",
            achievement.completed && "bg-primary/10"
          )}
          onClick={() => handleAchievementClick(achievement.id)}
        >
          <LiquidGlassEffect className="absolute inset-0 pointer-events-none h-full w-full">
            <div className="w-full h-full" />
          </LiquidGlassEffect>

          <div className="relative z-10 p-2 sm:p-3 h-full flex flex-col gap-1 justify-between">
            <div className="flex justify-center mb-0.5 sm:mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative"
              >
                <img
                  src={achievement.icon}
                  alt={achievement.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain transition-all duration-300"
                  style={{
                    filter: achievement.rgba
                      ? `drop-shadow(0 0 32px ${achievement.rgba}) drop-shadow(0 0 56px ${achievement.rgba.replace("1", "1")})`
                      : undefined
                  }}
                  //   target.nextElementSibling?.classList.remove('hidden')
                  // }}
                />
                <Iconify
                  icon="custom:achievement"
                  className="w-8 h-8 sm:w-12 sm:h-12 text-primary hidden"
                />
              </div>
            </div>

            <div className="flex items-start justify-center mb-0.5 sm:mb-1">
              <h3
                className="text-xs sm:text-sm font-bold text-center text-base-content/90 leading-tight line-clamp-2">
                {achievement.name}
              </h3>
            </div>

            <div className="mb-1 sm:mb-2">
              <div className="w-full bg-primary/20 rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-300 bg-primary"
                  style={{
                    width: `${achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-xs text-base-content/60">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}
      </InnerGuardAchievementContainer>
      );
    });
  };

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary mb-4" />
          <p className="text-base-content/60">{t("bonus:loading_achievements")}</p>
        </div>
      )}

      {!isLoading && (
        <>
          {enableCarousel ? (
            completedAchievements.length > 0 && (
              <Card
                title={t("common.achievements")}
                icon={<Iconify icon="custom:profile-achievements" className="text-primary" />}
              >
                <Carousel carousel={carousel} className="mx-0">
                  {achievementCards(completedAchievements)}
                </Carousel>
              </Card>
            )
          ) : (
            <div className={cn(layout === "list" ? "grid grid-cols-1 gap-3 px-1 pb-2 sm:grid-cols-2 xl:grid-cols-4" : "grid grid-cols-3 gap-1.5 sm:gap-3 px-2 pb-2")}>
              {achievementCards(achievements)}
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && achievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Iconify icon="custom:achievement" className="w-12 h-12 text-base-content/30 mb-4" />
          <p className="text-base-content/60 font-medium">{t("bonus:no_achievements_available")}</p>
          <p className="text-xs text-base-content/40 mt-1">{t("bonus:check_back_later_for_new_achievements")}</p>
        </div>
      )}


      {/* Achievement Details Modal */}
      {selectedAchievement && (
        <BonusAchievementsDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onCloseModal={closeModal}
          achievement={selectedAchievement}
        />
      )}

      {/* Achievement Locked Modal */}
      <BonusAchievementsLockedModal
        isOpen={isLockedModalOpen}
        onClose={() => setIsLockedModalOpen(false)}
      />
    </>
  );
};


export const InnerGuardAchievementContainer = (
  {
    item,
    children,
    additional
  }: PropsWithChildren<{
    item: Record<string, any>
    additional?: boolean
  }>
) => {
  const { switchData } = useBonusSwitch();

  const is_achievement_verify_email = useMemo(() => switchData?.bonus_switch?.achievement_verify_email === 0 && (item?.id === 1 || item?.achievement_id === 1), [item, switchData]);
  const is_achievement_verify_phone = useMemo(() => switchData?.bonus_switch?.achievement_verify_phone === 0 && (item?.id === 2 || item?.achievement_id === 2), [item, switchData]);
  const is_achievement_add_desktop_app = useMemo(() => switchData?.bonus_switch?.achievement_add_desktop_app === 0 && (item?.id === 3 || item?.achievement_id === 3), [item, switchData]);
  const is_achievement_super_spreader = useMemo(() => switchData?.bonus_switch?.achievement_super_spreader === 0 && (item?.id === 4 || item?.achievement_id === 4), [item, switchData]);
  const is_achievement_conquistador = useMemo(() => switchData?.bonus_switch?.achievement_conquistador === 0 && (item?.id === 5 || item?.achievement_id === 5), [item, switchData]);
  const is_achievement_game_explorer = useMemo(() => switchData?.bonus_switch?.achievement_game_explorer === 0 && (item?.id === 6 || item?.achievement_id === 6), [item, switchData]);
  const is_achievement_slot_master = useMemo(() => switchData?.bonus_switch?.achievement_slot_master === 0 && (item?.id === 8 || item?.achievement_id === 8), [item, switchData]);
  const is_achievement_change_avatar = useMemo(() => switchData?.bonus_switch?.achievement_change_avatar === 0 && (item?.id === 9 || item?.achievement_id === 9), [item, switchData]);
  const is_achievement_set_username = useMemo(() => switchData?.bonus_switch?.achievement_set_username === 0 && (item?.id === 10 || item?.achievement_id === 10), [item, switchData]);
  const is_achievement_first_swap_non_buck = useMemo(() => switchData?.bonus_switch?.achievement_first_swap_non_buck === 0 && (item?.id === 11 || item?.achievement_id === 11), [item, switchData]);
  const is_achievement_first_swap_buck = useMemo(() => switchData?.bonus_switch?.achievement_first_swap_buck === 0 && (item?.id === 12 || item?.achievement_id === 12), [item, switchData]);

  return (
    additional ||
    is_achievement_slot_master ||
    is_achievement_verify_email ||
    is_achievement_verify_phone ||
    is_achievement_conquistador ||
    is_achievement_set_username ||
    is_achievement_change_avatar ||
    is_achievement_game_explorer ||
    is_achievement_super_spreader ||
    is_achievement_add_desktop_app ||
    is_achievement_first_swap_buck ||
  is_achievement_first_swap_non_buck
      ? null : children);
};