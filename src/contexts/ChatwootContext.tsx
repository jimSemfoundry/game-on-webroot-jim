import { useAuth } from "@/contexts/AuthContext";
import { useChatwootInboxId } from "@/hooks/api/usePublic";
import { useChatwoot } from "@/hooks/useChatwoot";
import dayjs from "dayjs";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { emitter } from "@/store/emitter.ts";

interface ChatwootContextType {
  toggleWidget: () => void;
  openWidget: () => void;
  setUser: (userId: string | number, userAttributes: any) => void;
  setCustomAttributes: (attributes: any) => void;
  reset: () => void;
  isInitialized: boolean;
  updateToken: (newToken: string) => void;
  refreshToken: () => Promise<void>;
  isTokenLoading: boolean;
  currentToken: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ChatwootContext = createContext<ChatwootContextType | undefined>(undefined);

// Export the context for direct use
export { ChatwootContext };

interface ChatwootProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export function ChatwootProvider({
  children,
  baseUrl = "https://app.openchats.online",
}: ChatwootProviderProps) {
  const { user, status } = useAuth();
  const [websiteToken, setWebsiteToken] = useState<string>("");
  const [inboxUserId, setInboxUserId] = useState<string>(""); // 动态获取的secret
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const attributesSetRef = useRef(false);
  const pendingActionRef = useRef<null | "toggle" | "open">(null);
  const { i18n } = useTranslation();
  const { data: chatwootInboxIdResponse } = useChatwootInboxId();
  const { inbox_id, inbox_user_id } = chatwootInboxIdResponse?.data ?? {};

  // 获取动态token - 当 API 返回 inbox_id 时更新
  useEffect(() => {
    // API 数据已返回，使用动态 token
    if (inbox_id && inbox_user_id) {
      // 只有当 token 不同时才更新，避免不必要的重渲染
      if (websiteToken !== inbox_id) {
        setWebsiteToken(inbox_id);
        setInboxUserId(inbox_user_id);
      }
    }
  }, [inbox_id, inbox_user_id, websiteToken]);

  const {
    toggleWidget: sdkToggleWidget,
    openWidget: sdkOpenWidget,
    setLocale,
    setUser,
    setCustomAttributes,
    reset,
    isInitialized,
    setConversationCustomAttributes,
  } = useChatwoot({
    websiteToken,
    baseUrl,
    hideMessageBubble: true,
    darkMode: "auto",
    showUnreadMessagesDialog: true,
    useBrowserLanguage: false,
    locale: user?.language_code || i18n.language,
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!pendingActionRef.current) return;

    const action = pendingActionRef.current;
    pendingActionRef.current = null;

    if (action === "open") {
      sdkOpenWidget();
      return;
    }

    sdkToggleWidget();
  }, [isInitialized, sdkToggleWidget, sdkOpenWidget]);

  // 当用户信息变化时，仅更新Chatwoot中的用户信息（contact）
  useEffect(() => {
    const setChatwootUser = async () => {
      // 未登录用户跳过用户信息设置，但仍可使用聊天功能
      if (!user || !user.id || !status || !isInitialized || !inboxUserId) return;
      // console.log("setChatwootUser", user, status, isInitialized, inboxUserId);
      try {
        const secret = inboxUserId; // 使用动态获取的secret
        const message = user.id.toString();

        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const messageData = encoder.encode(message);

        const cryptoKey = await window.crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

        const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, messageData);
        const hash = Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        setUser(user.id, {
          name: user.id || "",
          avatar_url: user.avatar || "",
          identifier_hash: hash,
          city: user.city,
        });
      } catch (error) {
        console.error("Failed to set chatwoot user:", error);
      }
    };

    setChatwootUser();
  }, [user, status, isInitialized, inboxUserId, setUser]);
  // 当语言变化时，设置语言
  useEffect(() => {
    setLocale(user?.language_code || i18n.language);
  }, [user, i18n]);

  useEffect(() => {
    const onMessageHandler = () => {
      if (user && status && isInitialized && !attributesSetRef.current) {
        const customAttributes = {
          _team_id: user.team_id || "",
          _created_at: user.created_at ? dayjs(user.created_at * 1000).format("YYYY-MM-DD HH:mm:ss") : "",
          _user_id: user.id,
          _vip_level: status.vip,
          _tda: status.deposit_amount,
          _tdc: status.deposit_times,
          _twa: status.withdraw_amount,
          _twc: status.withdraw_times,
          _tba: status.bet_in,
          _tbc: status.bet_times,
          _direct_referral_count: status.direct_invitations,
          _indirect_referral_count: status.indirect_invitations,
          _tags: status.tag,
        };

        const conversationAttributes = {
          ...customAttributes,
          _host: user.host,
          _branch: user.branch,
          _country: user.country,
        };

        setCustomAttributes(customAttributes);
        setConversationCustomAttributes(conversationAttributes);
        attributesSetRef.current = true;
      }
    };

    if (isInitialized) {
      window.addEventListener("chatwoot:on-message", onMessageHandler);
    }

    return () => {
      window.removeEventListener("chatwoot:on-message", onMessageHandler);
    };
  }, [isInitialized, user, status, setCustomAttributes, setConversationCustomAttributes]);

  const toggleWidget = () => {
    if (!isInitialized) {
      pendingActionRef.current = "toggle";
      return;
    }
    sdkToggleWidget();
  };

  const openWidget = () => {
    if (!isInitialized) {
      pendingActionRef.current = "open";
      return;
    }
    sdkOpenWidget();
  };

  const updateToken = (newToken: string) => {
    // 更新token状态，这将触发useChatwoot重新初始化
    setWebsiteToken(newToken);
  };

  const refreshToken = async () => {
    setIsTokenLoading(true);
    try {
      if (inbox_id && inbox_user_id) {
        setWebsiteToken(inbox_id);
        setInboxUserId(inbox_user_id || "");
      }
    } catch (error) {
      console.error("刷新 chatwoot token 失败:", error);
    } finally {
      setIsTokenLoading(false);
    }
  };

  // 收到外部通知激活chat
  useEffect(() => {
    const em = emitter.addListener("OPEN_CHAT", () => {
      openWidget();
    });

    return () => em?.remove();
  }, [openWidget]);

  const value = {
    visible,
    setVisible,
    toggleWidget,
    openWidget,
    setUser,
    setCustomAttributes,
    reset,
    isInitialized,
    updateToken,
    refreshToken,
    isTokenLoading,
    currentToken: websiteToken,
  };

  return <ChatwootContext.Provider value={value}>{children}</ChatwootContext.Provider>;
}

export function useChatwootContext() {
  const context = useContext(ChatwootContext);
  if (context === undefined) {
    throw new Error("useChatwootContext must be used within a ChatwootProvider");
  }
  return context;
}
