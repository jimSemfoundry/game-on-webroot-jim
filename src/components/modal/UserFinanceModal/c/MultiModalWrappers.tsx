import { lazy, Suspense } from "react";
import { useBoundStore } from "@/store";

const BonusSwapModal = lazy(() => import("../../BonusWallet/BonusSwapModal"));
const FinanceAMLModal = lazy(() => import("./FinanceAMLModal.tsx"));
const BuddyBallsDetailsModal = lazy(() => import("@/sections/bonus/buddy-ball/details.tsx"));
const LuckySpinDetailsModal = lazy(() => import("@/sections/lucky-spin/details.tsx"));
const GetPromoCodeModal = lazy(() => import("../../GetPromoCodeModal.tsx"));
const PlayBonusDetailsModal = lazy(() => import("../../BonusWallet/PlayBonusDetailsModal.tsx"));
const WheelFortuneWinModal = lazy(() => import("../../BonusWallet/WheelFortuneWinModal.tsx"));
const FiatChannelModal = lazy(() => import("../../FiatChannelModal.tsx"));
const ReferralShareModalBigWin = lazy(() => import("@/sections/referral/referral-share-bigwin.tsx").then((module) => ({ default: module.ReferralShareModalBigWin })));
const SportsBonusSwapModal = lazy(() => import("@/components/modal/BonusWallet/SportsBonus/SportsBonusSwapModal.tsx"));
const SportsBonusDetailsModal = lazy(() => import("@/components/modal/BonusWallet/SportsBonus/SportsBonusDetailsModal.tsx"));

// 独立的弹窗包装组件，每个组件独立订阅自己的状态，完全隔离渲染

export const BonusSwapModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_BONUS_SWAP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_BONUS_SWAP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  // 提款AML措施-错误提示
  return (
    <Suspense fallback={null}>
      <BonusSwapModal open data={data} onClose={() => closeModal("OPEN_BONUS_SWAP_MODAL")} />
    </Suspense>
  );
};

export const FinanceAMLModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FINANCE_AML_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  // 提款AML措施-错误提示
  return (
    <Suspense fallback={null}>
      <FinanceAMLModal open onClose={() => closeModal("OPEN_FINANCE_AML_MODAL")} />
    </Suspense>
  );
};

export const FiatChannelModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_FIAT_CHANNEL_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_FIAT_CHANNEL_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <FiatChannelModal open data={data} onClose={() => closeModal("OPEN_FIAT_CHANNEL_MODAL")} />
    </Suspense>
  );
};

export const GetPromoCodeModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_GET_PROMO_CODE_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_GET_PROMO_CODE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <GetPromoCodeModal
        open
        onClose={() => closeModal("OPEN_GET_PROMO_CODE_MODAL")}
        data={data}
      />
    </Suspense>
  );
};

export const PlayBonusDetailsModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_PLAY_BONUS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_PLAY_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <PlayBonusDetailsModal open data={data} onClose={() => closeModal("OPEN_PLAY_BONUS_MODAL")} />
    </Suspense>
  );
};

export const BuddyBallsDetailsModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_BUDDY_BALLS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <BuddyBallsDetailsModal open onClose={() => closeModal("OPEN_BUDDY_BALLS_MODAL")} />
    </Suspense>
  );
};

export const LuckySpinDetailsModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_LUCKY_SPIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <LuckySpinDetailsModal open onClose={() => closeModal("OPEN_LUCKY_SPIN_MODAL")} />
    </Suspense>
  );
};

export const SportsBonusSwapModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_SPORTS_BONUS_SWAP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_SPORTS_BONUS_SWAP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <SportsBonusSwapModal open data={data} onClose={() => closeModal("OPEN_SPORTS_BONUS_SWAP_MODAL")} />
    </Suspense>
  );
};

export const WheelFortuneModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_WHEEL_FORTUNE_WIN_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_WHEEL_FORTUNE_WIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <WheelFortuneWinModal
        open
        onClose={() => closeModal("OPEN_WHEEL_FORTUNE_WIN_MODAL")}
        data={data}
      />
    </Suspense>
  );
};

export const SportsBonusDetailsModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_PLAY_SPORTS_BONUS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_PLAY_SPORTS_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <SportsBonusDetailsModal open data={data} onClose={() => closeModal("OPEN_PLAY_SPORTS_BONUS_MODAL")} />
    </Suspense>
  );
};

export const ReferralShareModalBigWinWrapper = () => {
  const open = useBoundStore((state) => "OPEN_REFERRAL_SHARE_BIG_WIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <ReferralShareModalBigWin closeModal={() => closeModal("OPEN_REFERRAL_SHARE_BIG_WIN_MODAL")} />
    </Suspense>
  );
};