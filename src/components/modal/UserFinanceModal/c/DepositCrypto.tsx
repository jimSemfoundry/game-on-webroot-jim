import { AddressCard } from "@/components/modal/UserFinanceModal/c/AddressCard.tsx";
import { CurrencyScrollBar } from "@/components/modal/UserFinanceModal/c/CurrencyScrollBar.tsx";
import { DepositCryptoSelect } from "@/components/modal/UserFinanceModal/c/DepositCryptoSelect.tsx";
import ExchangeRate from "@/components/modal/UserFinanceModal/c/ExchangeRate.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { useBoundStore } from "@/store";
import { Trans } from "react-i18next";
import { SpecialOffersH5 } from "./SpecialOffers.tsx";
import { SpecialOffersGuard } from "@/components/modal/UserFinanceModal/c/SpecialOffersGuard.tsx";

export const DepositCrypto = () => {
  // from data store, share common data
  const { depositCrypto } = useBoundStore();

  return (
    <div className="flex flex-col gap-4">
      <CurrencyScrollBar />

      <DepositCryptoSelect />

      <AddressCard />

      <ExchangeRate />

      {/* 优惠充值活动 */}
      <div className="block md:hidden">
        <SpecialOffersGuard>
          <SpecialOffersH5 />
        </SpecialOffersGuard>
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
