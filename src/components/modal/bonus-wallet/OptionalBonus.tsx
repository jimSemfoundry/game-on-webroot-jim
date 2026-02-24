import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { useCallback, useState } from "react";
import {
  BONUS_WALLET_INFO_MAP, EBonus,
  InnerOption,
  TBonus
} from "@/components/modal/bonus-wallet/components.tsx";
import Iconify from "@/components/iconify";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { authService } from "@/services/authService.ts";
import { useNavigate } from "@tanstack/react-router";
import { useBonusConfigList, useCurrentUser } from "@/hooks/api/useAuth.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useQueryClient } from "@tanstack/react-query";

export default function OptionalBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const navigate = useNavigate();

  const current_user = useCurrentUser();

  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { user } = useAuth();

  const { updateSettlementCurrency } = useSettlementCurrency();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 彩金活动配置列表
  const { data: bonusConfig, isLoading: bonusConfigLoading } = useBonusConfigList();

  const [isPending, setPending] = useState<boolean>(false);
  const [bonusType, setBonusType] = useState<TBonus | null>(null);

  const targetCurrency = (user?.currency_fiat ?? "USD");

  const handle = useCallback(async () => {
    setPending(true);

    try {
      // 激活彩金活动
      const data = await authService.userActiveBonusWallet(bonusType!);

      if (data?.code !== 0) return;

      // 更新用户数据
      void current_user?.refetch();

      // 跳转到活动页
      // 切换彩金币种
      // 选了彩金活动
      if (bonusType !== EBonus.NONE) {
        void navigate({ to: "/dollars/bonus" });
        void updateSettlementCurrency(EBonus.TOKEN);
      } else {
        // 放弃彩金活动
        // 正常拉起FreeSpin
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ["earliestPendingRecord"] });
        }, 1000);
      }

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [bonusType, user?.id]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Iconify icon="custom:bonus" className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
          <span className="text-sm font-bold">{t("bonus:welcomeBonus")}</span>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      className="bg-base-400 max-w-[420px] p-5"
      position="modal-middle"
    >
      <SmallLoading
        loading={bonusConfigLoading}
        content={
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {
                (bonusConfig?.data ?? []).map((bonus: Record<string, any>) => {
                  const parsed_data = parser(bonus?.extra_data);
                  const bonus_name = parsed_data?.type || bonus?.name;
                  return (
                    <InnerOption
                      key={bonus?.name}
                      type={bonus_name}
                      name={parsed_data?.type}
                      title={t(BONUS_WALLET_INFO_MAP[bonus_name as TBonus]?.title)}
                      subTitle={t(BONUS_WALLET_INFO_MAP[bonus_name as TBonus]?.subTitle, {
                        value: Decimal(parsed_data?.bonus_rate || 0).times(100).toFixed(0) + "%",
                        amount: Number(parsed_data?.bonus_value) >= 0 ? formatCurrency({
                          amount: convertCurrency({
                            amount: parsed_data?.bonus_value || 0,
                            fromCurrency: "USDT",
                            toCurrency: targetCurrency,
                            exchangeRates
                          }),
                          currency: targetCurrency,
                          showSymbol: true, showCode: false
                        }).formatted : ""
                      })}
                      checked={bonusType === bonus?.name}
                      onChecked={(checked) => setBonusType(checked ? bonus?.name : null)}
                    >
                    </InnerOption>
                  );
                })
              }
            </div>

            <ConfirmBox
              onClick={handle}
              loading={isPending}
              disabled={!bonusType}
            >
              {t("common:choose")}
            </ConfirmBox>
          </div>
        }
        className={"h-[200px] !rounded-xl"}
      />
    </Modal>
  );
}
