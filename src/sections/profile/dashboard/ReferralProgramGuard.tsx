import { PropsWithChildren } from "react";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";

export function ReferralProgramGuard(props: PropsWithChildren) {
  const { data, isLoading } = useCurrentUser();
  return (isLoading || !data?.status || data?.status?.referral_enable === 0) ? null : props.children;
}
