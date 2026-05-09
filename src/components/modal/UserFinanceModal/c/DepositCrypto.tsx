import { AddressCard } from "@/components/modal/UserFinanceModal/c/AddressCard.tsx";
import { CurrencyScrollBar } from "@/components/modal/UserFinanceModal/c/CurrencyScrollBar.tsx";
import { DepositCryptoSelect } from "@/components/modal/UserFinanceModal/c/DepositCryptoSelect.tsx";
import ExchangeRate from "@/components/modal/UserFinanceModal/c/ExchangeRate.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { useBoundStore } from "@/store";
import { Trans } from "react-i18next";
import { SpecialOffersH5 } from "./SpecialOffers.tsx";
import { InnerSpecialOffersWrapper } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const DepositCrypto = () => {
  // from data store, share common data
  const { depositCrypto } = useBoundStore();

  return (
    <div className="flex flex-col gap-4">
      <CurrencyScrollBar />

      <div className="flex flex-col gap-4 bg-base-400 rounded-2xl p-3">
        <DepositCryptoSelect />

        <AddressCard />

        <ExchangeRate />

        {/* 优惠充值活动 */}
        <InnerSpecialOffersWrapper>
          <SpecialOffersH5 />
        </InnerSpecialOffersWrapper>
      </div>
      <WarningCard>
        <div className="text-xs leading-4 flex-1">
          <Trans
            i18nKey="finance:deposit_warning"
            values={{
              currency: depositCrypto.currency?.currency,
              network: depositCrypto.network?.network,
              minAmount: depositCrypto.network?.min
            }}
            components={[<u />, <u />]}
          />
        </div>
      </WarningCard>
    </div>
  );
};
