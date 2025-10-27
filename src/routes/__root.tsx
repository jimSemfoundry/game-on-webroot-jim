import { AppProviders } from "@/providers/AppProviders";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "sonner";
import type { User, UserStatus } from "../types/auth";

/**
 * Router Context 类型定义
 * 包含全局可用的状态，可以在所有路由的 beforeLoad、loader 等钩子中访问
 */
export interface RouterContext {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    status: UserStatus | null;
    isLoading: boolean;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AppProviders>
      <Toaster position="top-center" richColors />
      <Outlet />
    </AppProviders>
  ),
});
