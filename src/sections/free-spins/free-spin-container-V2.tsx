import { useState, useEffect } from "react";
import { FreeSpinExitConfirm } from "@/sections/free-spins";
import { FreeSpinModal } from "./free-spin-starter-pack-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useEarliestPendingRecord } from "@/query/free-spins";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useLocation, useNavigate } from "@tanstack/react-router";

export const FreeSpinContainerV2 = () => {
  const { user } = useAuth();
  const {
    data: earliestPendingRecord,
    refetch: refetchEarliestPendingRecord
  } = useEarliestPendingRecord();

  const location = useLocation();
  const navigate = useNavigate();
  // 使用自定义 Hook 管理整个流程状态

  const [showStarterPack, setShowStarterPack] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);


  // 在组件挂载后15秒检查免费旋转记录
  useEffect(() => {
    if (!user?.id || !earliestPendingRecord?.id) return;

    const timeoutId = setTimeout(() => {
      if (earliestPendingRecord?.id) {
        setShowStarterPack(location.pathname !== '/free-spin-game');
        setShowExitConfirmation(false);
        setIsGameSelectionOpen(false);
      } else {
        setShowStarterPack(false);
        setShowExitConfirmation(false);
        setIsGameSelectionOpen(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, earliestPendingRecord?.id, location.pathname]);

  // 处理 Starter Pack modal 的关闭尝试
  const handleStarterPackClose = () => {
    if (isGameSelectionOpen) {
      return;
    }

    setShowExitConfirmation(true);
  };

  const handleGoBack = () => {
    setShowExitConfirmation(false);
  };

  const handleExitConfirmed = () => {
    setShowExitConfirmation(false);
    setShowStarterPack(false);
    setIsGameSelectionOpen(false);
  };

  // 处理 Continue 按钮（从 Starter Pack 到 Game Selection）
  const handleContinueToGameSelection = () => {
    setShowStarterPack(false);
    setIsGameSelectionOpen(true);
    navigate({ to: "/free-spin-game" });
  };

  // TODO: 事件通知
  //       服务于bonus页面手动优惠码需求,确保FreeSpins有数据了再完成跳转,用户可以第一时间在首页看到FreeSpins
  //       EMQX - 优惠码使用结果通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/free_spin` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    if (latest?.parsed?.record_id) {
      void refetchEarliestPendingRecord();
    }
  }, [latest?.parsed?.record_id, refetchEarliestPendingRecord]);

  // 如果用户未登录，不渲染任何内容
  if (!user) {
    return null;
  }

  if (!earliestPendingRecord) {
    return null;
  }

  return (
    <>
      {/* Starter Pack Modal */}
      <FreeSpinModal
        isOpen={showStarterPack}
        onClose={handleStarterPackClose}
        onContinue={handleContinueToGameSelection}
        freeSpinData={earliestPendingRecord || undefined}
      />

      {/* Game Selection Modal */}
      {/* <FreeSpinGameSelection
        open={freeSpinsFlow.isGameSelectionOpen}
        freeSpinData={freeSpinData}
        onExit={() => freeSpinsFlow.hideGameSelection()}
        giveUp={() => freeSpinsFlow.showExitConfirmation()}
        onClaimSuccess={handleClaimSuccess}
      /> */}

      {/* Exit Confirmation Modal */}
      <FreeSpinExitConfirm
        freeSpinData={earliestPendingRecord}
        open={showExitConfirmation}
        onClose={handleGoBack}
        onExitConfirmed={handleExitConfirmed}
      />
    </>
  );
};
