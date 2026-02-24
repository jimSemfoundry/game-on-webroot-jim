import { AppProvider } from "@/contexts/AppProvider";
import { ChatwootProvider } from "@/contexts/ChatwootContext";
import { AdProvider } from "@/contexts/AdProvider";
import { RTLProvider } from "@/contexts/RTLContext";
import { SettlementCurrencyProvider } from "@/contexts/SettlementCurrencyContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAggregationBootstrap } from "@/hooks/api/usePublic";
import { MqttServiceProvider } from "@/contexts/mqtt";

/**
 * 应用全局 Providers 组合
 *
 * 注意：AuthProvider 在 main.tsx 中，不在这里
 * 因为它需要在 Router 初始化之前提供，以便 InnerApp 可以访问 useAuth
 *
 * 按照依赖顺序组织：
 * 1. SettlementCurrencyProvider - 结算货币管理
 * 2. RTLProvider - 文本方向
 * 3. ThemeProvider - 主题
 * 4. SidebarProvider - 侧边栏状态
 * 5. AppProvider - 应用通用状态
 * 6. ChatwootProvider - 客服聊天
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  useAggregationBootstrap();

  return (
    <SettlementCurrencyProvider>
      <RTLProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AdProvider>
              <AppProvider>
                <ChatwootProvider>
                  <MqttServiceProvider>
                    {children}
                  </MqttServiceProvider>
                </ChatwootProvider>
              </AppProvider>
            </AdProvider>
          </SidebarProvider>
        </ThemeProvider>
      </RTLProvider>
    </SettlementCurrencyProvider>
  );
}
