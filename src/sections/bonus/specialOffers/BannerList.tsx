import { DoubleOrNothingBanner, DoubleOrNothingBannerPC } from "@/sections/double-or-nothing/DoubleOrNothingBanner";
import { LimitedOfferBanner, LimitedOfferBannerPC } from "@/sections/limited-offer/LimitedOfferBanner.tsx";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import {
  ThursdaySuperBounsBannerPC
} from "@/sections/crypto-thursday-bonus/thursday-bouns-banner";
import {
  SundaySuperBounsBanner,
  SundaySuperBounsBannerPC
} from "@/sections/sunday-super-bouns/sunday-super-bouns-banner";

export const BannerList = ({ currentPromo }: { currentPromo: ICurrentPromoList | null }) => {
  return (
    <>
      {
        (currentPromo?.promo_code === "special_offer_first_deposit" || currentPromo?.promo_code === "special_offer_second_deposit") && (
          <LimitedOfferBanner currentPromo={currentPromo} />
        )
      }
      {
        currentPromo?.promo_code === "special_offer_don_deposit" && (
          <DoubleOrNothingBanner currentPromo={currentPromo} />
        )
      }
      {
        currentPromo?.promo_code === "special_offer_sunday" && (
          <SundaySuperBounsBanner currentPromo={currentPromo} />
        )
      }
    </>
  );
};

export const BannerListForPc = ({ currentPromo }: { currentPromo: ICurrentPromoList | null }) => {
  return (
    <>
      {
        (currentPromo?.promo_code === "special_offer_first_deposit" || currentPromo?.promo_code === "special_offer_second_deposit") && (
          <LimitedOfferBannerPC currentPromo={currentPromo} />
        )
      }
      {
        currentPromo?.promo_code === "special_offer_don_deposit" && (
          <DoubleOrNothingBannerPC currentPromo={currentPromo} />
        )
      }
      {
        currentPromo?.promo_code === "special_offer_thursday" && (
          <ThursdaySuperBounsBannerPC currentPromo={currentPromo} />
        )
      }
      {
        currentPromo?.promo_code === "special_offer_sunday" && (
          <SundaySuperBounsBannerPC currentPromo={currentPromo} />
        )
      }
    </>
  );
};