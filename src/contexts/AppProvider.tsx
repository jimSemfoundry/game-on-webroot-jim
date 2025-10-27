import { AuthProvider } from "./AuthContext";
import { DisplayCurrencyProvider } from "./DisplayCurrencyContext";
import { ModalsProvider } from "./ModalsProvider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DisplayCurrencyProvider>
        <ModalsProvider>{children}</ModalsProvider>
      </DisplayCurrencyProvider>
    </AuthProvider>
  );
}
