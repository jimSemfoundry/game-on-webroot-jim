import Iconify from "@/components/iconify";
import { DepositIcon } from "@/components/modal/UserFinanceModal/c/IconDeposit.tsx";
import { SwapIcon } from "@/components/modal/UserFinanceModal/c/IconSwap.tsx";
import { WithdrawIcon } from "@/components/modal/UserFinanceModal/c/IconWithdraw.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { cn } from "@/utils/themeMerger.ts";
import { TFunction } from "i18next";
import { X } from "lucide-react";
import { ReactNode, useState, useEffect, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Deposit as UserDeposit } from "./Deposit";
import { Swap as UserSwap } from "./Swap";
import { Withdraw as UserWithdraw } from "./Withdraw";
import { SpecialOffersPC } from "@/components/modal/UserFinanceModal/c/SpecialOffers.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import FinanceModalManager from "@/components/modal/UserFinanceModal/c/FinanceModalManager.tsx";
import { TabItemsType, useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { useLocation } from "@tanstack/react-router";

type UserFinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabItemsType;
};

const tabItems: {
  label: TabItemsType;
  trans: string;
  getIcon: (active: boolean) => ReactNode;
}[] = [
  {
    label: "deposit",
    trans: "common.deposit",
    getIcon: function(active: boolean) {
      return <DepositIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    }
  },
  {
    label: "swap",
    trans: "finance:swap",
    getIcon: function(active: boolean) {
      return <SwapIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    }
  },
  {
    label: "withdraw",
    trans: "common.withdraw",
    getIcon: function(active: boolean) {
      return <WithdrawIcon customCls={active ? "" : "text-primary"} className={"w-4 h-4 md:w-5 md:h-5"} />;
    }
  }
];

export const UserFinanceModal = ({ isOpen, onClose, initialTab = "deposit" }: UserFinanceModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { setUserFinanceInitialTab, closeUserFinanceModal } = useFinanceModal();

  const [tab, setTab] = useState<TabItemsType>(initialTab);

  useEffect(() => {
    if (initialTab) setTab(initialTab.split("_")[0] as TabItemsType);
  }, [initialTab]);

  // 状态同步，方便下次再次生效
  useEffect(() => {
    setUserFinanceInitialTab(tab);
  }, [tab, setUserFinanceInitialTab]);

  // 路由切换的时候关闭打开的Finance窗口
  useEffect(() => {
    closeUserFinanceModal();
  }, [pathname]);

  return (
    <>
      <Modal
        hideTitle={!isMobile}
        closeButtonClassName={!isMobile ? "hidden" : "w-7.5 h-7.5"}
        isOpen={isOpen}
        onClose={onClose}
        title={<InnerModalHeader t={t} />}
        position={isMobile ? "modal-bottom" : "modal-middle"}
        className={`
        !z-996
        p-5 bg-base-400 hide-scrollbar md:p-0 md:rounded-lg shadow-lg 
        md:min-w-[648px]
        min-h-[calc(85%)]
        max-h-[calc(85%)]
        md:min-h-auto
        md:max-h-auto
        `}
      >
        {/*移动端*/}
        {isMobile && (
          <div>
            <div className="flex justify-between">
              <InnerTabItems setTab={setTab} tab={tab} t={t} />
            </div>
            <InnerDisplay tab={tab} status={isOpen} />
          </div>
        )}
        {/*桌面端*/}
        {!isMobile && (
          <div className="flex">
            {/*左侧菜单*/}
            <div className="flex flex-col justify-between p-2 pr-0">
              <div className="flex flex-col gap-2">
                <InnerTabItems setTab={setTab} tab={tab} t={t} cls="w-[208px] flex-none justify-start" />
              </div>

              <SpecialOffersPC />

            </div>
            {/*右侧内容*/}
            <div className="hide-scrollbar overflow-y-auto max-h-[calc(100vh-9rem)] min-h-140">
              <div className="flex-1 md:bg-base-400 md:p-6">
                <InnerCustomModalHeader t={t} onClose={onClose} />
                <InnerDisplay tab={tab} status={isOpen} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <FinanceModalManager />
    </>
  );
};
/********************/
/********************/
/********************/
/********************/
const InnerDisplay = ({ tab, status }: { tab: TabItemsType, status: boolean }) => {
  return (
    <InnerResetFinanceStatus status={status}>
      <DisplayContent status={tab === "deposit"}>
        <UserDeposit />
      </DisplayContent>
      <DisplayContent status={tab === "swap"}>
        <UserSwap open={status} />
      </DisplayContent>
      <DisplayContent status={tab === "withdraw"}>
        <UserWithdraw />
      </DisplayContent>
    </InnerResetFinanceStatus>
  );
};

const InnerTabItems = ({ t, tab, setTab, cls }: {
  t: TFunction;
  cls?: string;
  tab: TabItemsType;
  setTab: (label: TabItemsType) => void
}) => {
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

const InnerModalHeader = ({ t }: { t: TFunction }) => {
  return (
    <div className="flex items-center gap-x-2">
      <Iconify icon="custom:wallet" className={"w-4.5 h-4.5 md:w-5 md:h-5 text-primary"} />
      <p className="text-base md:text-xl font-bold">{t("finance:wallet")}</p>
    </div>
  );
};

const InnerCustomModalHeader = ({ t, onClose }: { t: TFunction; onClose: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:wallet" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
        <h2 className="text-md font-extrabold">{t("finance:wallet")}</h2>
      </div>
      <button className={"btn btn-sm btn-square ltr:-mr-2 rtl:-ml-2 -mt-2 rounded-lg h-7.5 w-7.5 z-50"}
              onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

const InnerResetFinanceStatus = ({ status, children }: PropsWithChildren<{ status: boolean }>) => {
  // from data store, share common data
  const { setSyncAction } = useBoundStore();

  // finance有部分数据的状态重置无法照顾到，需要通知
  useEffect(() => {
    if (!status) setSyncAction("CLOSE_FINANCE_MODAL");
  }, [status]);

  return <>{children}</>;
};