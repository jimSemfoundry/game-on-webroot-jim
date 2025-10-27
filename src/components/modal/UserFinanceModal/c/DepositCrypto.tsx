import { AddressCard } from "@/components/modal/UserFinanceModal/c/AddressCard.tsx";
import { BonusCardForH5 } from "@/components/modal/UserFinanceModal/c/BonusCard.tsx";
import { CurrencyScrollBar } from "@/components/modal/UserFinanceModal/c/CurrencyScrollBar.tsx";
import { DepositCryptoSelect } from "@/components/modal/UserFinanceModal/c/DepositCryptoSelect.tsx";
import ExchangeRate from "@/components/modal/UserFinanceModal/c/ExchangeRate.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { useBoundStore } from "@/store";
import { Trans } from "react-i18next";
import { useCurrentPromo } from "@/query/promo";
import { SpecialOfferBanner } from "@/sections/special-offer/SpecialOfferBanner";
import { DoubleOrNothingBanner } from "@/sections/bonus/shared/double-or-nothing/DoubleOrNothingBanner";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const DepositCrypto = () => {
  // from data store, share common data
  const { depositCrypto } = useBoundStore();
  const { currentPromo, isFetching } = useCurrentPromo(); 
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex flex-col gap-4">
      <CurrencyScrollBar />
      <DepositCryptoSelect />
      <BonusCardForH5 />
      <AddressCard />
      <ExchangeRate />
      {
        !isFetching && currentPromo?.promo_code && isMobile && currentPromo?.promo_code === 'special_offer_first_deposit' && (
          <SpecialOfferBanner currentPromo={currentPromo} />
        )
      }
      {
        !isFetching && currentPromo?.promo_code && isMobile && currentPromo?.promo_code === 'special_offer_don_deposit' && (
          <DoubleOrNothingBanner currentPromo={currentPromo} />
        )
      }
      <WarningCard>
        <div className="text-xs leading-4 flex-1">
          <Trans
            i18nKey="finance:deposit_warning"
            values={{
              currency: depositCrypto.currency?.currency,
              network: depositCrypto.network?.network,
              minAmount: depositCrypto.network?.min,
            }}
            components={[<u />, <u />]}
          />
        </div>
      </WarningCard>
    </div>
  );
};
