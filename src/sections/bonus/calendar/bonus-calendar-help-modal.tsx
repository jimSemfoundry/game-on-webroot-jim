import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "react-i18next";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface BonusCalendarHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusCalendarHelpModal = ({ isOpen, onClose }: BonusCalendarHelpModalProps) => {
  const { t } = useTranslation(['popup', 'bonus']);
  const ILLUSTRATION_URL = useBonusDetailsImage("members_day", 192);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box px-5 py-2 text-center relative overflow-hidden min-h-[140px] flex items-center justify-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(92, 120, 240, 0.5) 0%, rgba(15, 20, 26, 0) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-base-content text-start leading-6">
                {t("popup:calendarTitle")
                  .split("\n")
                  .map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
              </h2>
              <div className="mt-2 bg-gradient-to-br  from-base-content/20 to-transparent border-0 rounded-field p-2 relative">
                <p className="text-xs font-bold mb-1 absolute top-0 -translate-y-1/2 left-0 badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[8px]">
                  {t("popup:calendarNextRelease")}
                </p>
                {/* Countdown will be implemented manually by user */}
                <div className="grid gap-1 grid-cols-3">
                  <div className="bg-base-400/50 rounded-field px-2 py-1">
                    <span className="text-base-content text-lg font-bold">07</span>
                    <p className="text-[8px] text-base-content/70">hours</p>
                  </div>
                  <div className="bg-base-400/50 rounded-field px-2 py-1">
                    <span className="text-base-content text-lg font-bold">59</span>
                    <p className="text-[8px] text-base-content/70">minutes</p>
                  </div>
                  <div className="bg-base-400/50 rounded-field px-2 py-1">
                    <span className="text-base-content text-lg font-bold">59</span>
                    <p className="text-[8px] text-base-content/70">seconds</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Calendar illustration will be implemented manually by user */}
            <div className="flex-shrink-0">
              <img src={ILLUSTRATION_URL} className="w-30 h-30" />
            </div>
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
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12">
              {/* 描述文本 */}
              <p className="text-xs text-base-content/50 leading-5">
                {t("popup:claimYourCalendarRewardsEvery8HoursUpTo3TimesADayJustAHeadsUpEachRewardExpiresIn24HoursSoGrabItWhileItLasts")}
              </p>

              {/* Release Frequency 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:releaseFrequency")}</p>
                <p className="text-lg font-bold text-primary">{t("popup:every8Hours")}</p>
              </div>

              {/* Next Release 区块 */}
              <div className="rounded-field mt-4">
                <p className="text-xs text-base-content/50">
                  <Trans
                    i18nKey="popup:nextReleaseIn"
                    values={{ time: "07h 43m 49s" }}
                    components={[<span className="text-primary" />]}
                  />
                </p>
              </div>

              {/* How is the Bonus Calculated 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:howIsBonusCalculated")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:howIsBonusCalculatedDesc")}</p>
              </div>

              {/* Expiration 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:expirationDesc")}</p>
              </div>

              {/* General Terms 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:generalTermsDesc1")}</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">{t("popup:generalTermsDesc2")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
