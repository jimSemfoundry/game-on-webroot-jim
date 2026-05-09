import { Modal } from "@/components/ui/Modal.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Deposit as UserDeposit } from "./Deposit";
import {
  DisplayContent, InnerCustomModalHeader, InnerModalHeader,
  InnerResetFinanceStatus,
  InnerTabItems
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { TabItemsType, useFinanceModal } from "@/contexts/ModalsProvider.tsx";

// 懒加载部分Tab组件（Swap和Withdraw）
const LazySwap = lazy(() => import("./Swap").then(module => ({ default: module.Swap })));
const LazyWithdraw = lazy(() => import("./Withdraw").then(module => ({ default: module.Withdraw })));

type UserFinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabItemsType;
};

export const UserFinanceModal = ({ isOpen, onClose, initialTab = "deposit" }: UserFinanceModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const { setUserFinanceInitialTab } = useFinanceModal();

  const [tab, setTab] = useState<TabItemsType>(initialTab);

  useEffect(() => {
    if (initialTab) setTab(initialTab.split("_")[0] as TabItemsType);
  }, [initialTab]);

  // 状态同步，方便下次再次生效
  useEffect(() => {
    setUserFinanceInitialTab(tab);
  }, [tab, setUserFinanceInitialTab]);

  return (
    <Modal
      hideTitle={!isMobile}
      closeButtonClassName={!isMobile ? "hidden" : ""}
      zIndex={1001}
      isOpen={isOpen}
      onClose={onClose}
      title={<InnerModalHeader t={t} />}
      position={isMobile ? "modal-bottom" : "modal-middle"}
      className={`
        p-5 bg-base-300 hide-scrollbar md:p-0 md:rounded-lg shadow-lg 
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

          <InnerTabDisplay tab={tab} status={isOpen} />
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
          </div>

          {/*右侧内容*/}
          <div className="hide-scrollbar overflow-y-auto max-h-[calc(100vh-9rem)] min-h-140">
            <div className="flex-1 md:p-4">
              <InnerCustomModalHeader t={t} onClose={onClose} />
              <InnerTabDisplay tab={tab} status={isOpen} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export const InnerTabDisplay = ({ tab, status }: { tab: TabItemsType, status: boolean }) => {
  return (
    <InnerResetFinanceStatus status={status}>
      <DisplayContent status={tab === "deposit"}>
        <UserDeposit />
      </DisplayContent>
      <DisplayContent status={tab === "swap"}>
        <Suspense fallback={
          <div className="flex justify-center items-center h-40">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        }>
          <LazySwap open={status} />
        </Suspense>
      </DisplayContent>
      <DisplayContent status={tab === "withdraw"}>
        <Suspense fallback={
          <div className="flex justify-center items-center h-40">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        }>
          <LazyWithdraw />
        </Suspense>
      </DisplayContent>
    </InnerResetFinanceStatus>
  );
};