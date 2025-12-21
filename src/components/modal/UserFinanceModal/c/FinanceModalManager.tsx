import { Suspense, lazy } from "react";
import { useBoundStore } from "@/store";

const WithdrawOkModal = lazy(() => import("./WithdrawOkModal.tsx"));
const WithdrawPinModal = lazy(() => import("./WithdrawPinModal.tsx"));
const WelcomeSignUpModal = lazy(() => import("./WelcomeSignUpModal.tsx"));
const DepositFiatViewModal = lazy(() => import("./DepositFiatViewModal.tsx"));
const DepositMinAmountModal = lazy(() => import("./DepositMinAmountModal.tsx"));
const CryptoSettlementModal = lazy(() => import("./CryptoSettlementModal.tsx"));
const WithdrawMinAmountModal = lazy(() => import("./WithdrawMinAmountModal.tsx"));
const TransactionDetailsModal = lazy(() => import("./TransactionDetailsModal.tsx"));
const WithdrawAddressAddModal = lazy(() => import("./WithdrawAddressAddModal.tsx"));
const WithdrawMethodInfoAddModal = lazy(() => import("./WithdrawMethodInfoAddModal.tsx"));
const SetWithdrawalPINModal = lazy(() => import("@/sections/profile/security/SetWithdrawalPINModal.tsx"));
const BonusClaimResponseModal = lazy(() => import("@/sections/bonus/BonusClaimStatus.tsx"));
const ExtraReferralBonusModal = lazy(() => import("@/components/modal/ExtraReferralBonus.tsx"));

const FinanceModalManager = () => {
  const { syncAction } = useBoundStore();

  const renderModal = () => {
    switch (syncAction.type) {
      // 法币提现订单已创建窗口
      case "OPEN_WITHDRAW_ORDER_OK_MODAL":
        return <WithdrawOkModal />;

      // 订单确认状态窗口
      case "OPEN_DEPOSIT_FIAT_VIEW_MODAL":
        return <DepositFiatViewModal />;

      // 订单交易状态窗口
      case "OPEN_TRANSACTION_DETAILS_MODAL":
        return <TransactionDetailsModal />;

      // 存款最小额度窗口
      case "OPEN_DEPOSIT_MIN_AMOUNT_MODAL":
        return <DepositMinAmountModal />;

      // 提现最小额度窗口
      case "OPEN_WITHDRAW_MIN_AMOUNT_MODAL":
        return <WithdrawMinAmountModal />;

      // 添加提款地址窗口
      case "OPEN_WITHDRAW_ADDRESS_ADD_MODAL":
        return <WithdrawAddressAddModal />;

      // 法币提现取款码窗口
      case "OPEN_WITHDRAW_FIAT_PIN_MODAL":
      case "OPEN_WITHDRAW_CRYPTO_PIN_MODAL":
        return <WithdrawPinModal />;

      // 代币结算提示窗口
      case "OPEN_CRYPTO_SETTLEMENT_MODAL":
        return <CryptoSettlementModal />;

      // 法币提款快捷信息添加窗口
      case "OPEN_WITHDRAW_METHOD_ADD_MODAL":
        return <WithdrawMethodInfoAddModal />;

      // 用奖励引导注册窗口
      case "OPEN_WELCOME_SIGN_UP_MODAL":
        return <WelcomeSignUpModal />;

      // 赏金领取状态窗口
      case "OPEN_BONUS_CLAIM_RESPONSE_MODAL":
        return <BonusClaimResponseModal />;

      // 设置或者修改PIN码
      case "OPEN_SET_WITHDRAWAL_PIN_MODAL":
        return <SetWithdrawalPINModal />;

      // extra referral bonus tips
      case "OPEN_EXTRA_REFERRAL_BONUS_MODAL":
        return <ExtraReferralBonusModal />;

      default:
        return null;
    }
  };

  return (
    <Suspense fallback={null}>
      {renderModal()}
    </Suspense>
  );
};

export default FinanceModalManager;