// 触发入口：顶部钱包图标

import Iconify from "@/components/iconify";
import { BonusCardForPC } from "@/components/modal/UserFinanceModal/c/BonusCard.tsx";   
import { CryptoSettlementModal } from "@/components/modal/UserFinanceModal/c/CryptoSettlementModal.tsx";
import { DepositFiatViewModal } from "@/components/modal/UserFinanceModal/c/DepositFiatViewModal.tsx";
import { DepositMinAmountModal } from "@/components/modal/UserFinanceModal/c/DepositMinAmountModal.tsx";
import { DepositIcon } from "@/components/modal/UserFinanceModal/c/IconDeposit.tsx";
import { SwapIcon } from "@/components/modal/UserFinanceModal/c/IconSwap.tsx";
import { WithdrawIcon } from "@/components/modal/UserFinanceModal/c/IconWithdraw.tsx";
import { TransactionDetailsModal } from "@/components/modal/UserFinanceModal/c/TransactionDetailsModal.tsx";
import { WithdrawAddressAddModal } from "@/components/modal/UserFinanceModal/c/WithdrawAddressAddModal.tsx";
import { WithdrawMinAmountModal } from "@/components/modal/UserFinanceModal/c/WithdrawMinAmountModal.tsx";
import { WithdrawOkModal } from "@/components/modal/UserFinanceModal/c/WithdrawOkModal.tsx";
import { WithdrawPinModal } from "@/components/modal/UserFinanceModal/c/WithdrawPinModal.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/themeMerger.ts";
import { TFunction } from "i18next";
import { X } from "lucide-react";
import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Deposit as UserDeposit } from "./Deposit";
import { Swap as UserSwap } from "./Swap";
import { Withdraw as UserWithdraw } from "./Withdraw";
import { useCurrentPromo } from "@/query/promo";
import { SpecialOfferBannerPC } from "@/sections/special-offer/SpecialOfferBanner";   
import { DoubleOrNothingBannerPC } from "@/sections/bonus/shared/double-or-nothing/DoubleOrNothingBanner";
import classNames from "classnames";
import { WithdrawMethodInfoAddModal } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";

type UserFinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabItemsType;
};

type TabItemsType = "deposit" | "withdraw" | "swap";

const tabItems: {
  label: TabItemsType;
  trans: string;
  getIcon: (active: boolean) => ReactNode;
}[] = [
  {
    label: "deposit",
    trans: "common.deposit",
    getIcon: function (active: boolean) {
      return <DepositIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    },
  },
  {
    label: "swap",
    trans: "finance:swap",
    getIcon: function (active: boolean) {
      return <SwapIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    },
  },
  {
    label: "withdraw",
    trans: "common.withdraw",
    getIcon: function (active: boolean) {
      return <WithdrawIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    },
  },
];

const CustomModalHeader = ({ t, onClose }: { t: TFunction; onClose: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:wallet" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
        <h2 className="text-md font-extrabold">{t("finance:wallet")}</h2>
      </div>
      <button className={"btn btn-sm btn-square ltr:-mr-2 rtl:-ml-2 -mt-2 rounded-lg h-7.5 w-7.5 z-50"} onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export const DisplayContent = ({ children, status, className }: PropsWithChildren<{ status: boolean, className?: string }>) => {
  return <div className={classNames(status ? "block" : "hidden", className)}>{children}</div>;
};

const ModalHeader = ({ t }: { t: TFunction }) => {
  return (
    <div className="flex items-center gap-x-2">
      <Iconify icon="custom:wallet" className={"w-4.5 h-4.5 md:w-5 md:h-5 text-primary"} />
      <p className="text-base md:text-xl font-bold">{t("finance:wallet")}</p>
    </div>
  );
};

const TabItems = ({ t, tab, setTab, cls }: { t: TFunction; cls?: string; tab: TabItemsType; setTab: (label: TabItemsType) => void }) => {
  return tabItems.map(({ label, trans, getIcon }) => (
    <button
      key={label}
      onClick={() => setTab(label)}
      className={cn("flex-1 btn btn-sm md:btn-md font-bold border-0", cls, tab === label ? "btn-primary" : "btn-ghost")}
    >
      {getIcon(tab === label)}
      {t(trans)}
    </button>
  ));
};

// 切换 Deposit Swap Withdraw
const Display = ({ tab }: { tab: TabItemsType }) => {
  return (
    <>
      <DisplayContent status={tab === "deposit"}>
        <UserDeposit />
      </DisplayContent>
      <DisplayContent status={tab === "swap"}>
        <UserSwap />
      </DisplayContent>
      <DisplayContent status={tab === "withdraw"}>
        <UserWithdraw />
      </DisplayContent>
    </>
  );
};

export const UserFinanceModal = ({ isOpen, onClose, initialTab = "deposit" }: UserFinanceModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const [tab, setTab] = useState<TabItemsType>(initialTab);

  const { depositType } = useBoundStore();

  const { currentPromo, isFetching } = useCurrentPromo();   

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab]);

  return (
    <>
      {/* 用户资金操作窗口 */}
      <Modal
        hideTitle={!isMobile}
        closeButtonClassName={!isMobile ? "hidden" : "w-7.5 h-7.5"}
        isOpen={isOpen}
        onClose={onClose}
        title={<ModalHeader t={t} />}
        position={isMobile ? "modal-bottom" : "modal-middle"}
        className={`
        p-5 bg-base-400 hide-scrollbar md:p-0 md:rounded-lg shadow-lg 
        md:min-w-[648px]
        min-h-[calc(100%-3rem)]
        max-h-[calc(100%-3rem)]
        md:min-h-[calc(100%-9rem)]
        md:max-h-[calc(100%-9rem)]
        `}
      >
        {/*移动端*/}
        {isMobile && (
          <div>
            <div className="flex justify-between">
              <TabItems setTab={setTab} tab={tab} t={t} />
            </div>
            <Display tab={tab} />
          </div>
        )}
        {/*桌面端*/}
        {!isMobile && (
          <div className="flex">
            {/*左侧菜单*/}
            <div className="flex flex-col justify-between p-2 pr-0 md:h-[calc(100vh-9rem)]">
              <div className="flex flex-col gap-2">
                <TabItems setTab={setTab} tab={tab} t={t} cls="w-[208px] flex-none justify-start" />
              </div>
              {
                !isFetching && !currentPromo && <BonusCardForPC type={depositType} />
              }
              {
                !isFetching && currentPromo?.promo_code === 'special_offer_first_deposit' && (  
                  <SpecialOfferBannerPC currentPromo={currentPromo} />
                ) 
              } 
              {
                !isFetching && currentPromo?.promo_code === 'special_offer_don_deposit' && (
                  <DoubleOrNothingBannerPC currentPromo={currentPromo} />
                )
              }
            </div>
            {/*右侧内容*/}
            <div className="hide-scrollbar overflow-y-auto max-h-[calc(100vh-9rem)]">
              <div className="flex-1 md:bg-base-400 md:p-6">
                <CustomModalHeader t={t} onClose={onClose} />
                <Display tab={tab} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 订单交易状态窗口 */}
      <TransactionDetailsModal />
      {/* 订单确认状态窗口 */}
      <DepositFiatViewModal />
      {/* 存款最小额度窗口 */}
      <DepositMinAmountModal />
      {/* 提现最小额度窗口 */}
      <WithdrawMinAmountModal />
      {/* 添加提款地址窗口 */}
      <WithdrawAddressAddModal />
      {/* 法币提现取款码窗口 */}
      <WithdrawPinModal />
      {/* 法币提现订单已创建窗口 */}
      <WithdrawOkModal />
      {/* 代币结算提示窗口 */}
      <CryptoSettlementModal />
      {/* 法币提款快捷信息添加窗口 */}
      <WithdrawMethodInfoAddModal />
    </>
  );
};
