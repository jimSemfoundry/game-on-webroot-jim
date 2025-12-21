import { useReferralRewards } from "@/hooks/useReferralRewards";
import { useTranslation } from "react-i18next";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useClaimBonusMutation } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";

const stripedBackground = `repeating-linear-gradient(
    -45deg,
    var(--color-base-200) 0px,
    var(--color-base-200) 12px,
    oklch(from var(--color-base-200) l c h / 0.8) 12px,
    oklch(from var(--color-base-200) l c h / 0.8) 24px
  )`;

export const InnerReferralRewards = () => {
  const { t } = useTranslation();

  const { setSyncAction } = useBoundStore();

  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

  const {
    isLoading,
    lockedReferral,
    availableReferral,
    totalReceivedReferral,
    refetchreferralData
  } = useReferralRewards();

  const done = (res: { code: number }) => {
    if (res.code === 0) void refetchreferralData();
  };

  const { mutate: claimBonus } = useClaimBonusMutation(done);

  const handle = () => {
    claimBonus(
      { item: "referral" },
      {
        onSuccess: (response) => {
          if (response.code !== 0 ) {
            setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
              code: response.code,
              tryAgain: handle
            });
            return
          }
          openDoubleOrNothingModal({
            don_record_id: response?.data?.don_record_id,
            amount: response?.data?.amount
          });
        }
      }
    );
  };

  return (
    <div
      className="w-full p-4 rounded-box flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-3 h-full sm:h-full"
      style={{ backgroundImage: stripedBackground }}
    >
      <div className="flex flex-1 flex-col gap-0 sm:justify-between">
        <div className="flex flex-col gap-0 sm:gap-2">
          <h3 className="text-base sm:text-xl font-semibold text-base-content leading-5 whitespace-nowrap">
            <span className="inline sm:block">{t("common:common.referral")}{" "}</span>
            <span className="inline sm:block">{t("bonus:rewards")}</span>
          </h3>
          <h1 className="text-primary text-xl sm:text-3xl font-bold">
            {isLoading ? (
              <span className="loading loading-dots loading-sm"></span>
            ) : (
              availableReferral.formatted
            )}
          </h1>
        </div>
        <div className="flex flex-col text-xs sm:text-sm font-semibold text-base-content/50 mt-0 sm:mt-auto">
          <p className="mt-2">
            <span>{t("referral:totalReceived")}:&nbsp;</span>
            <span>{isLoading ? "..." : totalReceivedReferral.formatted}</span>
          </p>
          <p>
            <span>{t("finance:locked")}:&nbsp;</span>
            <span>{isLoading ? "..." : lockedReferral.formatted}</span>
          </p>
        </div>
      </div>

      <ConfirmBox
        className="w-auto btn-sm sm:btn-lg sm:w-full"
        disabled={availableReferral?.value === 0 || isLoading}
        onClick={handle}
      >
        {t("bonus:claim")}
      </ConfirmBox>
    </div>
  );
};
