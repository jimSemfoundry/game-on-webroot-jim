import type { RouterContext } from "@/routes/__root";
import { redirect } from "@tanstack/react-router";

/**
 * 认证守卫 - 要求用户必须登录
 *
 * 使用方式：
 * ```typescript
 * export const Route = createFileRoute("/_main/_authenticated")({
 *   beforeLoad: requireAuth,
 *   component: ProtectedPage,
 * });
 * ```
 *
 * @param context - Router context，包含认证状态
 * @param location - 当前路由位置
 */
export const requireAuth = ({ context, location }: { context: RouterContext; location: { href: string } }) => {
  // 从 Router Context 获取认证状态（而不是从 localStorage）
  const { isAuthenticated, isLoading } = context.auth;

  // 如果还在加载中，暂时不重定向（等待认证状态确定）
  if (isLoading) {
    return;
  }

  // 如果未认证，重定向到首页并触发登录对话框
  if (!isAuthenticated) {
    // 从完整 URL 中提取路径部分
    const redirectPath = location.href.replace(window.location.origin, "");
    
    throw redirect({
      to: "/",
      search: {
        openLogin: "true" as any, // 使用 as any 避免类型错误，实际会被序列化为字符串
        redirect: redirectPath,
        startapp: undefined,
      },
    });
  }
};

/**
 * 已登录用户重定向守卫
 * 用于登录页、注册页等，已登录用户访问时自动跳转
 *
 * @param redirectTo - 重定向目标路径
 */
export const redirectIfAuthenticated = (redirectTo: string = "/casino") => {
  return ({ context }: { context: RouterContext }) => {
    const { isAuthenticated, isLoading } = context.auth;

    // 如果还在加载中，暂时不重定向
    if (isLoading) {
      return;
    }

    // 如果已认证，重定向到指定页面
    if (isAuthenticated) {
      throw redirect({ to: redirectTo });
    }
  };
};

/**
 * 角色权限守卫
 * 要求用户必须拥有特定角色
 *
 * 使用方式：
 * ```typescript
 * export const Route = createFileRoute("/admin")({
 *   beforeLoad: requireRole(['admin', 'moderator']),
 *   component: AdminPage,
 * });
 * ```
 *
 * 注意：当前 User 类型中没有 roles 字段，此守卫仅作示例
 * 需要根据实际业务逻辑实现权限判断
 */
export const requireRole = (_allowedRoles: string[]) => {
  return ({ context, location }: { context: RouterContext; location: { href: string } }) => {
    const { isAuthenticated, isLoading } = context.auth;

    if (isLoading) {
      return;
    }

    // 首先检查是否登录
    if (!isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          openLogin: "true",
          redirect: location.href,
          startapp: undefined,
        },
      });
    }

    // TODO: 实现角色权限判断逻辑
    // 当前 User 类型中没有 roles 字段，需要根据实际业务需求实现
    // 例如：根据 user.is_agent, user.is_premium 等字段判断
  };
};

/**
 * VIP 等级守卫
 * 要求用户必须达到特定 VIP 等级
 */
export const requireVipLevel = (minLevel: number) => {
  return ({ context, location }: { context: RouterContext; location: { href: string } }) => {
    const { isAuthenticated, status, isLoading } = context.auth;

    if (isLoading) {
      return;
    }

    // 首先检查是否登录
    if (!isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          openLogin: "true",
          redirect: location.href,
          startapp: undefined,
        },
      });
    }

    // 检查 VIP 等级
    const userVipLevel = status?.vip || 0;
    if (userVipLevel < minLevel) {
      throw redirect({
        to: "/vip-club",
        // VIP 页面可能没有定义 search params，使用 any 避免类型错误
      } as any);
    }
  };
};
