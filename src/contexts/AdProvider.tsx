import { useLocation } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import { toUrlSearchParams } from "@/utils/urlSearchParams";

export function AdProvider({ children }: { children: ReactNode }) {
  const { search } = useLocation();

  // 设置外来链接携带的广告参数，防止三方社媒登录时候丢失
  useEffect(() => {
    if (JSON.stringify(search) !== "{}") {
      const searchParams = toUrlSearchParams(search);
      const startapp = searchParams.get("startapp");
      localStorage.setItem("startapp", startapp ?? "");
    }
  }, [search]);

  return <>{children}</>;
}
