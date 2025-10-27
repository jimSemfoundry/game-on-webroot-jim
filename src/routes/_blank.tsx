import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_blank")({
  component: BlankLayout,
});

/**
 * 空白布局 - 不包含任何导航、侧边栏或页脚
 * 用于登录回调、维护页面等场景
 */
export default function BlankLayout() {
  return <Outlet />;
}
