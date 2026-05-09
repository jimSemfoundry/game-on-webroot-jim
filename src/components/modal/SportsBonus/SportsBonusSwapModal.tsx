import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SwapSend } from "@/components/modal/BonusSwapModal/SwapSend.tsx";
import { SportsSwapReceive } from "@/components/modal/SportsBonus/SportsSwapReceive.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  useAvailableBalance,
  useSupportedBonusSwapFromCurrenciesFilter,
  useSupportedCurrencyV2
} from "@/components/modal/UserFinanceModal/helper.ts";
import { BONUS_ERROR_MAP, ESport, InnerToastCustom } from "@/sections/dollars/components.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";
import { useNavigate } from "@tanstack/react-router";
import { useUserSportWallet } from "@/query/sports-bonus.ts";

const SportsBonusSwapModal = ({
  data,
  open,
  onClose
}: {
  data: Record<string, any>;
  open: boolean;
  onClose: () => void;
}) => {
  // 初始化 from（用户现金币种）+ to（强制 SPORT）
  useSportsBonusSwapInit();

  const navigate = useNavigate();
  const current_user = useCurrentUser();
  const { t } = useTranslation();
  const { bonusSwapFrom } = useBoundStore();
  const [isPending, setPending] = useState(false);
  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 体育彩金钱包
  const { refetch: refetchSportsWallet } = useUserSportWallet();

  const parsed_data = parser(data?.extra_data);
  const currency_fiat = current_user?.data?.user?.currency_fiat ?? "USD";

  const min_deposit_require_value = formatCurrency({
    amount: convertCurrency({
      amount: parsed_data?.min_deposit_require_value || 0,
      fromCurrency: "USDT",
      toCurrency: bonusSwapFrom.currency?.currency,
      exchangeRates
    }),
    currency: bonusSwapFrom.currency?.currency
  });

  const min_deposit_require_value_ceil = Decimal(min_deposit_require_value.value)
    .toDP(bonusSwapFrom.currency?.display_decimal, Decimal.ROUND_CEIL)
    .toString();

  const {
    totalBalance: available = "0",
    userBalanceLoading,
    userBalanceExtensionLoading
  } = useAvailableBalance(bonusSwapFrom.currency?.currency);

  const showBaseToast = useCallback(
    (params: { icon: string; title: string; subTitle: ReactNode }) => {
      toast.custom(
        (tst) => (
          <InnerToastCustom
            closeBtn
            tst={tst}
            icon={params.icon}
            title={params.title}
            subTitle={params.subTitle}
            onConfirm={() => console.info("onConfirm")}
          />
        ),
        { duration: 6_000, position: "top-right" }
      );
    },
    []
  );

  const showErrorToast = useCallback(
    (i18nKey: string) => {
      showBaseToast({
        icon: "/images/dollars/bonus-error.png",
        title: t("transaction:transactionStatus.failed"),
        subTitle: <Trans i18nKey={i18nKey} />
      });
    },
    [showBaseToast, t]
  );

  const showSuccessToast = useCallback(
    (amount: string) => {
      const bonus_amount = formatCurrency({
        amount: convertCurrency({
          amount: amount,
          fromCurrency: ESport.TOKEN,
          toCurrency: currency_fiat,
          exchangeRates
        }),
        currency: currency_fiat,
        showSymbol: true,
        showCode: false
      }).formatted;
      showBaseToast({
        icon: "/images/dollars/bonus-success.png",
        title: t("bonus:successful"),
        subTitle: (
          <Trans
            values={{
              amount: `${Decimal(amount).toDP(2, Decimal.ROUND_DOWN).toString()} ${ESport.TOKEN} (≈${bonus_amount})`
            }}
            i18nKey={"bonus:purchased"}
            components={[<span className="text-primary font-bold" />]}
          />
        )
      });
    },
    [showBaseToast, exchangeRates, currency_fiat, t]
  );

  const createOrder = useCallback(async () => {
    setPending(true);

    try {
      const response = await authService.userPurchaseSportsBonus(
        bonusSwapFrom.inAmount,
        bonusSwapFrom.currency?.currency,
        data?.id
      );

      const error = response?.code ? BONUS_ERROR_MAP[response.code] : undefined;
      if (error) {
        showErrorToast(error);
        return;
      }

      if (response?.code !== 0) {
        showErrorToast("bonus:failedCreate");
        return;
      }

      void refetchSportsWallet();

      void navigate({ to: "/dollars/sports-bonus" as any });

      showSuccessToast((response as any)?.bonus_amount);

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [bonusSwapFrom.currency?.currency, bonusSwapFrom.inAmount, data?.id]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <img src="/images/dollars/sport.png" alt="" className="w-5 h-5" onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/dollars/bonus.png";
          }} />
          <span className="text-md font-bold">{t("bonus:buySportsBonus")}</span>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      className="h-[75vh] max-h-[75vh] md:w-[500px] hide-scrollbar bg-base-400"
      position="modal-middle"
    >
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-col gap-2">
          <SwapSend
            open={open}
            minimum={min_deposit_require_value_ceil}
            currency={min_deposit_require_value.currency}
            available={available}
            loading={userBalanceLoading || userBalanceExtensionLoading}
            onClose={onClose}
          />

          <SportsSwapReceive open={open} data={data} minimum={min_deposit_require_value_ceil} />

          <MessageBox
            show={
              new Decimal(bonusSwapFrom.inAmount || 0).gt(0) &&
              new Decimal(available).gte(Number(bonusSwapFrom.inAmount || 0)) &&
              new Decimal(min_deposit_require_value_ceil).lte(bonusSwapFrom.inAmount || 0)
            }
          >
            <ConfirmBox onClick={createOrder} loading={isPending}>
              <p className="font-bold">{t("bonus:buyNow")}</p>
            </ConfirmBox>
          </MessageBox>

          <MessageBox
            show={
              new Decimal(bonusSwapFrom.inAmount || 0).gt(0) &&
              new Decimal(min_deposit_require_value_ceil).gt(bonusSwapFrom.inAmount || 0)
            }
          >
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("bonus:amountLow")}</span>
            </ConfirmBox>
          </MessageBox>

          <MessageBox show={new Decimal(available).lt(bonusSwapFrom.inAmount || 0)}>
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("finance:insufficient_balance")}</span>
            </ConfirmBox>
          </MessageBox>

          <MessageBox show={new Decimal(bonusSwapFrom.inAmount || 0).lte(0)}>
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("finance:enter_amount")}</span>
            </ConfirmBox>
          </MessageBox>
        </div>
      </div>
    </Modal>
  );
};

export default SportsBonusSwapModal;

const MessageBox = ({ show, children }: { show: boolean; children: ReactNode }) => {
  return show ? children : null;
};

// 初始化 swap from / to: from 用现金币种, to 强制 SPORT
const useSportsBonusSwapInit = () => {
  const { setBonusSwapTo, setBonusSwapFrom, bonusSwapFrom } = useBoundStore();

  const initFromRef = useRef(false);
  const initToRef = useRef(false);

  const [, swap_from_currencies] = useSupportedBonusSwapFromCurrenciesFilter();
  const { data: swap_to_currencies } = useSupportedCurrencyV2();

  // to 默认 SPORT
  useEffect(() => {
    if (initToRef.current) return;
    if (!swap_to_currencies?.data?.length) return;
    const sport = (swap_to_currencies?.data ?? []).find(
      (o: { currency: string }) => o?.currency === ESport.TOKEN
    );
    if (!sport) return;
    initToRef.current = true;
    setBonusSwapTo({ currency: sport });
  }, [swap_to_currencies]);

  // from 默认第一个
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;
    if (bonusSwapFrom.currency) return;
    if (initFromRef.current) return;
    initFromRef.current = true;
    setBonusSwapFrom({ currency: swap_from_currencies[0] });
  }, [bonusSwapFrom.currency, swap_from_currencies?.length]);
};
