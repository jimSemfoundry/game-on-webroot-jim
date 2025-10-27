import { useLocation } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";

export function AdProvider({ children }: { children: ReactNode }) {
  const { search } = useLocation();

  // 设置外来链接携带的广告参数，防止三方社媒登录时候丢失
  useEffect(() => {
    if (JSON.stringify(search) !== "{}") {
      const searchParams = new URLSearchParams(search);
      const startapp = searchParams.get("startapp");
      localStorage.setItem("startapp", startapp ?? "");
    }
  }, [search]);

  return <>{children}</>;
}
