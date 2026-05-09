import { DepositFiatForm } from "@/components/modal/UserFinanceModal/c/DepositFiatForm.tsx";
import { DepositFiatSelect } from "@/components/modal/UserFinanceModal/c/DepositFiatSelect.tsx";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useBoundStore } from "@/store";
import { SecureCard } from "@/components/modal/UserFinanceModal/c/SecureCard.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { SpecialOffersH5 } from "./SpecialOffers.tsx";
import {
  InnerDepositProviderError,
  InnerSpecialOffersWrapper
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const DepositFiat = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 供应商不可用错误
  const provider_error = useMemo(() => {
    if (depositFiat.method) return depositFiat.method?.status === 0;
  }, [depositFiat.method]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 bg-base-400 rounded-2xl p-3">
        {/* 币种和通道选择 */}
        <DepositFiatSelect />

        {/* 通道在维护 */}
        <InnerDepositProviderError show={Boolean(provider_error)} channel={depositFiat.method?.display_name} />

        {/* 动态表单 */}
        <DepositFiatForm extraNode={
          // 优惠充值活动
          <InnerSpecialOffersWrapper>
            <SpecialOffersH5 />
          </InnerSpecialOffersWrapper>}
        />
      </div>

      {/* 介绍 */}
      <SecureCard />

      {/* 介绍 */}
      <WarningCard>
        <ul className="list-decimal text-xs leading-4 text-base-content/50 pl-3">
          <li>{t("finance:ensureThatTheTransferAmountMatchesTheSubmissionAmount")}</li>
          <li>{t("finance:eachOrderIDCanONLYBeUsedOnceToAvoidDuplicates")}</li>
          <li>{t("finance:pleaseFollowTheDepositGuidelinesToPreventTheLossOfFunds")}</li>
        </ul>
      </WarningCard>
    </div>
  );
};