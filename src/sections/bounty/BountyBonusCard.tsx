import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useBountyStatus, useMyWinList } from "@/hooks/api/useBounty";
import { Info } from "@/sections/bonus/components/Info";
import { BountyInfoModal } from "@/sections/bounty/BountyInfoModal";

const HERO_GRADIENT_LOGGEDOUT =
  "radial-gradient(circle at 100% 0%, rgba(105, 28, 173, 1) 0%, rgba(16, 20, 25, 1) 100%), #181D24";

/**
 * /bonus 页 Bounty 入口卡片，三态：
 * - 未登录: 紫色 radial 渐变 splash，整卡可点
 * - 已登录无可领奖: 与 Buddy Balls 同款 layout（深色 bg + Go 按钮 + Info）
 * - 已登录有可领奖: 在已登录态基础上叠 #F2C100 金色 inset 高亮 ring
 */
export function BountyBonusCard() {
  const { t } = useTranslation("bountyBonus");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const status = useBountyStatus(isAuthenticated);
  const myWin = useMyWinList(
    { claim_status: 0, page: 1, limit: 1 },
    isAuthenticated,
  );
  const [infoOpen, setInfoOpen] = useState(false);

  if (status.data && status.data.branch_enabled === false) return null;

  const goBounty = () => void navigate({ to: "/bounty" });

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={goBounty}
        className="w-full rounded-2xl overflow-hidden flex items-center justify-between p-4 h-[104px] sm:h-[140px] relative cursor-pointer"
        style={{ background: HERO_GRADIENT_LOGGEDOUT }}
      >
        <h3 className="text-lg font-extrabold uppercase text-white tracking-wide z-1 relative">
          {t("bountyTitle", "BOUNTY")}
        </h3>
        <img
          src="/images/bounty/bounty-figma.png"
          alt=""
          className="w-24 h-24 object-contain pointer-events-none select-none drop-shadow-[0_0_24px_rgba(196,224,44,0.35)]"
        />
      </button>
    );
  }

  const hasUnclaimed = (myWin.data?.count ?? 0) > 0;

  return (
    <>
      <div
        className={clsx(
          "flex items-center justify-between h-[104px] sm:h-[140px] bg-base-200 rounded-2xl p-4 gap-2",
          hasUnclaimed && "ring-2 ring-inset ring-[#F2C100]",
        )}
      >
        <div className="flex flex-col items-center w-full flex-1 self-stretch justify-center">
          <div className="flex items-center gap-4 w-full">
            <img
              src="/images/bounty/bounty-figma.png"
              loading="lazy"
              decoding="async"
              alt=""
              className="w-15 h-15 object-cover"
            />
            <div className="text-base-content whitespace-pre-line font-bold text-lg leading-5 uppercase">
              {t("bountyTitle", "BOUNTY")}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between self-stretch gap-2">
          <Info
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen(true);
            }}
          />
          <button
            className="btn btn-primary btn-md px-5 rounded-field self-center min-w-20 h-10"
            onClick={goBounty}
          >
            {t("bonus:go", "Go")}
          </button>
        </div>
      </div>

      <BountyInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
