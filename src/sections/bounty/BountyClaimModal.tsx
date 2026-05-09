import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { Modal } from "@/components/ui/Modal";
import { InnerConfirmBox } from "@/sections/dollars/components";
import { useClaimCurrencyList, useClaimReward } from "@/hooks/api/useBounty";
import { useCurrencyData } from "@/hooks/useCurrency";
import type { BountyMyWin } from "@/services/bountyService";

interface Props {
  winner: BountyMyWin | null;
  onClose: () => void;
  onSuccess?: (claimAmount: number, claimCurrency: string) => void;
}

/**
 * Bounty Claim 弹窗 — 严格对齐 Figma node 33194:299780:
 *  - 中央 modal + X 关闭
 *  - 礼盒 hero 图（暂用 bounty-hit.png 占位，待 designer 切图）
 *  - "Congratulations!" 句首大写（不是 ALL CAPS）
 *  - "Claim Your Reward: {amount} {currency}" 小说明
 *  - "≈ {converted} {selectedCurrency}" 大 lime 金额预览
 *  - 左侧文字 + 右侧 currency pill（dropdown）
 *  - 大 lime "Continue" 按钮
 */
export function BountyClaimModal({ winner, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const isOpen = !!winner;
  const { data: currencyList } = useClaimCurrencyList(isOpen);
  const claim = useClaimReward();
  const { exchangeRates, convertCurrency } = useCurrencyData();

  const [currency, setCurrency] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (winner) {
      setCurrency(currencyList?.default || winner.reward_currency || "USDT");
    }
  }, [winner, currencyList?.default]);

  const availableCurrencies = useMemo(() => {
    const set = new Set<string>();
    (currencyList?.list || []).forEach((c) => set.add(c));
    if (winner?.reward_currency) set.add(winner.reward_currency);
    if (currencyList?.default) set.add(currencyList.default);
    return Array.from(set);
  }, [currencyList?.list, currencyList?.default, winner]);

  const convertedAmount = useMemo(() => {
    if (!winner || !currency) return 0;
    return convertCurrency({
      amount: winner.reward_amount,
      fromCurrency: winner.reward_currency,
      toCurrency: currency,
      exchangeRates,
    });
  }, [winner, currency, convertCurrency, exchangeRates]);

  const onConfirm = () => {
    if (!winner) return;
    claim.mutate(
      { winner_id: winner.winner_id, claim_currency: currency },
      {
        onSuccess: (res) => {
          onSuccess?.(res.claim_amount, res.claim_currency);
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      hideTitle
      onClose={onClose}
      position="modal-middle"
      className="overflow-y-visible relative sm:w-[420px]"
      closeButtonClassName="z-2"
    >
      <div className="relative">
        {/* hero gift graphic */}
        <div className="absolute top-[-90px] left-0 right-0 flex justify-center pointer-events-none select-none">
          <img
            src="/images/bounty/bounty-hit.png"
            alt=""
            className="w-[180px] h-[180px] object-contain drop-shadow-[0_0_28px_rgba(196,224,44,0.45)]"
          />
        </div>

        <div className="flex flex-col items-center gap-3 pt-[110px] pb-2">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-base-content">
              {t("bountyBonus:congratulations", "Congratulations!")}
            </p>
            <p className="text-sm text-base-content/70 mt-2">
              {winner && (
                <Trans
                  i18nKey="bountyBonus:claimYourReward"
                  values={{ amount: winner.reward_amount, currency: winner.reward_currency }}
                  defaults="Claim Your Reward: {{amount}}{{currency}}"
                />
              )}
            </p>
          </div>

          {/* Big converted amount preview */}
          <div className="text-3xl font-extrabold text-primary">
            ≈ {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </div>

          {/* Description left + currency pill right */}
          <div className="w-full flex items-center justify-between gap-3 mt-2">
            <p className="text-xs text-base-content/60 leading-tight flex-1">
              <Trans
                i18nKey="bountyBonus:claim.creditedToFollowing"
                defaults="Your Reward will be credited to the following account:"
              />
            </p>

            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setPickerOpen((s) => !s)}
                className="flex items-center gap-1 px-3 h-9 rounded-lg bg-base-200 text-sm font-bold text-base-content hover:bg-base-content/10"
              >
                <CurrencyIcon currency={currency} className="w-4 h-4" />
                {currency}
                <ChevronDown className="w-4 h-4 text-base-content/60" />
              </button>
              {pickerOpen && availableCurrencies.length > 0 && (
                <div className="absolute right-0 top-10 z-10 bg-base-100 rounded-lg shadow-lg border border-base-content/10 min-w-[120px] overflow-hidden">
                  {availableCurrencies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCurrency(c);
                        setPickerOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-base-200 ${
                        c === currency ? "text-primary font-bold" : "text-base-content"
                      }`}
                    >
                      <CurrencyIcon currency={c} className="w-4 h-4" />
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <InnerConfirmBox
            className="btn btn-primary w-full mt-3"
            onClick={onConfirm}
            loading={claim.isPending}
            disabled={!winner || !currency}
          >
            {claim.isPending
              ? t("bountyBonus:claiming", "Claiming...")
              : t("bountyBonus:claim.continue", "Continue")}
          </InnerConfirmBox>
        </div>
      </div>
    </Modal>
  );
}
