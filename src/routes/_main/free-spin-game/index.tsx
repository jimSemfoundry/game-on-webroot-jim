import { FreeSpinGameSelectionV2 } from '@/sections/free-spins/free-spin-game-selection-modal-v2'
import { createFileRoute, useBlocker } from '@tanstack/react-router'
import { requireAuth } from "@/lib/auth-guards";
import { Modal } from "@/components/ui/Modal";
import { useEarliestPendingRecord } from "@/query/free-spins";
import { FreeSpinExitConfirm } from '@/sections/free-spins';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_main/free-spin-game/')({
  beforeLoad: requireAuth,
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: earliestPendingRecord,
    isPending: isEarliestPendingRecordPending,
  } = useEarliestPendingRecord();

  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const allowNavigationRef = useRef(false);
  const suppressEmptyStateRef = useRef(false);

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (!earliestPendingRecord) {
        return false;
      }

      if (allowNavigationRef.current) {
        return false;
      }

      return current.fullPath === '/free-spin-game/' && next.fullPath !== current.fullPath;
    },
    withResolver: true,
    enableBeforeUnload: false,
  });

  useEffect(() => {
    if (blocker.status === 'blocked') {
      setShowExitConfirm(true);
    }
  }, [blocker.status]);

  useEffect(() => {
    if (earliestPendingRecord) {
      suppressEmptyStateRef.current = false;
    }
  }, [earliestPendingRecord]);

  const hideExitConfirm = () => {
    blocker.reset?.();
    setShowExitConfirm(false);
  };

  const showExitConfirmModal = () => {
    setShowExitConfirm(true);
  };

  const handleExitConfirmed = () => {
    allowNavigationRef.current = true;
    setShowExitConfirm(false);
    if (blocker.status === 'blocked' && blocker.proceed) {
      blocker.proceed();
      return;
    }

    void navigate({
      to: "/casino",
      search: {
        redirect: undefined,
        startapp: undefined,
        openLogin: undefined,
        openSignUp: undefined,
        openFinance: undefined
      }
    });
  };

  // 处理成功领取
  const handleClaimSuccess = () => {
    allowNavigationRef.current = true;
    suppressEmptyStateRef.current = true;
    queryClient.setQueryData(["earliestPendingRecord", ""], null);
    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
  };

  if (!earliestPendingRecord && !isEarliestPendingRecordPending && !suppressEmptyStateRef.current) {
    return <div className="flex flex-col gap-4 items-center justify-center h-[70vh]">
      <img
        src="/images/illustrations/no-data.svg"
        alt="No data"
        className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
      />
      <div className="text-base-content/50 text-sm font-semibold">{t("common:common.noData")}</div>
      <button className="btn btn-primary" onClick={() => navigate({
        to: "/casino", search: {
          redirect: undefined,
          startapp: undefined,
          openLogin: undefined,
          openSignUp: undefined,
          openFinance: undefined
        }
      })}>
        {t("explore:back")}
      </button>
    </div>;
  }

  return (
    <>
      {
        earliestPendingRecord && (
          <>
            <div className='max-w-[416px] m-auto flex flex-col gap-4 hidden sm:block sm:h-[70vh]'>
              <FreeSpinGameSelectionV2
                freeSpinData={earliestPendingRecord}
                giveUp={showExitConfirmModal}
                onClaimSuccess={handleClaimSuccess}
              />
            </div>

            <Modal
              isOpen={true}
              onClose={() => { }}
              closeButtonClassName="hidden"
              classNameModal="sm:hidden bg-transparent h-full pointer-events-none"
              zIndex={1000}
              hideTitle
              outsideClose={false}
              className="px-0 pb-0 bg-base-400 h-full pointer-events-auto max-h-[calc(100dvh-(3rem+var(--safe-area-inset-top)))]"
            >
              <FreeSpinGameSelectionV2
                freeSpinData={earliestPendingRecord}
                giveUp={showExitConfirmModal}
                onClaimSuccess={handleClaimSuccess}
              />
            </Modal>
          </>
        )
      }
      <FreeSpinExitConfirm
        freeSpinData={earliestPendingRecord}
        open={showExitConfirm}
        onClose={hideExitConfirm}
        onExitConfirmed={handleExitConfirmed}
      />
    </>
  )
}
