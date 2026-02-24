import type { ComponentType } from "react";
import { Suspense, lazy, useMemo } from "react";
import { useBoundStore } from "@/store";
import { TActions } from "@/store/type.ts";
import {
  OptionalBonusModalWrapper,
  MegaSlotBonusModalWrapper,
  MiniSlotBonusModalWrapper,
  FreePlayBonusModalWrapper, WithdrawAMLModalWrapper
} from "./MultiModalWrappers.tsx";

const WithdrawOkModal = lazy(() => import("./WithdrawOkModal.tsx"));
const GiveUpBonusModal = lazy(() => import("@/components/modal/GiveUpBonusModal.tsx"));
const WithdrawPinModal = lazy(() => import("./WithdrawPinModal.tsx"));
const WithdrawMinAmountModal = lazy(() => import("./WithdrawMinAmountModal.tsx"));
const WithdrawAddressAddModal = lazy(() => import("./WithdrawAddressAddModal.tsx"));
const WithdrawMethodInfoAddModal = lazy(() => import("./WithdrawMethodInfoAddModal.tsx"));

const DepositFiatViewModal = lazy(() => import("./DepositFiatViewModal.tsx"));
const DepositMinAmountModal = lazy(() => import("./DepositMinAmountModal.tsx"));
const TransactionDetailsModal = lazy(() => import("./TransactionDetailsModal.tsx"));

const CryptoSettlementModal = lazy(() => import("./CryptoSettlementModal.tsx"));

const WelcomeSignUpModal = lazy(() => import("./WelcomeSignUpModal.tsx"));

const SetWithdrawalPINModal = lazy(() => import("@/sections/profile/security/SetWithdrawalPINModal.tsx"));
const BonusClaimResponseModal = lazy(() => import("@/sections/bonus/BonusClaimStatus.tsx"));
const ExtraReferralBonusModal = lazy(() => import("@/components/modal/ExtraReferralBonus.tsx"));
const VIPMondayBonusModal = lazy(() => import("@/components/modal/VIPMondayBonus.tsx"));

const EmailVerificationModal = lazy(() => import("@/sections/profile/security/EmailVerificationModal.tsx"));
const ChangePasswordModal = lazy(() => import("@/sections/profile/security/ChangePasswordModal.tsx"));
const PhoneVerificationModal = lazy(() => import("@/sections/profile/security/PhoneVerificationModal.tsx"));

const LimitedOfferModal = lazy(() => import("@/sections/limited-offer/LimitedOffer.tsx"));

type ModalComponent = ComponentType<Record<string, never>>;

const MODAL_REGISTRY: Record<string, ReturnType<typeof lazy<ModalComponent>>> = {
  // 存款最小额度窗口
  OPEN_DEPOSIT_MIN_AMOUNT_MODAL: DepositMinAmountModal,

  // 订单交易状态窗口
  OPEN_TRANSACTION_DETAILS_MODAL: TransactionDetailsModal,

  // 法币提现订单已创建窗口
  OPEN_WITHDRAW_ORDER_OK_MODAL: WithdrawOkModal,

  // 提现最小额度窗口
  OPEN_WITHDRAW_MIN_AMOUNT_MODAL: WithdrawMinAmountModal,

  // 添加提款地址窗口
  OPEN_WITHDRAW_ADDRESS_ADD_MODAL: WithdrawAddressAddModal,

  // 代币结算提示窗口
  OPEN_CRYPTO_SETTLEMENT_MODAL: CryptoSettlementModal

};

const FinanceModalManager = () => {
  const { syncAction, setSyncAction } = useBoundStore();

  const modalType = (syncAction as { type?: TActions } | undefined)?.type;
  const modalData = (syncAction as { data?: unknown } | undefined)?.data;

  const Modal = useMemo(() => {
    if (!modalType) return null;
    // TODO: 长期任务，把窗口的控制权转移，避免加载时序带来的问题
    if (modalType === "OPEN_LIMIT_OFFER_MODAL") return null;
    if (modalType === "OPEN_GIVE_UP_BONUS_MODAL") return null;
    if (modalType === "OPEN_WELCOME_SIGN_UP_MODAL") return null;
    if (modalType === "OPEN_CHANGE_PASSWORD_MODAL") return null;
    if (modalType === "OPEN_VIP_MONDAY_BONUS_MODAL") return null;
    if (modalType === "OPEN_DEPOSIT_FIAT_VIEW_MODAL") return null;
    if (modalType === "OPEN_PHONE_VERIFICATION_MODAL") return null;
    if (modalType === "OPEN_EMAIL_VERIFICATION_MODAL") return null;
    if (modalType === "OPEN_SET_WITHDRAWAL_PIN_MODAL") return null;
    if (modalType === "OPEN_WITHDRAW_METHOD_ADD_MODAL") return null;
    if (modalType === "OPEN_BONUS_CLAIM_RESPONSE_MODAL") return null;
    if (modalType === "OPEN_EXTRA_REFERRAL_BONUS_MODAL") return null;
    if (modalType === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" || modalType === "OPEN_WITHDRAW_FIAT_PIN_MODAL") return null;
    return MODAL_REGISTRY[modalType] ?? null;
  }, [modalType]);

  const content = useMemo(() => {
    if (modalType === "OPEN_LIMIT_OFFER_MODAL") {
      return <LimitedOfferModal open data={modalData} onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_GIVE_UP_BONUS_MODAL") {
      return <GiveUpBonusModal open data={modalData} onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_WELCOME_SIGN_UP_MODAL") {
      // 引导用户注册拿福利
      return <WelcomeSignUpModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_CHANGE_PASSWORD_MODAL") {
      // 用户修改密码
      return <ChangePasswordModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_VIP_MONDAY_BONUS_MODAL") {
      // 赏金领取状态窗口
      return <VIPMondayBonusModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_DEPOSIT_FIAT_VIEW_MODAL") {
      // 订单确认状态窗口
      return <DepositFiatViewModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_EMAIL_VERIFICATION_MODAL") {
      // 用户验证绑定邮箱
      return <EmailVerificationModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_SET_WITHDRAWAL_PIN_MODAL") {
      // 设置或者修改PIN码
      return (
        <SetWithdrawalPINModal
          open
          data={modalData}
          onClose={() => setSyncAction(undefined)}
        />
      );
    }
    if (modalType === "OPEN_PHONE_VERIFICATION_MODAL") {
      // 用户绑定手机号
      return <PhoneVerificationModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_WITHDRAW_METHOD_ADD_MODAL") {
      // 法币提款快捷信息添加窗口
      return <WithdrawMethodInfoAddModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_EXTRA_REFERRAL_BONUS_MODAL") {
      // 首次推荐奖励窗口
      return <ExtraReferralBonusModal open onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_BONUS_CLAIM_RESPONSE_MODAL") {
      // 赏金领取状态窗口
      return <BonusClaimResponseModal open data={modalData} onClose={() => setSyncAction(undefined)} />;
    }
    if (modalType === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" || modalType === "OPEN_WITHDRAW_FIAT_PIN_MODAL") {
      // 法币/加密货币提现取款码窗口
      return <WithdrawPinModal open data={modalType} onClose={() => setSyncAction(undefined)} />;
    }
    if (Modal) return <Modal />;
    return null;
  }, [Modal, modalData, modalType, setSyncAction]);

  return (
    <>
      {/* 单窗口, 每次只会保留一个 */}
      <Suspense fallback={null}>
        {content}
      </Suspense>

      {/* 支持多窗口 */}
      <WithdrawAMLModalWrapper />
      <OptionalBonusModalWrapper />
      <MegaSlotBonusModalWrapper />
      <MiniSlotBonusModalWrapper />
      <FreePlayBonusModalWrapper />
    </>
  );
};

export default FinanceModalManager;