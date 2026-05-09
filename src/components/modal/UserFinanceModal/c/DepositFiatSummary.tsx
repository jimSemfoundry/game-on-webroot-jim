import { useBoundStore } from "@/store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { emitter } from "@/store/emitter.ts";
import { Decimal } from "decimal.js";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { SPECIAL_OFFER_DEPOSIT_SET } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const DepositFiatSummary = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  const { currentPromo } = useGetPromoByPage();

  const [CALC_BONUS_AMOUNT, SET_CALC_BONUS_AMOUNT] = useState<string>("");

  // rate 数据有多种字段
  const real_bonus_rate = Decimal(Number(currentPromo?.bonus_rate ?? 0) || Number(currentPromo?.fiat_bonus_rate ?? 0));

  // 事件通知
  useEffect(() => {
    const em = emitter.addListener("CALC_BONUS_AMOUNT", function(v: string) {
      SET_CALC_BONUS_AMOUNT(v);
    });

    return () => em?.remove();
  }, []);

  return (
    <div
      className={"flex flex-col gap-2 bg-base-200 p-3 rounded-lg mb-1 text-base-content/50 text-xs font-semibold"}>

      <div className={"flex justify-between items-center"}>
        <span>{t(`finance:depositAmount`)}</span>
        <InnerDisplayContent show={Decimal(depositFiat.formItem?.amount || 0).gt(0)}>
          <div className={"flex items-center text-base-content gap-1 font-bold"}>
            <FormatAmount amount={depositFiat.formItem?.amount} local />
            {depositFiat.currency?.currency}
          </div>
        </InnerDisplayContent>
        <InnerDisplayContent show={Decimal(depositFiat.formItem?.amount || 0).lte(0)}>
          <span className="text-base-content font-bold">0.00</span>
        </InnerDisplayContent>
      </div>

      <InnerDisplayContent show={currentPromo}>
        <div className={"flex justify-between items-center"}>
          <div className={"flex items-center gap-1 font-bold"}>
            <img src="/icons/ui/gift-box.png" alt="" className="w-4 h-4" />
            {currentPromo?.promo_code === "special_offer_sunday" && t("bonus:super_sunday")}
            {currentPromo?.promo_code === "special_offer_don_deposit" && t("bonus:recovery_bonus_title")}
            {SPECIAL_OFFER_DEPOSIT_SET.has(currentPromo?.promo_code) && t("finance:limited_offer")}
          </div>
          <div className={"text-primary flex items-center"}>
            <div className={"text-primary flex items-baseline font-bold gap-1"}>
              <div className={"flex gap-1"}>
                +<FormatAmount local amount={CALC_BONUS_AMOUNT} decimals={2} />
                {Decimal(depositFiat.formItem?.amount || 0).gt(0) && <span>{depositFiat.currency?.currency}</span>}
              </div>
              {real_bonus_rate.gt(0) && <span
                className="text-[10px] text-base-content/50">
                  {real_bonus_rate.mul(100).toDP(8).toString()}%
                </span>}
            </div>
          </div>
        </div>
      </InnerDisplayContent>
    </div>
  );
};
