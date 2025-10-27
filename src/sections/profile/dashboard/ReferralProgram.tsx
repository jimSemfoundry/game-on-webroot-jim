import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import Copy from "@/components/ui/Copy.tsx";
import { Share2 } from "lucide-react";
import { useDefaultAdTag } from "@/hooks/api/useAuth.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import Iconify from "@/components/iconify";
import { Card } from "@/sections/profile/c/Card.tsx";

export function ReferralProgram() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: ad, isLoading: l1 } = useDefaultAdTag();

  const referralLink = useMemo(() => ad?.data?.code ? `${location.origin}?startapp=${ad?.data?.code}` : "", [ad]);

  return (
    <Card title={t("common.referralProgram")} icon={<Iconify icon='custom:profile-referral-program' className='text-primary' />}
          className="sm:max-w-[335px]">
      <div className="flex flex-col gap-3 rounded-lg p-4 bg-base-300"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            oklch(from var(--color-base-100) l c h / 0.1) 0px,
            oklch(from var(--color-base-100) l c h / 0.1) 4px,
            oklch(from var(--color-base-300) l c h / 0.2) 4px,  
            oklch(from var(--color-base-300) l c h / 0.2) 12px,
            oklch(from var(--color-base-100) l c h / 0.1) 12px,
            oklch(from var(--color-base-100) l c h / 0.1) 16px
          )`
        }}
      >
        <div className="flex items-center gap-4 md:flex-col">
          <img src="/icons/isometric/29.png" className="h-12 w-12" alt="" />
          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm font-bold">Invite and Get Rewarded</p>
            <p className="text-primary/80 text-xs font-semibold">
              {t("common.upToAmountCommission", {
                amount: formatWithConversion(1200, "USDT", { showSymbol: true, showCode: false }).formatted,
                commission: 50
              })}
            </p>
          </div>
        </div>
        <SmallLoading
          loading={l1}
          className="bg-base-400 !rounded-md h-8"
          content={<div className="flex gap-1 items-center">
            <p className="flex-1 truncate bg-base-200 rounded-md p-2 text-xs text-base-content/50 font-semibold md:max-w-50">{referralLink}</p>
            <Copy text={referralLink} trigger={<button className="btn btn-primary btn-sm">
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <p>{t("common.share")}</p>
              </div>
            </button>} />
          </div>} />
      </div>
    </Card>
  );
}
