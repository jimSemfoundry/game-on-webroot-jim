import { Trans, useTranslation } from "react-i18next";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ReactNode, useCallback, useState } from "react";
import { authService } from "@/services/authService.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { InnerErrorWrapper } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import { uuidv4Generate } from "@/utils/helper.ts";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { SocialMedia } from "@/sections/casino/SocialMedia.tsx";

export const GetPromoCodeCard = () => {
  const { t } = useTranslation();

  const openModal = useBoundStore((state) => state.openModal);

  const [state, setState] = useState({
    isPending: false,
    promoCode: ""
  });

  const isError = state.promoCode !== "" && !/^[A-Za-z0-9]{3,}$/.test(state.promoCode);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/dollars/bonus-error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  // const showSuccessToast = useCallback(() => {
  //   showBaseToast({
  //     icon: "/images/bonus/success.png",
  //     title: t("bonus:congratulations"),
  //     subTitle: (
  //       <Trans i18nKey={"bonus:claim_successful"} />
  //     )
  //   });
  // }, [showBaseToast, t]);

  const handle = useCallback(async () => {
    setState(prev => ({ ...prev, isPending: true }));

    try {
      const device_id = uuidv4Generate();

      // device_id: 服务于风控
      const response = await authService.userClaimPromoCode(state.promoCode, device_id);

      if (response?.code === 0 || response?.code === 200) {
        // if (response?.data?.type?.includes("free_spin")) {
        //   TODO: 针对FreeSpin的优惠码获取结果,需要数据生成的过渡处理
        openModal("OPEN_GET_PROMO_CODE_MODAL", { ...response });
        // } else {
        // TODO: 普通优惠码的领取
        // showSuccessToast();
        // }

        setState(prev => ({ ...prev, promoCode: "" }));
      } else {
        // TODO: 领取异常处理
        if (response?.code === 51016) showErrorToast("bonus:promo_expired");
        if (response?.code === 51017) showErrorToast("bonus:promo_claimed");
        if (response?.code === 51007) showErrorToast("bonus:invalid_parameter");
        if (response?.code === 51008) showErrorToast("bonus:promo_invalid");
        if (response?.code === 51018) showErrorToast("bonus:promo_claim_limit");
        if (response?.code === 51014) showErrorToast("bonus:promo_unavailable");
        if (response?.code === 51019) showErrorToast("bonus:promo_claim_limit");
        if (response?.code === 51020) showErrorToast("bonus:similar_event");
        if (response?.code === 51021) showErrorToast("bonus:not_started_yet");
        if (response?.code === 51022) showErrorToast("bonus:not_eligible");
        if (response?.code === 51023) showErrorToast("bonus:cannot_claim");
      }
    } catch (_error) {
      console.info(_error);
      showErrorToast("bonus:promo_unavailable");
    } finally {
      setState(prev => ({ ...prev, isPending: false }));
    }
  }, [state.promoCode]);

  return (
    <div
      className={`relative 
      flex w-full flex-col 
      gap-3 overflow-hidden rounded-field
      bg-base-200 p-4 shadow-md transition-transform 
      duration-200 hover:-translate-y-1 sm:p-5 mt-1 sm:my-4`}
    >
      <p className={"text-sm font-bold sm:text-base text-left w-full"}>
        {t("finance:promoCode")}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p
          className="hidden sm:block text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full whitespace-pre-line">
          {t("bonus:redeem_promotional")}
        </p>
        <InnerErrorWrapper>
          <div className="flex gap-2">
            <input
              type="text"
              value={state.promoCode}
              onChange={(e) => {
                setState(prev => ({ ...prev, promoCode: e.target.value?.trim() }));
              }}
              className={"input bg-base-300 w-full border-0 !outline-0 font-semibold px-4"}
              placeholder={t("finance:enter")} />
            <ConfirmBox
              loading={state.isPending}
              disabled={!state.promoCode || isError}
              className={"flex-1"}
              onClick={handle}>{t("bonus:claim")}</ConfirmBox>
          </div>
          <ErrorMessageBox
            sample
            show={isError}
            content={t("bonus:promo_format_error", { length: 3 })} />
        </InnerErrorWrapper>
        <p
          className="block sm:hidden text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full whitespace-pre-line">
          {t("bonus:redeem_promotional")}
        </p>
      </div>
      <SocialMedia className={'justify-between sm:justify-start'} />
    </div>
  );
};
