import Iconify from "@/components/iconify";
import Copy from "@/components/ui/Copy.tsx";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { ReferralShareModal } from "@/sections/referral/referral-share-modal.tsx";
import { useState, useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useReferralLink } from "@/hooks/useReferralLink.ts";
import clsx from "clsx";

export const InnerNotAuthenticated = () => {
  const { t } = useTranslation();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <div
      className="relative min-h-[252px] z-0 mx-5 sm:mx-0 sm:absolute sm:w-[600px] sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
      <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full -z-10">
        <div className="w-full h-full"></div>
      </LiquidGlassEffect>

      <div className="w-full h-full flex flex-col p-4 sm:p-6 justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">{t("referral:assembleYourCrewCashIn")}</h2>
          <div className="flex flex-col gap-3 text-sm sm:text-base text-base-content/70">
            <p className="leading-relaxed">
              <Trans
                i18nKey="referral:assembleYourCrewCashInDescription1"
                values={{ amount: formatWithConversion(1200, "USD", { showCode: false }).formatted, percentage: "50%" }}
              />
            </p>
            <p className="leading-relaxed">
              <Trans i18nKey="referral:assembleYourCrewCashInDescription2" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InnerReferralShareLink = ({ btnCls, linkCls, onClick }: { btnCls?: string, linkCls?: string, onClick?: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const { referralLink } = useReferralLink();
  const hasShareableLink = /^https?:\/\//i.test(referralLink);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && document.documentElement.dir === "rtl") {
      el.scrollLeft = -el.scrollWidth;
    }

    // 监听 dir 属性变化
    const observer = new MutationObserver(() => {
      if (el && document.documentElement.dir === "rtl") {
        el.scrollLeft = -el.scrollWidth;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"]
    });

    return () => observer.disconnect();
  }, [referralLink]);

  return (
    <>
      <div className="w-full flex flex-row items-center sm:h-12 gap-2 sm:gap-3">
        <div
          className={clsx("rounded-field flex-1 min-w-0 h-8 sm:h-full bg-base-400 flex items-center pl-1 pr-1 sm:px-4 gap-1 sm:gap-3", linkCls)}>
          <div
            className="flex-1 min-w-0 overflow-x-auto hide-scrollbar"
            ref={scrollRef}
          >
            <span className="text-base-content/50 text-xs sm:text-sm font-semibold whitespace-nowrap">
              {hasShareableLink
                ? referralLink
                : t("referral:loadingLink", "Loading link...")}
            </span>
          </div>
          <Copy
            text={hasShareableLink ? referralLink : ""}
            trigger={
              <button className="btn btn-primary btn-soft btn-square btn-xs sm:btn-sm shrink-0 rounded-md">
                <Iconify icon="custom:copied" />
              </button>
            }
          />
        </div>
        <button
          className={clsx("btn btn-primary btn-sm sm:btn-lg shrink-0 justify-center", btnCls)}
          onClick={() => {
            onClick?.();
            setIsShareModalOpen(true);
          }}
          disabled={!hasShareableLink}
        >
          <Iconify icon="custom:share" />
          <span>{t("bonus:share")}</span>
        </button>
      </div>
      <ReferralShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)}
                          referralLink={referralLink} />
    </>
  );
};

export const InnerLiquidGlassEffect = () => {
  return (
    <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full -z-10">
      <div className="w-full h-full"></div>
    </LiquidGlassEffect>
  );
};
