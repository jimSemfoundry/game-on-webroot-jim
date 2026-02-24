import { useCurrentUser, useLogin, useLogout } from "@/hooks/api/useAuth";
import type { User, UserStatus } from "@/types/auth";
import { clearUserAvatar, getOrAssignUserAvatar } from "@/utils/avatar";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { uuidv4Generate } from "@/utils/helper.ts";

type AuthContextType = {
  user: User | null;
  status: UserStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginError?: string;
  isLoginLoading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  setStatus: Dispatch<SetStateAction<UserStatus | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { i18n } = useTranslation();

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // 设置用户数据和状态
  useEffect(() => {
    if (currentUser) {

      // 处理用户数据，包括头像
      const userData = { ...currentUser.user };
      if (!userData.avatar || userData.avatar.trim() === "") {
        // 如果用户没有头像，分配一个随机头像
        userData.avatar = getOrAssignUserAvatar(userData.id || userData.username);
      }

      setUser(userData);
      setStatus(currentUser.status);
    } else {
      setUser(null);
      setStatus(null);
    }
  }, [currentUser]);

  // 设置初始化状态
  useEffect(() => {
    if (!isUserLoading) {
      setIsInitialized(true);
    }
  }, [isUserLoading]);

  // 监听认证过期事件
  useEffect(() => {
    const handleAuthExpired = () => {

      // 清除用户状态
      setUser(null);
      setStatus(null);
      clearUserAvatar();

      // 可以在这里显示提示信息或进行其他处理
    };

    window.addEventListener("auth:expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, []);

  // 分离语言设置逻辑，避免过度依赖
  useEffect(() => {
    const userLanguage = currentUser?.user?.language_code;
    if (userLanguage && userLanguage !== i18n.language) {
      i18n.changeLanguage(userLanguage);
    }
  }, [currentUser?.user?.language_code, i18n.language]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const device_id = uuidv4Generate();

        const result = await loginMutation.mutateAsync({ username, password, device_id });

        // 处理用户数据，包括头像
        const userData = { ...result.user };
        if (!userData.avatar || userData.avatar.trim() === "") {
          // 如果用户没有头像，分配一个随机头像
          userData.avatar = getOrAssignUserAvatar(userData.id || userData.username);
        }

        setUser(userData);
        setStatus(result.status);

        // 登录成功后立即设置用户语言
        if (userData.language_code && userData.language_code !== i18n.language) {
          i18n.changeLanguage(userData.language_code);
        }
      } catch (error) {
        throw error;
      }
    },
    [loginMutation, i18n],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
      setStatus(null);
      // 清除本地存储的头像
      clearUserAvatar();
    } catch (error) {
      setUser(null);
      setStatus(null);
      clearUserAvatar();
      throw error;
    }
  }, [logoutMutation]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: !!user,
      isLoading: isUserLoading,
      isInitialized,
      login,
      logout,
      loginError: loginMutation.error?.message,
      isLoginLoading: loginMutation.isPending,
      setUser,
      setStatus,
    }),
    [user, status, isUserLoading, isInitialized, login, logout, loginMutation.error?.message, loginMutation.isPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
