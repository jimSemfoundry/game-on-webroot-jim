import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReferralRewards } from "@/hooks/useReferralRewards";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = { onNavigateToMyReferrals?: () => void };

export const ReferralHeroSection = ({ onNavigateToMyReferrals }: Props) => {
  const { t } = useTranslation();
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
          )`,
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
                <span className="text-primary">{formatWithConversion(1200, "USD", { showSymbol: true, showCode: false }).formatted} &</span>
                <br />
                <span className="text-primary">{t("casino:upTo")} 50%</span>
                <br />
                <span className="text-primary">{t("referral:commission")}</span>
              </h1>
            </div>
            <img
              src="/images/illustrations/d929de0cb5c0f7c3aedb8f8e3245846644e68a31.png"
              alt=""
              className="object-cover w-[339px] object-top hidden sm:block absolute left-[364px] rtl:left-auto rtl:right-[364px] top-0 drop-shadow-[0px_0px_100px_rgba(44,116,145,0.3)]"
            />
          </div>
          <img
            src="/images/illustrations/d929de0cb5c0f7c3aedb8f8e3245846644e68a31.png"
            alt=""
            className="absolute top-3 -right-2 rtl:-right-auto rtl:-left-2 object-cover w-[170px] object-top h-[158px] sm:hidden"
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
        )`,
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-4 w-full">
          <div className="h-[158px] sm:h-auto flex justify-center flex-col p-3 gap-1 sm:gap-2">
            <p className="text-sm sm:text-xl font-semibold text-base-content/50">
              <span className="block sm:inline max-w-[124px]">{t("referral:lifetimeReferralRewards")}</span>
            </p>
            <div className="flex items-center gap-2 sm:gap-4">
              <Iconify icon="custom:referral-bonus" className="w-6 h-6 sm:w-13 sm:h-13" />
              <h1 className="text-2xl sm:text-5xl font-bold">
                {isLoading ? <span className="loading loading-dots loading-md"></span> : formattedTotalRewards.formatted}
              </h1>
            </div>
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              role="button"
              aria-label={t("referral:goToMyReferrals", "Go to My Referrals")}
              onClick={() => onNavigateToMyReferrals?.()}
            >
              <span className="font-semibold text-sm sm:text-base text-base-content/50">{t("referral:network")}</span>
              <div className="bg-primary sm:w-5 sm:h-5 w-4 h-4 rounded-full text-xs sm:text-sm flex items-center justify-center text-primary-content font-semibold">
                {isLoading ? "..." : networkCount}
              </div>
              <ChevronRight className="w-4 h-4 rtl:rotate-180 text-base-content/50" />
            </div>
          </div>
          <img
            src="/images/illustrations/d929de0cb5c0f7c3aedb8f8e3245846644e68a31.png"
            alt=""
            className="object-cover w-[339px] object-top hidden sm:block absolute left-[364px] rtl:left-auto rtl:right-[364px] top-0 drop-shadow-[0px_0px_100px_rgba(44,116,145,0.3)]"
          />
        </div>
        <img
          src="/images/illustrations/d929de0cb5c0f7c3aedb8f8e3245846644e68a31.png"
          alt=""
          className="absolute top-3 -right-2 rtl:-right-auto rtl:-left-2 object-cover w-[170px] object-top h-[158px] sm:hidden"
        />
      </div>
    </div>
  );
};
