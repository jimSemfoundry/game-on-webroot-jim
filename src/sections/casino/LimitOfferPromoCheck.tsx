import { PropsWithChildren, useEffect } from "react";
import { useBoundStore } from "@/store";
import { authService } from "@/services/authService.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCheckDetailPromo } from "@/hooks/api/useAuth.ts";

export const LimitOfferPromoCheck = (props: PropsWithChildren) => {
  const { user } = useAuth();

  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  // 检查LimitOffer资格
  const { data: promo } = useCheckDetailPromo();

  useEffect(() => {
    if (!user) return;
    // 激活优惠活动
    if (promo?.code === 51005) {
      authService.getCurrentPromo().then((res) => {
        if (res.data) {
          setSyncAction("OPEN_LIMIT_OFFER_MODAL", res.data);
        }
      });
    }
  }, [user, promo]);

  return props.children;
};