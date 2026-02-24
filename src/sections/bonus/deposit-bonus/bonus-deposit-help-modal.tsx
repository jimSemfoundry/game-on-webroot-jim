import { Countdown } from "@/components/ui/Countdown";
import { Modal } from "@/components/ui/Modal.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import Iconify from "@/components/iconify";
import { useDepositBonusConfig } from "@/hooks/api/usePublic.ts";
import { deposit_bonus_static_info } from "@/sections/bonus/deposit-bonus/helper.ts";
import Decimal from "decimal.js";

interface BonusDepositHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ILLUSTRATION_URL = "/images/illustrations/deposit-bonus.png";

export const BonusDepositHelpModal = ({ isOpen, onClose }: BonusDepositHelpModalProps) => {
  const { t } = useTranslation(['popup', 'bonus']);
  const { status: authStatus } = useAuth();
  const { openUserFinanceModal } = useFinanceModal();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: bonusConfig } = useDepositBonusConfig(isOpen);

  const { gradient: vibrantGradient } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient: "radial-gradient(100% 308% at 100% 0%, rgba(255, 215, 0, 0.45) 0%, rgba(15, 20, 26, 0.05) 50%)",
    opacity: 0.45,
    colorTypes: ["DarkMuted"]
  });

  const formatAmount = useCallback(
    (amount: number) => {
      return formatWithConversion(amount, "USD", { showSymbol: true, showCode: false }).formatted;
    },
    [formatWithConversion]
  );

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="bg-transparent md:w-[500px] max-w-lg p-0 max-h-[70vh]"
      closeButtonClassName="z-10 hidden"
      zIndex={1007}
    >
      <div className="flex flex-col gap-1">
        {/* Top highlight card */}
        <div
          className="rounded-box pl-7 py-4 relative overflow-hidden h-[180px] flex items-center justify-center"
          style={{
            background: `${vibrantGradient}, linear-gradient(0deg, var(--color-base-300), var(--color-base-300))`
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="text-left flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-base-content leading-7 whitespace-pre-line">
                {t("popup:deposit.title")}
              </h2>

              {dayjs().diff((authStatus?.deposit_bonus_expire ?? 0) * 1000) < 0 && (
                <div
                  className="bg-gradient-to-br from-base-content/20 to-transparent border-0 rounded-field p-2 relative">
                  <p
                    className="text-xs font-bold mb-1 absolute top-0 -translate-y-1/2 left-0 badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[8px]">
                    {t("popup:depositBonusPool.expiresIn")}
                  </p>
                  <Countdown
                    target={new Date((authStatus?.deposit_bonus_expire ?? 0) * 1000)}
                    renderCustom={(time) => (
                      <div className="grid gap-1 grid-cols-4">
                        <div
                          className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                          <span className="countdown text-lg font-bold">
                            <span style={{ "--value": time.days } as React.CSSProperties}></span>
                          </span>
                          <p className="text-[8px] text-base-content/70">days</p>
                        </div>
                        <div
                          className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                          <span className="countdown text-lg font-bold">
                            <span style={{ "--value": time.hours } as React.CSSProperties}></span>
                          </span>
                          <p className="text-[8px] text-base-content/70">hours</p>
                        </div>
                        <div
                          className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                          <span className="countdown text-lg font-bold">
                            <span style={{ "--value": time.minutes } as React.CSSProperties}></span>
                          </span>
                          <p className="text-[8px] text-base-content/70">minutes</p>
                        </div>
                        <div
                          className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                          <span className="countdown text-lg font-bold">
                            <span style={{ "--value": time.seconds } as React.CSSProperties}></span>
                          </span>
                          <p className="text-[8px] text-base-content/70">seconds</p>
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}
            </div>
            <div className="shrink-0">
              <img
                src={ILLUSTRATION_URL}
                alt="Deposit Bonus"
                className="w-36 h-36 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-base-400 rounded-box relative">
          <button onClick={onClose}
                  className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[420px] overflow-y-auto pb-12 hide-scrollbar">
              <p className="text-xs text-base-content/50 leading-5 mb-4">
                {t("popup:deposit.description")}
              </p>

              <div className="flex flex-col gap-2 mb-4">
                {(bonusConfig?.data ?? []).map((item: Record<string, any>) => {
                  if (item?.id === 5) return
                  const find = deposit_bonus_static_info(t).find((d) => d.id === item.id);
                  if (find)
                    return (<BonusCard
                      key={item?.id}
                      icon={find?.icon}
                      title={find?.title}
                      subTitle={Decimal(item?.bonus_percent || 0).times(100).toFixed(0) + "%"}
                    />);
                })}
              </div>

              <button
                className="btn btn-primary w-full btn-lg font-bold text-base mb-2"
                onClick={() => {
                  onClose();
                  openUserFinanceModal();
                }}
              >
                {t("popup:deposit.depositNow")}
              </button>

              <p className="text-xs text-base-content/50 text-center mb-6">
                {t("popup:deposit.depositInvitation")}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3">{t("popup:deposit.howIsBonusCalculated")}</h4>

                <div className="flex justify-between text-xs font-bold text-base-content/50 mb-2 uppercase">
                  <span>{t("popup:deposit.depositCountBonus")}</span>
                  <span>{t("popup:deposit.limit")}</span>
                </div>

                <div className="flex flex-col gap-1">
                  {(bonusConfig?.data ?? []).map((item: Record<string, any>) => {
                    if (item?.id === 5) return
                    const find = deposit_bonus_static_info(t).find((d) => d.id === item.id);
                    if (find)
                      return (
                        <TableRow
                          key={item?.id}
                          count={item?.level}
                          percent={Decimal(item?.bonus_percent || 0).times(100).toFixed(0) + "%"}
                          limit={formatAmount(item?.max_bonus_amount || 0)} />
                      );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-bold mb-2">{t("popup:deposit.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:deposit.expirationDesc")}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-bold mb-2">{t("popup:deposit.generalTerms")}</h4>
                <div className="flex flex-col gap-2 text-xs text-base-content/50 leading-5">
                  <p>{t("popup:deposit.generalTermsDesc1")}</p>
                  <p>{t("popup:deposit.generalTermsDesc2")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const BonusCard = ({ title, subTitle, desc, icon }: {
  title?: string;
  subTitle?: string;
  desc?: string;
  icon?: string
}) => {
  const { gradient: vibrantGradient } = useVibrantColor(`/images/rewards/${icon}`, {
    fallbackGradient: "radial-gradient(100% 308% at 100% 0%, rgba(255, 215, 0, 0.45) 0%, rgba(15, 20, 26, 0.05) 50%)",
    opacity: 0.45,
    colorTypes: ["DarkMuted"]
  });

  return (
    <div
      className="flex items-center justify-between rounded-xl p-3 border border-base-200"
      style={{
        background: `${vibrantGradient}, linear-gradient(0deg, var(--color-base-300), var(--color-base-300))`
      }}
    >
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <div className="text-primary text-xl font-black leading-tight">{subTitle}</div>
        <p className="text-xs text-base-content/50 mt-1">{desc}</p>
      </div>
      <img src={`/images/rewards/${icon}`} className="h-16 w-16 object-contain" alt={title} />
    </div>
  );
};

const TableRow = ({ count, percent, limit }: { count: string, percent: string, limit: string | number }) => (
  <div className="flex items-center justify-between bg-base-300/30 rounded-lg px-4 py-3">
    <div className="flex items-center gap-8">
      <span className="text-sm font-bold text-base-content/50 w-4">{count}</span>
      <span className="text-sm font-bold text-success">{percent}</span>
    </div>
    <span className="text-sm font-bold text-base-content/50">{limit}</span>
  </div>
);
