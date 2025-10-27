import { useAuth } from "@/contexts/AuthContext";
import { useChatwootInboxId } from "@/hooks/api/usePublic";
import { useChatwoot } from "@/hooks/useChatwoot";
import dayjs from "dayjs";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatwootContextType {
  toggleWidget: () => void;
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
  fallbackToken?: string; // 备用token，当API获取失败时使用
  baseUrl?: string;
}

export function ChatwootProvider({
  children,
  fallbackToken = "mvrqCVQb4uqZmh6Jb5uQdirw", // 备用token
  baseUrl = "https://app.openchats.online",
}: ChatwootProviderProps) {
  const { user, status } = useAuth();
  const [websiteToken, setWebsiteToken] = useState<string>("");
  const [inboxUserId, setInboxUserId] = useState<string>(""); // 动态获取的secret
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const attributesSetRef = useRef(false);
  const { i18n } = useTranslation();
  const { data: chatwootInboxIdResponse } = useChatwootInboxId();
  const { inbox_id, inbox_user_id } = chatwootInboxIdResponse?.data ?? {};

  // 获取动态token
  useEffect(() => {
    const fetchChatwootToken = async () => {
      if (isTokenLoading || websiteToken) return;

      setIsTokenLoading(true);
      try {
        // 如果有用户ID，传递给接口；否则不传递（接口也会返回websiteToken）
        if (inbox_id && inbox_user_id) {
          setWebsiteToken(inbox_id);
          setInboxUserId(inbox_user_id || ""); // 设置动态secret
        } else {
          setWebsiteToken(fallbackToken);
          setInboxUserId("DbSjqt917QGgyy1WGfYthmNo"); // 备用secret
        }
      } catch (error) {
        console.error("获取 chatwoot token 失败，使用备用token:", error);
        setWebsiteToken(fallbackToken);
        setInboxUserId("DbSjqt917QGgyy1WGfYthmNo"); // 备用secret
      } finally {
        setIsTokenLoading(false);
      }
    };

    fetchChatwootToken();
  }, [user?.id, fallbackToken, isTokenLoading, websiteToken]);

  const {
    toggleWidget: sdkToggleWidget,
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

  // 当用户信息变化时，仅更新Chatwoot中的用户信息（contact）
  useEffect(() => {
    const setChatwootUser = async () => {
      // 未登录用户跳过用户信息设置，但仍可使用聊天功能
      if (!user || !user.id || !status || !isInitialized || !inboxUserId) return;
      console.log("setChatwootUser", user, status, isInitialized, inboxUserId);
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
    sdkToggleWidget();
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

  const value = {
    visible,
    setVisible,
    toggleWidget,
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
