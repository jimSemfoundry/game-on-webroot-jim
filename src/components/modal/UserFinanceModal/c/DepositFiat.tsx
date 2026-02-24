import { DepositFiatForm } from "@/components/modal/UserFinanceModal/c/DepositFiatForm.tsx";
import { DepositFiatSelect } from "@/components/modal/UserFinanceModal/c/DepositFiatSelect.tsx";
import { Trans, useTranslation } from "react-i18next";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { useMemo } from "react";
import { useBoundStore } from "@/store";
import { SecureCard } from "@/components/modal/UserFinanceModal/c/SecureCard.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { SpecialOffersH5 } from "./SpecialOffers.tsx";
import { SpecialOffersGuard } from "@/components/modal/UserFinanceModal/c/SpecialOffersGuard.tsx";

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
      {/* 币种和通道选择 */}
      <DepositFiatSelect />

      {/* 通道在维护 */}
      <InnerDisplayContent show={Boolean(provider_error)}>
        <div className="bg-base-300 rounded-lg p-2">
          <ErrorMessageBox
            sample
            className={"!mt-0"}
            content={<Trans
              i18nKey={"finance:channel_under_maintenance"}
              values={{ channel: depositFiat.method?.display_name }}
              components={[<span className="underline font-bold" />]} />}
            show={Boolean(provider_error)} />
        </div>
      </InnerDisplayContent>

      {/* 优惠充值活动 */}
      <div className="block md:hidden">
        <SpecialOffersGuard>
          <SpecialOffersH5 />
        </SpecialOffersGuard>
      </div>

      {/* 动态表单 */}
      <DepositFiatForm />

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