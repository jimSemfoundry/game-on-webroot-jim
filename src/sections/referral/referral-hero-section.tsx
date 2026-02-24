import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReferralRewards } from "@/hooks/useReferralRewards";
import { ChevronRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";

type Props = { referralEnable: boolean, onNavigateToMyReferrals?: () => void };

const referralHeroImage = import.meta.env.VITE_REFERRAL_HERO_IMAGE || "https://cdn-a.imgix.net/banner/public/images/single-referral.png?auto=format,compress&q=10";

export const ReferralHeroSection = ({ referralEnable, onNavigateToMyReferrals }: Props) => {
  const { t } = useTranslation(['referral', 'common', 'casino']);
  const { isAuthenticated } = useAuth();
  const { formattedTotalRewards, networkCount, isLoading } = useReferralRewards();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col gap-4 px-5 pt-3 sm:px-12 relative overflow-hidden sm:bg-base-200/50 sm:min-h-[340px] sm:rounded-box sm:justify-center select-none"
        style={{
          backgroundImage: isMobile
            ? undefined
            : `repeating-linear-gradient(
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
        <div className="flex flex-col">
          <div className="flex items-center gap-4 w-full">
            <div className="h-[158px] sm:h-auto flex justify-center flex-col p-3 gap-1 sm:gap-3">
              <h1 className="text-2xl sm:text-[40px] font-black text-base-content uppercase leading-6 sm:leading-11">
                {t("common:common.referral")}
                <br />
                {t("common:common.bonus")}
                <br />
                <span className="text-primary">{formatWithConversion(1200, "USD", {
                  showSymbol: true,
                  showCode: false
                }).formatted} &</span>
                <br />
                <span className="text-primary">{t("casino:upTo")} 50%</span>
                <br />
                <span className="text-primary">{t("referral:commission")}</span>
              </h1>
            </div>
            <img
              src={referralHeroImage}
              alt=""
              className="object-cover w-[339px] object-top hidden sm:block absolute left-[364px] rtl:left-auto rtl:right-[364px] top-0 drop-shadow-[0px_0px_100px_rgba(44,116,145,0.3)]"
            />
          </div>
          <img
            src={referralHeroImage}
            alt=""
            className="absolute top-3 -right-2 rtl:right-auto rtl:left-2 object-cover w-[170px] object-top h-[158px] sm:hidden rtl:rotate-y-180"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 px-5 pt-3 sm:px-12 relative overflow-hidden sm:bg-base-200/50 sm:min-h-[340px] sm:rounded-box sm:justify-center select-none"
      style={{
        backgroundImage: isMobile
          ? undefined
          : `repeating-linear-gradient(
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
      <div className="flex flex-col">
        <div className="flex items-center gap-4 w-full">
          <InnerDisplayContent show={referralEnable}>
            <div className="h-[158px] sm:h-auto flex justify-center flex-col p-3 gap-1 sm:gap-2">
              <p className="text-sm sm:text-xl font-semibold text-base-content/50">
                <span className="block sm:inline max-w-[124px]">{t("referral:lifetimeReferralRewards")}</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-4">
                <Iconify icon="custom:referral-bonus" className="w-6 h-6 sm:w-13 sm:h-13" />
                <h1 className="text-2xl sm:text-5xl font-bold">
                  {isLoading ?
                    <span className="loading loading-dots loading-md"></span> : formattedTotalRewards.formatted}
                </h1>
              </div>
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                role="button"
                aria-label={t("referral:goToMyReferrals", "Go to My Referrals")}
                onClick={() => onNavigateToMyReferrals?.()}
              >
                <span className="font-semibold text-sm sm:text-base text-base-content/50">{t("referral:network")}</span>
                <div
                  className="bg-primary sm:w-5 sm:h-5 w-4 h-4 rounded-full text-xs sm:text-sm flex items-center justify-center text-primary-content font-semibold">
                  {isLoading ? "..." : networkCount}
                </div>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 text-base-content/50" />
              </div>
            </div>
          </InnerDisplayContent>
          <InnerDisplayContent show={!referralEnable}>
            <div
              className={"pl-3 h-[158px] sm:h-auto font-extrabold text-xl sm:text-4xl sm:leading-10 leading-6 whitespace-pre-line flex items-center"}>
              <p>
                <Trans
                  i18nKey="referral:referral_program_disabled"
                  components={[<span className={"text-primary"} />]}
                />
              </p>
            </div>
          </InnerDisplayContent>

          <img
            src={referralHeroImage}
            alt=""
            className="object-cover w-[339px] object-top hidden sm:block absolute left-[364px] xl:left-[264px] rtl:left-auto rtl:right-[364px] xl:rtl:right-[264px] top-0 drop-shadow-[0px_0px_100px_rgba(44,116,145,0.3)]  rtl:rotate-y-180"
          />
        </div>
        <img
          src={referralHeroImage}
          alt=""
          className="absolute top-3 -right-0 rtl:right-auto rtl:-left-2 object-cover w-[170px] object-top h-[158px] sm:hidden rtl:rotate-y-180"
        />
      </div>
    </div>
  );
};
