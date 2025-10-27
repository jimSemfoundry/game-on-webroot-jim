import { useRTLContext } from "@/contexts/RTLContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { getIconDirection } from "@/utils/rtl";
import { cn } from "@/utils/themeMerger";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Iconify from "../iconify";
import { Modal } from "../ui/Modal";

export const BonusHub = () => {
  const { isMobile } = useSidebar();
  const { isRTL } = useRTLContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

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
          <div
            className={cn(
              "badge badge-primary badge-xs w-4 h-4 absolute -bottom-0.5",
              isRTL ? "-left-0.5" : "-right-0.5",
            )}
          >
            2
          </div>
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
                      Reset on 07h 27m 32s
                    </p>
                  </div>

                  <button className="btn btn-square btn-soft btn-primary btn-sm ms-auto">
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
                      {t("menu.tournaments")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      3 Ongoing
                    </p>
                  </div>

                  <button className="btn btn-square btn-soft btn-primary btn-sm ms-auto">
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
                    src="/images/games/categories/trophy.svg"
                    alt="trophy"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col gap-y-1">
                    <h2 className="text-sm md:text-base font-bold">
                      {t("bonus.daily_cashback")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      Accrual in 07h 27m 32s
                    </p>
                  </div>

                  <button className="btn btn-square btn-soft btn-primary btn-sm ms-auto">
                    <ChevronRight
                      className={getIconDirection(isRTL, true)}
                      size={16}
                    />
                  </button>
                </div>
              </div>
              <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(82,68,131,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
                <div className="flex items-center gap-x-4">
                  <img
                    src="/images/games/categories/coin.svg"
                    alt="trophy"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col gap-y-1">
                    <h2 className="text-sm md:text-base font-bold">
                      {t("bonus.bonus_calendar")}
                    </h2>
                    <p className="text-xs md:text-sm text-base-content/50 font-normal">
                      Next release in 07h 27m 32s
                    </p>
                  </div>

                  <button className="btn btn-square btn-soft btn-primary btn-sm ms-auto">
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
        <div className="badge badge-primary badge-xs w-4 h-4">2</div>
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
                    <Trans
                      i18nKey="bonus:bonusHub.resetOn"
                      values={{ time: "07h 27m 32s" }}
                    />
                  </p>
                </div>

                <button className="btn btn-square btn-soft btn-primary ms-auto">
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
                      values={{ count: 3 }}
                    />
                  </p>
                </div>

                <button className="btn btn-square btn-soft btn-primary ms-auto">
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
                  src="/images/games/categories/trophy.svg"
                  alt="trophy"
                  className="w-8 h-8"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-sm md:text-base font-bold">
                    {t("bonus:daily_cashback")}
                  </h2>
                  <p className="text-xs md:text-sm text-base-content/50 font-normal">
                    <Trans
                      i18nKey="bonus:bonusHub.accrualIn"
                      values={{ time: "07h 27m 32s" }}
                    />
                  </p>
                </div>

                <button className="btn btn-square btn-soft btn-primary ms-auto">
                  <ChevronRight
                    className={getIconDirection(isRTL, true)}
                    size={16}
                  />
                </button>
              </div>
            </div>
            <div className="rounded-field bg-[#0F141A] bg-[radial-gradient(ellipse_100%_157.05%_at_0%_46.47%,rgba(82,68,131,0.4)_0%,rgba(15,20,26,0)_100%)] p-4">
              <div className="flex items-center gap-x-4">
                <img
                  src="/images/games/categories/coin.svg"
                  alt="trophy"
                  className="w-8 h-8"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-sm md:text-base font-bold">
                    {t("bonus:bonus_calendar")}
                  </h2>
                  <p className="text-xs md:text-sm text-base-content/50 font-normal">
                    <Trans
                      i18nKey="bonus:bonusHub.nextReleaseIn"
                      values={{ time: "07h 27m 32s" }}
                    />
                  </p>
                </div>

                <button className="btn btn-square btn-primary btn-soft ms-auto">
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
