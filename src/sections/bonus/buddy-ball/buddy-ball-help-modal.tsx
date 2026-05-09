import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useReferralLink } from "@/hooks/useReferralLink";
import { ReferralShareModal } from "../../referral/referral-share-modal";
import { useState } from "react";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface BuddyBallHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuddyBallHelpModal = ({ isOpen, onClose }: BuddyBallHelpModalProps) => {
  const { t } = useTranslation(['popup', 'casino', 'bonus']);
  const { referralLink } = useReferralLink();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const ILLUSTRATION_URL = useBonusDetailsImage("buddy_balls", 256);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
        <div className="flex flex-col gap-1">
          {/* 上方带渐变的独立卡片 */}
          <div
            className="rounded-box px-8 text-center relative overflow-hidden max-h-[140px] h-[140px] flex items-center"
            style={{
              background: `
                radial-gradient(100% 308% at 100% 0%, #75C300 0%, #0A2200 100%),
                linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
              `,
            }}
          >
            <div className="relative z-10 flex items-center h-full justify-between w-full">
              <h2 className="text-lg font-bold text-base-content text-start leading-5 whitespace-pre-line uppercase">
                {t("bonus:buddy_ball_title")}
              </h2>
              <img
                src={ILLUSTRATION_URL}
                alt={t("bonus:buddy_ball")}
                loading="lazy"
                decoding="async"
                className="w-[126px] h-[126px] object-contain"
              />
            </div>
          </div>

          {/* 下方独立的主卡片 - 包含close按钮 */}
          <div className="bg-base-400 rounded-box relative">
            {/* Close按钮 - 位于右上角 */}
            <button onClick={onClose} className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
              <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
            </button>

            <div className="flex flex-col gap-4 px-4 pt-5">
              {/* Bonus Details 标题 */}
              <div className="flex items-center gap-2">
                <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
              </div>

              <div className="max-h-[400px] overflow-y-auto pb-12 hide-scrollbar">
                {/* 描述文本 */}
                <p className="text-sm font-semibold">
                  {t("popup:buddy_ball_modal.get_more_buddy_balls")}
                </p>

                {/* Claim Distribution 区块 */}
                <div className="mt-4">
                  <div className="flex justify-between items-center bg-base-300 rounded-lg h-10 pr-1 pl-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-base-content/50 font-semibold">{t("popup:buddy_ball_modal.daily_check_in")}</span>
                      <span className="flex items-center">
                        <span className="text-xs text-primary font-semibold">2x</span>
                        <img src="/images/bonus/ball.png" loading="lazy" decoding="async" className="w-4.5 h-4.5" />
                      </span>
                    </div>
                    <button className="btn btn-primary h-8">
                      {t("bonus:go")}
                    </button>
                  </div>
                  <div className="flex justify-between items-center rounded-lg h-10 pr-2 pl-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-base-content/50 font-semibold">{t("popup:buddy_ball_modal.refer_a_friend")}</span>
                      <span className="flex items-center">
                        <span className="text-xs text-primary font-semibold">1x</span>
                        <img src="/images/bonus/ball.png" loading="lazy" decoding="async" className="w-4.5 h-4.5" />
                      </span>
                    </div>
                    <div className="text-xs text-base-content/50 font-semibold">
                      +10
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-base-300 rounded-lg h-10 pr-2 pl-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-base-content/50 font-semibold">{t("popup:buddy_ball_modal.referral_first_deposit")}</span>
                      <span className="flex items-center">
                        <span className="text-xs text-primary font-semibold">5x</span>
                        <img src="/images/bonus/ball.png" alt="" className="w-4.5 h-4.5" />
                      </span>
                    </div>
                    <div className="text-xs text-base-content/50 font-semibold">
                      +10
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-base-300 h-16 rounded-xl flex items-center px-4"
                  style={{
                    backgroundImage:
                      `repeating-linear-gradient(
                        -45deg,
                        oklch(from var(--color-base-200) l c h / 0.1) 0px,
                        oklch(from var(--color-base-200) l c h / 0.1) 6px,
                        oklch(from var(--color-base-300) l c h / 0.3) 6px,
                        oklch(from var(--color-base-300) l c h / 0.3) 12px,
                        oklch(from var(--color-base-200) l c h / 0.1) 12px,
                        oklch(from var(--color-base-200) l c h / 0.1) 18px
                      )`
                  }}
                >
                  <div className="w-full flex flex-row items-center h-8 gap-2">
                    <div className="rounded-field flex-1 min-w-0 h-10 sm:h-full bg-base-400 flex items-center px-2 sm:px-4 gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                        <span className="text-base-content/50 text-xs sm:text-base font-semibold whitespace-nowrap">
                          {referralLink || t("referral:loadingLink", "Loading link...")}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary h-8 shrink-0 justify-center gap-2"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <Iconify icon="custom:share" />
                      <span>{t("bonus:share")}</span>
                    </button>
                  </div>
                </div>

                {/* Expiration 区块 */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3">{t("bonus:expiration")}</h4>
                  <p className="text-xs text-base-content/50 leading-5">
                    {t("popup:tournament.expirationDesc")}
                  </p>

                </div>

                {/* General Terms 区块 */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3">{t("bonus:general_terms")}</h4>
                  <p className="text-xs text-base-content/50 leading-5">
                    {t("popup:tournament.generalTermsDesc1")}
                  </p>
                  <p className="text-xs text-base-content/50 leading-5 mt-4">
                    {t("popup:tournament.generalTermsDesc2")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <ReferralShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        referralLink={referralLink}
      />
    </>
  );
};
