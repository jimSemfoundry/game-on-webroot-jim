import Iconify from "@/components/iconify";
import Copy from "@/components/ui/Copy";
import { useTranslation } from "react-i18next";

export const ReferralGlobal = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-field bg-base-200 p-4 w-full">
      <div className="flex items-center gap-2">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-primary animate-ping"></div>
          <div className="status status-primary"></div>
        </div>
        <h3 className="text-sm font-semibold sm:text-lg">Live Global Commissions</h3>
      </div>

      <div className="bg-base-300 rounded-field p-4 flex gap-4 flex-col sm:flex-row mt-3">
        <div className="hidden sm:flex sm:items-center sm:justify-center sm:shrink-0">
          <img 
            src="/images/illustrations/bf0550f180085d4abf8fa72e098805ddcd2858b9.png" 
            alt="Referral illustration" 
            className="w-[140px] h-[140px] object-contain"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-1">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold sm:text-2xl">{t("referral:assembleYourCrewCashIn")}</h3>
            <p className="text-xs text-base-content/50 sm:text-sm">
              {t("referral:assembleYourCrewCashInDescription1", { amount: 100, percentage: "25%" })}
            </p>
            <p className="text-xs text-base-content/50 sm:text-sm">{t("referral:assembleYourCrewCashInDescription2")}</p>
          </div>
          <h3 className="text-base text-base-content/50 font-semibold sm:hidden">{t("referral:quickShare")}</h3>
          <div className="flex items-center justify-around sm:hidden">
            <div className="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center">
              <Iconify icon="custom:telegram-2" className="w-5 h-5" />
            </div>
            <div className="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center">
              <Iconify icon="custom:whats-app" className="w-5 h-5" />
            </div>
            <div className="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center">
              <Iconify icon="custom:facebook-messenger" className="w-5 h-5" />
            </div>
            <div className="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center">
              <Iconify icon="custom:facebook" className="w-5 h-5" />
            </div>
            <div className="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center">
              <Iconify icon="custom:instagram" className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-base hidden sm:block font-bold">Referral Links</h3>
          <div className="flex flex-col items-center gap-1 sm:flex-row">
            <div className="rounded-field flex-1 min-w-0 min-h-10 sm:h-full bg-base-400 flex items-center px-4 sm:px-4 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                <span className="text-base-content/50 text-xs sm:text-base font-semibold whitespace-nowrap">
                  https://t.me/gamebot/start?1234
                </span>
              </div>
              <Copy
                text="https://t.me/gamebot/start?1234"
                trigger={
                  <button className="btn btn-primary btn-ghost btn-square btn-xs sm:btn-sm shrink-0">
                    <Iconify icon="custom:copied" className="text-primary h-4 w-4" />
                  </button>
                }
              />
            </div>

            <div className="rounded-field flex-1 min-w-0 min-h-10 sm:h-full bg-base-400 flex items-center px-4 sm:px-4 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                <span className="text-base-content/50 text-xs sm:text-base font-semibold whitespace-nowrap">
                  https://t.me/gamebot/start?1234
                </span>
              </div>
              <Copy
                text="https://t.me/gamebot/start?1234"
                trigger={
                  <button className="btn btn-primary btn-ghost btn-square btn-xs sm:btn-sm shrink-0">
                    <Iconify icon="custom:copied" className="text-primary h-4 w-4" />
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
