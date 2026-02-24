import { Modal } from "@/components/ui/Modal";
import Iconify from "@/components/iconify";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation, Trans } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { Carousel, useCarousel } from "@/components/carousel";
import { Achievement } from "./bonus-achievements-list";
import { AchievementStep } from "@/types/bonus";
import { authService } from "@/services/authService";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth";
import { useBoundStore } from "@/store";
import { TActions } from "@/store/type";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { toast } from "sonner";

const DEFAULT_BACKGROUND_GRADIENT = `
  radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(139, 92, 246, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
  var(--color-base-400)
`;

const DEFAULT_ACHIEVEMENT_ICON = "/images/illustrations/achievement-champion.png";
const CASINO_ROUTE = "/casino";

type BonusAchievementsDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  onCloseModal: () => void
  achievement: Achievement
}

let temporary_data: number = -1; // 服务于claim出现非0｜200的错误的时候，需要重试时候的参数留存

export const BonusAchievementsDetailsModal = ({
  isOpen,
  onClose,
  onCloseModal,
  achievement
}: BonusAchievementsDetailsModalProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const queryClient = useQueryClient();

  const { setSyncAction } = useBoundStore();
  const { openUserFinanceModalWithTab } = useFinanceModal();

  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

  const startIndex = useMemo(() => {
    return achievement?.steps.findIndex((item: AchievementStep) => {
      return !(item?.is_finish === true && item?.is_claim === true);
    }) ?? 0;
  }, [achievement?.steps]);

  const carousel = useCarousel({
    loop: true,
    startIndex
  });

  const hasMultipleSteps = useMemo(() => {
    return (achievement?.steps?.length ?? 0) > 1;
  }, [achievement?.steps?.length]);

  const handlePrevious = () => {
    carousel.arrows.onClickPrev?.();
  };

  const handleNext = () => {
    carousel.arrows.onClickNext?.();
  };

  const formatRewardAmount = (step: AchievementStep) => {
    return formatWithConversion(
      parseFloat(step.reward_amount) || 0,
      step.reward_currency || "BUCK"
    ).formatted;
  };

  const [isLoading, setIsLoading] = useState(false);

  const doClaim = (reward_achievement_log_id: number) => {
    temporary_data = reward_achievement_log_id;

    setIsLoading(true);
    authService.claimAchievementBonus(reward_achievement_log_id).then((response) => {
      if (response.code === 0 || response.code === 200) {
        toast.success(t('toast:bonusClaimedSuccessfully'));

         openDoubleOrNothingModal({
            don_record_id: response?.data?.don_record_id,
            amount: response?.data?.amount
          });

        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userAchievements });
      } else {
        setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
          code: response.code,
          tryAgain: () => temporary_data > -1 && doClaim(temporary_data)
        });
        onCloseModal()
      }
    }).catch((error) => {
      console.info(error);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const doTask = () => {
    if (achievement?.modal) {
      if (achievement.modal === "OPEN_SWAP") {
        openUserFinanceModalWithTab(`swap_${randomString()}`)
      } else {
        setSyncAction(achievement.modal as TActions)
      }
      onClose()
      onCloseModal()
    }
    if (achievement?.link) {
      const url = new URL(decodeURIComponent(achievement?.link), window.location.origin);
      const pathname = url.pathname
      const searchParams = Object.fromEntries(url.searchParams?.entries() || []);
      void navigate({
        to: pathname || CASINO_ROUTE,
        search: searchParams
      });
    }
  }

  return (
    <>
      <Modal
        position={isMobile ? "modal-bottom" : "modal-middle"}
        isOpen={isOpen}
        onClose={onClose}
        hideTitle={true}
        zIndex={1006}
        className="md:w-[500px] max-w-lg mx-auto overflow-scroll bg-base-400"
      >
        <div
          className="flex flex-col -mx-5 -my-4 px-5 py-4"
          style={{ background: achievement?.bg || DEFAULT_BACKGROUND_GRADIENT }}
        >
          {/* Header Content */}
          <div className="flex items-center h-8 gap-x-2">
            <Iconify icon="custom:profile-achievements" className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <p className="text-base md:text-xl font-semibold">
              {t("bonus:achievement_details", { defaultValue: "Achievement Details" })}
            </p>
          </div>

          {/* Carousel Navigation and Achievement Icon */}
          <div className="flex items-center justify-between px-4 pt-6 relative overflow-hidden">
            {/* Previous Button */}
            {hasMultipleSteps ? (
              <button
                onClick={handlePrevious}
                className="btn btn-circle btn-ghost btn-sm z-10"
                aria-label={t("bonus:previous_step", { defaultValue: "Previous step" })}
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
                  src={achievement?.icon}
                  alt={achievement?.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ACHIEVEMENT_ICON;
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-center">
                {achievement?.name}
              </h2>
            </div>

            {/* Next Button */}
            {hasMultipleSteps ? (
              <button
                onClick={handleNext}
                className="btn btn-circle btn-ghost btn-sm z-10"
                aria-label={t("bonus:next_step", { defaultValue: "Next step" })}
              >
                <Iconify icon="mdi:chevron-right" className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>

          {/* Steps Carousel */}
          <div className="">
            <Carousel carousel={carousel}>
              {achievement?.steps.map((step: AchievementStep) => {
                return (
                  <div key={step.id} className="px-6 h-full flex flex-col gap-3">
                    {/* Step Level */}
                    <h2 className="text-sm font-bold text-center">
                      {t("bonus:level", { defaultValue: "Level" })} {step.step}
                    </h2>

                    {/* Progress Bar Section */}
                    {/* <div className="flex flex-col justify-center">
                    {showProgress ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-base-content/50">
                            {t('bonus:progress', { defaultValue: 'Progress' })}
                          </span>
                          <span className="text-sm text-base-content/50">
                            {achievement.progress} / {step.number}
                          </span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full" />
                    )}
                  </div> */}
                    {step.locked ?
                      <div className="text-sm font-bold mt-3 leading-7 text-center">{t("bonus:locked")}</div> :
                      (step.is_finish && step.is_claim) ?
                        <div
                          className="text-sm text-primary mt-3 leading-7 text-center font-bold">{t("bonus:achieved_on")} {dayjs.unix(step?.updated_at ? Number(step?.updated_at) : 0).format("D MMM YYYY")}</div> :
                        <>
                          <div className="flex justify-between text-sm mt-3">
                            <span>{t("bonus:progress")}: {(() => {
                              const percentage = new Decimal(step.finish_number ?? 0).div(step.total_number ?? 1).mul(100);
                              return percentage.mod(1).isZero() ? percentage.toString() : percentage.mul(100).floor().div(100).toFixed(2);
                            })()}%</span>
                            {
                              step?.achievement_name === "Slotmaster" ?
                                <span>
                                  {formatWithConversion(
                                    step?.finish_number || 0,
                                    step?.reward_currency || "BUCK"
                                    , { showCode: false }).formatted}
                                  {" / "}
                                  {formatWithConversion(
                                    step?.total_number || 0,
                                    step?.reward_currency || "BUCK"
                                    , { showCode: false }).formatted}
                                </span> :
                                <span>{new Decimal(step?.finish_number ?? 0).toString()} {" / "} {step?.total_number ?? 0}</span>
                            }
                          </div>
                          <progress className="progress progress-primary w-full mt-2" value={step?.finish_number ?? 0}
                            max={step?.total_number ?? 0}></progress>
                        </>
                    }

                    {/* Step Reward */}
                    <div className="h-[20px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/50">
                          {t("bonus:achievement_reward", { defaultValue: "Reward" })}
                        </span>
                        <span className="text-sm text-primary">
                          {formatRewardAmount(step)}
                        </span>
                      </div>
                    </div>

                    {/* Step Description */}
                    <div className="flex-1 min-h-[80px] flex items-start">
                      <div className="text-sm text-base-content/50 leading-relaxed">
                        {/* {getAchievementDescriptionComponent(achievement, step)} */}
                        {step.locked ?
                          <div>{t("bonus:unlock")}</div> :
                          <Trans
                            i18nKey={`bonus:${achievement.key}.description`}
                            values={{
                              count: step?.number,
                              amount: formatWithConversion(step?.total_number ?? 0,
                                step?.reward_currency ??'BUCK',
                                {showCode: false}
                              ).formatted
                            }}
                            components={[<span className="font-semibold text-primary" key="highlight" />
                            ]}
                          />
                        }
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="h-[48px] flex items-end">
                      {!step.is_claim && step.is_finish &&
                        <button className="btn btn-primary w-full btn-md h-[48px] mt-3"
                          disabled={isLoading}
                          onClick={() => doClaim(step.reward_achievement_log_id)}>{t("bonus:claim")}
                          {isLoading && <span className="loading loading-spinner loading-xs"></span>}
                        </button>}
                      {!step.is_finish && <button className="btn btn-primary w-full btn-md h-[48px] mt-3"
                        onClick={() => doTask()}>{t(`${achievement.btnText}`)}</button>}
                      {step.is_finish && step.is_claim && achievement.steps.length === 1 &&
                        <button className='btn btn-primary w-full btn-md h-[48px] mt-3'
                          onClick={() => onClose()}>{t('bonus:back')}</button>}
                      {step.is_finish && step.is_claim && achievement.steps.length > 1 &&
                        <button className="btn btn-primary w-full btn-md h-[48px] mt-3"
                          onClick={() => doTask()}>{t(achievement.btnText)}</button>}
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>
      </Modal>
    </>
  );
};
