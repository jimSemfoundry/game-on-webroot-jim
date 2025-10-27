import { useSupportedCryptoWithdrawGatewaysFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import Copy from "@/components/ui/Copy.tsx";
import { SignInToContinue } from "@/components/ui/SignInToContinue.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCryptoDepositAddress } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { BadgeAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Trans, useTranslation } from "react-i18next";
import { Loading as L, SmallLoading } from "./Loading.tsx";

export const AddressCard = () => {
  const { isAuthenticated } = useAuth();

  const { depositCrypto } = useBoundStore();

  const { data: address, isLoading, error, refetch } = useCryptoDepositAddress(depositCrypto.network?.network);

  return (
    <div>
      <MinAmount />

      <Address show={isAuthenticated && address?.code === 0} data={address?.data} />

      <Loading show={isAuthenticated && isLoading} />

      <GoSignIn show={!isAuthenticated} />

      <GotError func={refetch} show={isAuthenticated && (!!error || address?.code === 1)} />

      <NoAddress show={isAuthenticated && (!address || address?.data?.address?.length === 0) && !isLoading} />
    </div>
  );
};

const Loading = ({ show }: { show: boolean }) => {
  return show && <L className="h-[136px]" />;
};
const Address = ({ show, data }: { show: boolean; data: Record<string, any> }) => {
  const { t } = useTranslation();
  return (
    show && (
      <div className="rounded-lg p-4 bg-base-300 font-semibold flex flex-col gap-2">
        <p className="text-xs text-base-content/50">{t("finance:scan_qr_code_or_copy_address")}</p>
        <div className="flex items-center gap-2 text-base-content/50">
          <QRCodeSVG className="w-20 h-20" value={data?.address} />
          <div className="flex-1">
            <div className={cn("text-xs p-2 bg-base-400 rounded-lg break-all flex items-center gap-1 tracking-tight")}>
              {data?.address}
              <Copy text={data?.address} />
            </div>
          </div>
        </div>
      </div>
    )
  );
};
const GotError = ({ show, func }: { show: boolean; func: () => void }) => {
  const { t } = useTranslation();
  return (
    show && (
      <div className="rounded-lg h-[136px] p-4 bg-base-300 items-center justify-center flex flex-col text-xs font-semibold">
        <p className="text-error">{t("finance:failedToGetDepositAddress")}</p>
        <button className="btn btn-xs btn-soft mt-2" onClick={() => func()}>
          {t("finance:retry")}
        </button>
      </div>
    )
  );
};
const NoAddress = ({ show }: { show: boolean }) => {
  const { t } = useTranslation();
  return (
    show && (
      <div className="rounded-lg h-[136px] p-4 bg-base-300 items-center justify-center flex flex-col text-xs font-semibold">
        <p className="text-base-content/50">{t("finance:noDepositAddressAvailable")}</p>
      </div>
    )
  );
};
const GoSignIn = ({ show }: { show: boolean }) => {
  return (
    show && (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg p-4 bg-base-300 text-center text-xs text-base-content/50 font-semibold">
          <Trans i18nKey="finance:pleaseLoginToViewDepositAddress" components={[<u className="text-primary" />, <u />]} />
        </div>
        <SignInToContinue />
      </div>
    )
  );
};
const MinAmount = () => {
  const { t } = useTranslation();

  const { depositCrypto, setSyncAction } = useBoundStore();

  const [isGatewaysLoading] = useSupportedCryptoWithdrawGatewaysFilter(depositCrypto.currency?.currency);

  return (
    <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
      <p>
        <span className="text-primary">{depositCrypto.network?.network}</span> {t(`finance:deposit_address`)}
      </p>
      <div className="flex items-center gap-2">
        <SmallLoading
          loading={isGatewaysLoading}
          content={
            <>
              <BadgeAlert
                className="w-4 h-4 cursor-pointer"
                onClick={() => {
                  setSyncAction("OPEN_DEPOSIT_MIN_AMOUNT_MODAL");
                }}
              />
              <p className="text-xs">
                {t("finance:min")}: {depositCrypto.network?.min ?? "?"} {depositCrypto.currency?.currency}
              </p>
            </>
          }
        />
      </div>
    </div>
  );
};
