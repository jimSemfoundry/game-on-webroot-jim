import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FreeSpinGameSelection, FreeSpinExitConfirm } from "@/sections/free-spins";
import { FreeSpinModal } from "./free-spin-starter-pack-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useEarliestPendingRecord } from "@/query/free-spins";
import { useFreeSpinsFlow } from "./hooks/useFreeSpinsFlow";
import { FreeSpinData } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";

export const FreeSpinContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: earliestPendingRecord,
    refetch: refetchEarliestPendingRecord
  } = useEarliestPendingRecord();

  // 使用自定义 Hook 管理整个流程状态
  const freeSpinsFlow = useFreeSpinsFlow();
  const skipExitPromptRef = useRef(0);
  const consumeSkipExitPrompt = () => {
    if (skipExitPromptRef.current > 0) {
      skipExitPromptRef.current -= 1;
      return true;
    }

    return false;
  };

  // Free Spins 数据（从 API 获取）
  const [freeSpinData, setFreeSpinData] = useState<FreeSpinData | null>(null);

  // 在组件挂载后15秒检查免费旋转记录
  useEffect(() => {
    if (!user?.id || !earliestPendingRecord?.id) return;

    const timeoutId = setTimeout(() => {
      if (earliestPendingRecord?.id) {
        setFreeSpinData(earliestPendingRecord);
        if (!freeSpinsFlow.isStarterPackOpen) {
          freeSpinsFlow.showStarterPack();
        }
      } else {
        setFreeSpinData(null);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, earliestPendingRecord?.id, freeSpinsFlow]);

  // 处理 Starter Pack modal 的关闭尝试
  const handleStarterPackClose = () => {
    // 如果是正在转换到游戏选择器，不显示退出确认
    if (freeSpinsFlow.isTransitioningToGameSelection) {
      freeSpinsFlow.setTransitioning(false);
      freeSpinsFlow.hideStarterPack();
      return;
    }

    if (consumeSkipExitPrompt()) {
      freeSpinsFlow.hideStarterPack();
      return;
    }

    // 不关闭starter pack，只显示确认框
    freeSpinsFlow.showExitConfirmation();
  };

  // 处理 Game Selection modal 的关闭尝试
  // const handleGameSelectionClose = () => {
  //   if (consumeSkipExitPrompt()) {
  //     freeSpinsFlow.hideExitConfirmation();
  //     return;
  //   }
  //
  //   // 如果已经成功领取，直接关闭不显示确认
  //   if (freeSpinsFlow.shouldSkipExitConfirmation) {
  //     freeSpinsFlow.hideExitConfirmation();
  //     navigate({ to: "/bonus", search: { tab: undefined } });
  //     return;
  //   }
  //
  //   // 不关闭game selection，只显示确认框
  //   freeSpinsFlow.showExitConfirmation();
  // };

  // 处理确认对话框的 Go Back
  const handleGoBack = () => {
    // 只关闭确认框，原modal自然恢复显示
    freeSpinsFlow.hideExitConfirmation();
  };

  // 处理确认对话框的 Exit Anyway
  const handleExitConfirmed = () => {
    freeSpinsFlow.resetAll();
  };

  // 处理 Continue 按钮（从 Starter Pack 到 Game Selection）
  const handleContinueToGameSelection = () => {
    freeSpinsFlow.setTransitioning(true);
    freeSpinsFlow.hideExitConfirmation();
    freeSpinsFlow.hideStarterPack();
    freeSpinsFlow.showGameSelection();
  };

  // 处理成功领取
  const handleClaimSuccess = () => {
    queryClient.setQueryData(["earliestPendingRecord", ""], null);
    setFreeSpinData(null);

    const autoClosingModals =
      (freeSpinsFlow.isStarterPackOpen ? 1 : 0) +
      (freeSpinsFlow.isGameSelectionOpen ? 1 : 0);

    skipExitPromptRef.current = Math.max(autoClosingModals, 1);
    // 标记成功状态并直接导航，不触发modal的onClose
    freeSpinsFlow.markClaimSuccess();
    freeSpinsFlow.closeAll();
    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
  };

  // TODO: 事件通知
  //       服务于bonus页面手动优惠码需求,确保FreeSpins有数据了再完成跳转,用户可以第一时间在首页看到FreeSpins
  //       EMQX - 优惠码使用结果通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/free_spin` : null);

  const latest = parsedMessages?.[0];
  const lastProcessedRecordIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newRecordId = latest?.parsed?.record_id;
    
    if (newRecordId && newRecordId !== lastProcessedRecordIdRef.current) {
      lastProcessedRecordIdRef.current = newRecordId;
      void refetchEarliestPendingRecord();
    }
  }, [latest?.parsed?.record_id, refetchEarliestPendingRecord]);

  // 如果用户未登录，不渲染任何内容
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Starter Pack Modal */}
      <FreeSpinModal
        isOpen={freeSpinsFlow.isStarterPackOpen}
        onClose={handleStarterPackClose}
        onContinue={handleContinueToGameSelection}
        freeSpinData={freeSpinData || undefined}
      />

      {/* Game Selection Modal */}
      <FreeSpinGameSelection
        open={freeSpinsFlow.isGameSelectionOpen}
        freeSpinData={freeSpinData}
        onExit={() => freeSpinsFlow.hideGameSelection()}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* Exit Confirmation Modal */}
      <FreeSpinExitConfirm
        freeSpinData={freeSpinData}
        open={freeSpinsFlow.isExitConfirmationOpen}
        onClose={handleGoBack}
        onExitConfirmed={handleExitConfirmed}
      />
    </>
  );
};
