import { ReactNode, useEffect } from "react";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";

export const ReferralGuard = ({ children }: { children: (data: boolean) => ReactNode }) => {
  const { data, isFetching, refetch } = useCurrentUser();

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return isFetching
    ? (
      <div
        className="p-5 grid grid-rows-3 grid-rows-[1.5fr_1fr_1fr_1fr] gap-4 h-[calc(100vh-48px-72px-var(--safe-area-inset-bottom)-var(--safe-area-inset-top)))]">
        <div className="skeleton bg-base-200/40 rounded-xl" />
        <div className="skeleton bg-base-200/40 rounded-xl" />
        <div className="skeleton bg-base-200/40 rounded-xl" />
        <div className="skeleton bg-base-200/40 rounded-xl" />
      </div>
    )
    : children(data?.status?.referral_enable !== 0);
};
