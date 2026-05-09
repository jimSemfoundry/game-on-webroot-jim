import { InnerBonusCard, InnerSlogan } from "@/sections/bonus/bonus-store/InnerComponents";

export const BonusStoreCard = () => { 
  return <div>
    <InnerSlogan />
    <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
      <InnerBonusCard />
    </div>
  </div>;
};

