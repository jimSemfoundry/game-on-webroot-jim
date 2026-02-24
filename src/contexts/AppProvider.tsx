import { DisplayCurrencyProvider } from "./DisplayCurrencyContext";
import { ModalsProvider } from "./ModalsProvider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <DisplayCurrencyProvider>
      <ModalsProvider>{children}</ModalsProvider>
    </DisplayCurrencyProvider>
  );
}
