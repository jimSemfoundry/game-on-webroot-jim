import { lazy, Suspense } from "react";
import { useBoundStore } from "@/store";

const WithdrawAMLModal = lazy(() => import("./WithdrawAMLModal.tsx"));

const OptionalBonusModal = lazy(() => import("@/components/modal/bonus-wallet/OptionalBonus.tsx"));
const MegaSlotBonusModal = lazy(() => import("@/components/modal/bonus-wallet/MegaSlotBonus.tsx"));
const MiniSlotBonusModal = lazy(() => import("@/components/modal/bonus-wallet/MiniSlotBonus.tsx"));
const FreePlayBonusModal = lazy(() => import("@/components/modal/bonus-wallet/FreePlayBonus.tsx"));

// 独立的弹窗包装组件，每个组件独立订阅自己的状态，完全隔离渲染
export const WithdrawAMLModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FINANCE_AML_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  
  if (!open) return null;

  // 提款AML措施-错误提示
  return (
    <Suspense fallback={null}>
      <WithdrawAMLModal open onClose={() => closeModal("OPEN_FINANCE_AML_MODAL")} />
    </Suspense>
  );
};

export const OptionalBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_OPTIONAL_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <OptionalBonusModal open onClose={() => closeModal("OPEN_OPTIONAL_BONUS_MODAL")} />
    </Suspense>
  );
};

export const MegaSlotBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MEGA_SLOT_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  
  if (!open) return null;
  
  return (
    <Suspense fallback={null}>
      <MegaSlotBonusModal open onClose={() => closeModal("OPEN_MEGA_SLOT_BONUS_MODAL")} />
    </Suspense>
  );
};

export const MiniSlotBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MINI_SLOT_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  
  if (!open) return null;
  
  return (
    <Suspense fallback={null}>
      <MiniSlotBonusModal open onClose={() => closeModal("OPEN_MINI_SLOT_BONUS_MODAL")} />
    </Suspense>
  );
};

export const FreePlayBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FREE_PLAY_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  
  if (!open) return null;
  
  return (
    <Suspense fallback={null}>
      <FreePlayBonusModal open onClose={() => closeModal("OPEN_FREE_PLAY_BONUS_MODAL")} />
    </Suspense>
  );
};
