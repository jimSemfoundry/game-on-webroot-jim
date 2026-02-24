import { useGetPromoByPage } from "@/query/promo.tsx";
import { PropsWithChildren, useCallback, useEffect } from "react";
import { authService } from "@/services/authService.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBoundStore } from "@/store";
import { emitter } from "@/store/emitter.ts";

export const DepositPromotion = (props: PropsWithChildren) => {
  const { user } = useAuth();

  const { setDepositType } = useBoundStore();

  const { refetch: refetchPromotion } = useGetPromoByPage();

  // 充值活动激活之后立即更新一下优惠码数据，使用户更快可见
  const handleSundayPromotion = useCallback(async () => {
    if (!user?.id) return

    try {
      await authService.userAddSundayBonus();

      void refetchPromotion();
    } catch (error) {
      console.info(error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      void handleSundayPromotion();
    }
  }, [user, handleSundayPromotion]);

  /**
   * TODO:
   *  首页banner点击进入加密周四存款，需要激活 存款 & 加密Tab
   *  首页banner点击进入超级周日存款，需要激活 存款 & 法币Tab
   */
  useEffect(() => {
    const em1 = emitter.addListener("FROM_DEPOSIT_PROMOTION_SUNDAY", function() {
      setDepositType("fiat");
    });
    const em2 = emitter.addListener("FROM_DEPOSIT_PROMOTION_THURSDAY", function() {
      setDepositType("crypto");
    });

    return () => {
      em1?.remove();
      em2?.remove();
    };
  }, []);

  return (
    <>
      {props.children}
    </>
  );
};