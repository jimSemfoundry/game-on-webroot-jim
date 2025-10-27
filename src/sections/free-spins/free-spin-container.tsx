import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FreeSpinGameSelection, FreeSpinExitConfirm } from "@/sections/free-spins";
import { FreeSpinModal } from "./free-spin-starter-pack-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useEarliestPendingRecord } from "@/query/free-spins";
import { useFreeSpinsFlow } from "./hooks/useFreeSpinsFlow";
import { FreeSpinData } from "./types";
import { FREE_SPINS_CONFIG } from "./constants";
import { useQueryClient } from "@tanstack/react-query";

export const FreeSpinContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: earliestPendingRecord, isLoading, isError } = useEarliestPendingRecord();

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
    if (!user || isLoading || isError) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (earliestPendingRecord) {
        setFreeSpinData(earliestPendingRecord);
        freeSpinsFlow.showStarterPack();
      } else {
        setFreeSpinData(null);
      }
    }, FREE_SPINS_CONFIG.AUTO_SHOW_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, earliestPendingRecord, isLoading, isError, freeSpinsFlow]);

  // 处理 Starter Pack modal 的关闭尝试
  const handleStarterPackClose = () => {
    // 如果是正在转换到游戏选择器，不显示退出确认
    if (freeSpinsFlow.isTransitioningToGameSelection) {
      freeSpinsFlow.setTransitioning(false);
      return;
    }

    if (consumeSkipExitPrompt() || freeSpinsFlow.shouldSkipExitConfirmation) {
      return;
    }
    
    // 不关闭starter pack，只显示确认框
    freeSpinsFlow.showExitConfirmation();
  };

  // 处理 Game Selection modal 的关闭尝试
  const handleGameSelectionClose = () => {
    if (consumeSkipExitPrompt()) {
      return;
    }

    // 如果已经成功领取，直接关闭不显示确认
    if (freeSpinsFlow.shouldSkipExitConfirmation) {
      navigate({ to: '/bonus' });
      return;
    }
    
    // 不关闭game selection，只显示确认框
    freeSpinsFlow.showExitConfirmation();
  };

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
    freeSpinsFlow.showGameSelection();
  };

  // 处理成功领取
  const handleClaimSuccess = () => {
    queryClient.setQueryData(["earliestPendingRecord"], null);
    setFreeSpinData(null);

    const autoClosingModals =
      (freeSpinsFlow.isStarterPackOpen ? 1 : 0) +
      (freeSpinsFlow.isGameSelectionOpen ? 1 : 0);

    skipExitPromptRef.current = Math.max(autoClosingModals, 1);
    // 标记成功状态并直接导航，不触发modal的onClose
    freeSpinsFlow.markClaimSuccess();
    freeSpinsFlow.closeAll();
    navigate({ to: '/bonus' });
  };

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
        modalState={freeSpinsFlow.starterPackModalState}
        onModalStateChange={freeSpinsFlow.setStarterPackModalState}
        wonAmount={freeSpinsFlow.starterPackWonAmount}
        onWonAmountChange={freeSpinsFlow.setStarterPackWonAmount}
      />
      
      {/* Game Selection Modal */}
      <FreeSpinGameSelection
        open={freeSpinsFlow.isGameSelectionOpen}
        freeSpinData={freeSpinData}
        onExit={handleGameSelectionClose}
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
