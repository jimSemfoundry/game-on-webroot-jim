import { useRTLContext } from "@/contexts/RTLContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { getIconDirection } from "@/utils/rtl";
import { cn } from "@/utils/themeMerger";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { m } from "motion/react";
import { useMemo, useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import Iconify from "../iconify";
import { Modal } from "../ui/Modal";
import { useConquestsCompleted, useClaimBonus } from "@/hooks/api/useAuth";
import { useNavigate } from "@tanstack/react-router";

export const BonusHub = () => {
  const { isMobile } = useSidebar();
  const { isRTL } = useRTLContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cashbackCountdown, setCashbackCountdown] = useState<string>("");

  // API数据查询
  const { data: conquestsCompleted } = useConquestsCompleted();
  const { data: tournamentData } = useClaimBonus("tournament");
  const { data: cashbackData } = useClaimBonus("cashback");

  // 计算距离UTC 0点的倒计时
  const getNextUTCMidnight = () => {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const nextUTCMidnight = new Date(utcNow);
    nextUTCMidnight.setUTCHours(24, 0, 0, 0);
    return nextUTCMidnight.getTime();
  };

  // 格式化倒计时
  const formatCountdown = (targetTime: number) => {
    const now = Date.now();
    const diff = targetTime - now;
    
    if (diff <= 0) {
      return "0h 0m 0s";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // 更新cashback倒计时
  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = getNextUTCMidnight();
      setCashbackCountdown(formatCountdown(targetTime));
    };

    updateCountdown(); // 立即更新一次
    const timer = setInterval(updateCountdown, 1000); // 每秒更新

    return () => clearInterval(timer);
  }, []);

  // 处理各个bonus的数据
  const bonusStats = useMemo(() => {
    // Conquests
    const completedCount = conquestsCompleted?.data?.completed_conquest || 0;
    const totalCount = conquestsCompleted?.data?.total_conquest || 0;
    const conquestsClaimable = conquestsCompleted?.data?.has_claim_value || 0;

    // Tournament
    const tournamentClaimable = parseFloat(tournamentData?.data?.data?.value || "0");

    // Cashback
    const cashbackArray = Array.isArray(cashbackData?.data?.data) ? cashbackData.data.data : [];
    const cashbackClaimable = cashbackArray.reduce((sum: number, item: any) => 
      sum + parseFloat(item.value || "0"), 0
    );

    // 计算总的待处理项数
    const totalPending = 
      (conquestsClaimable > 0 ? 1 : 0) +
      (tournamentClaimable > 0 ? 1 : 0) +
      (cashbackClaimable > 0 ? 1 : 0);

    return {
      conquests: {
        completed: completedCount,
        total: totalCount,
        claimable: conquestsClaimable,
      },
      tournament: {
        claimable: tournamentClaimable,
        ongoing: 3, // 暂时硬编码，可以后续从API获取
      },
      cashback: {
        claimable: cashbackClaimable,
      },
      totalPending,
    };
  }, [conquestsCompleted, tournamentData, cashbackData]);

  // 导航到bonus页面
  const handleNavigate = (_e: React.MouseEvent, path?: string) => {
    if (isMobile) {
      setIsOpen(false);
    }
    void navigate({ to: path || "/bonus" });
  };

  if (isMobile) {
    return (
      <>
        <button
          className="hidden btn btn-sm btn-square rounded-lg font-bold relative btn-ghost"
          onClick={() => setIsOpen(true)}
        >
          <m.img
            src="/icons/ui/gift-box.svg"
            alt="Bonus"
            className="w-7 h-7"
            animate={{
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
          {bonusStats.totalPending > 0 && (
            <div
              className={cn(
                "badge badge-primary badge-xs w-4 h-4 absolute -bottom-0.5",
                isRTL ? "-left-0.5" : "-right-0.5",
              )}
            >
              {bonusStats.totalPending}
            </div>
          )}
        </button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="bg-base-400 card card-xs"
          title={
            <div className="flex items-center gap-2">
              <Iconify icon="custom:bonus" className="w-5 h-5 text-primary" />
              <p className="text-sm md:text-base font-bold">
                {t("menu.bonus")}
              </p>
            </div>
          }
          position="modal-middle"
        >
          <div className="card-body">
            <div className="flex flex-col gap-2">
              <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(210,29,59,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
                <div className="flex items-center gap-x-4">
                  <img
                    src="/images/games/categories/flag.svg"
                    alt="flag"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col gap-y-1">
                    <h2 className="text-sm md:text-base font-bold">
                      {t("bonus:conquests")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      {bonusStats.conquests.completed}/{bonusStats.conquests.total} {t("bonus:completed")}
                    </p>
                  </div>

                  <button 
                    className="btn btn-square btn-soft btn-primary btn-sm ms-auto"
                    onClick={handleNavigate}
                  >
                    <ChevronRight
                      className={getIconDirection(isRTL, true)}
                      size={16}
                    />
                  </button>
                </div>
              </div>
              <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(246,109,25,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
                <div className="flex items-center gap-x-4">
                  <img
                    src="/images/games/categories/flag.svg"
                    alt="flag"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col gap-y-1">
                    <h2 className="text-sm md:text-base font-bold">
                      {t("menu:tournaments")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      {bonusStats.tournament.ongoing} {t("bonus:bonusHub.ongoing", { count: bonusStats.tournament.ongoing })}
                    </p>
                  </div>

                  <button 
                    className="btn btn-square btn-soft btn-primary btn-sm ms-auto"
                    onClick={handleNavigate}
                  >
                    <ChevronRight
                      className={getIconDirection(isRTL, true)}
                      size={16}
                    />
                  </button>
                </div>
              </div>
              <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(230,173,67,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
                <div className="flex items-center gap-x-4">
                  <img
                    src="/images/games/categories/trophy.png"
                    alt="trophy"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col gap-y-1">
                    <h2 className="text-sm md:text-base font-bold">
                      {t("bonus:daily_cashback")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      {bonusStats.cashback.claimable > 0 
                        ? t("bonus:bonusHub.claimable")
                        : <Trans i18nKey="bonus:bonusHub.accrualIn" values={{ time: cashbackCountdown }} />}
                    </p>
                  </div>

                  <button 
                    className="btn btn-square btn-soft btn-primary btn-sm ms-auto"
                    onClick={handleNavigate}
                  >
                    <ChevronRight
                      className={getIconDirection(isRTL, true)}
                      size={16}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="dropdown dropdown-center cursor-pointer z-10">
      <div tabIndex={0} role="button" className="btn btn-md gap-2">
        <m.img
          src="/icons/ui/gift-box.svg"
          alt="Bonus"
          className="w-7 h-7"
          animate={{
            rotate: [0, -5, 5, -5, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
        <span>{t("bonus:bonusHub.root")}</span>
        {bonusStats.totalPending > 0 && (
          <div className="badge badge-primary badge-xs w-4 h-4">{bonusStats.totalPending}</div>
        )}
        <ChevronDown
          className={cn("w-4 h-4", getIconDirection(isRTL, false))}
        />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card bg-base-400 card-xs md:card-sm z-1 w-[375px] shadow-sm"
      >
        <div className="card-body">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:bonus" className="w-5 h-5 text-primary" />
            <p className="text-sm md:text-base font-bold">{t("menu:bonus")}</p>
            <button
              className="btn btn-sm btn-square"
              onClick={() => (document.activeElement as HTMLElement)?.blur()}
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-base-content/50" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(210,29,59,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
              <div className="flex items-center gap-x-4">
                <img
                  src="/images/games/categories/flag.svg"
                  alt="flag"
                  className="w-8 h-8"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-sm md:text-base font-bold">
                    {t("bonus:conquests")}
                  </h2>
                  <p className="text-xs md:text-sm text-base-content/50 font-normal">
                    {bonusStats.conquests.completed}/{bonusStats.conquests.total} {t("bonus:completed")}
                  </p>
                </div>

                <button 
                  className="btn btn-square btn-soft btn-primary ms-auto"
                  onClick={handleNavigate}
                >
                  <ChevronRight
                    className={getIconDirection(isRTL, true)}
                    size={16}
                  />
                </button>
              </div>
            </div>
            <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(246,109,25,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
              <div className="flex items-center gap-x-4">
                <img
                  src="/images/games/categories/flag.svg"
                  alt="flag"
                  className="w-8 h-8"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-sm md:text-base font-bold">
                    {t("menu:tournaments")}
                  </h2>
                  <p className="text-xs md:text-sm text-base-content/50 font-normal">
                    <Trans
                      i18nKey="bonus:bonusHub.ongoing"
                      values={{ count: bonusStats.tournament.ongoing }}
                    />
                  </p>
                </div>

                <button 
                  className="btn btn-square btn-soft btn-primary ms-auto"
                  onClick={(e) => handleNavigate(e, '/tournament')}
                >
                  <ChevronRight
                    className={getIconDirection(isRTL, true)}
                    size={16}
                  />
                </button>
              </div>
            </div>
            <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(230,173,67,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
              <div className="flex items-center gap-x-4">
                <img
                  src="/images/games/categories/trophy.png"
                  alt="trophy"
                  className="w-8 h-8"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-sm md:text-base font-bold">
                    {t("bonus:daily_cashback")}
                  </h2>
                  <p className="text-xs md:text-sm text-base-content/50 font-normal">
                    {bonusStats.cashback.claimable > 0 
                      ? t("bonus:bonusHub.claimable")
                      : <Trans i18nKey="bonus:bonusHub.accrualIn" values={{ time: cashbackCountdown }} />}
                  </p>
                </div>

                <button 
                  className="btn btn-square btn-soft btn-primary ms-auto"
                  onClick={handleNavigate}
                >
                  <ChevronRight
                    className={getIconDirection(isRTL, true)}
                    size={16}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
