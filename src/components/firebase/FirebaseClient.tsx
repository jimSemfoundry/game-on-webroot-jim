import { onMessage, type Messaging } from 'firebase/messaging'
import { type ReactNode, useCallback, useEffect } from "react";
import { getSourcePathPrefix, useFirebaseClientConfig, useFirebaseClientInitialize } from "@/query/firebase.ts";
import { publicService } from "@/services/publicService";
import { useAuth } from "@/contexts/AuthContext";
import './IndexDB'

let executed = false

// TODO 不用svg，存在浏览器兼容问题
const notification_logo = `${getSourcePathPrefix()}/favicon/${process.env.VITE_THEME}/apple-touch-icon.png`;

function FirebaseClient({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const { data: firebase } = useFirebaseClientConfig()
  const { data: fcmToken } = useFirebaseClientInitialize(firebase?.data)

  // 拿权限
  const requestPermission = async () => {
    const permission = Notification.permission

    if (permission === 'granted') return

    await Notification.requestPermission();
  }

  const handleMessage = (msg: Messaging) => {
    // 消息接收
    onMessage(msg, (payload) => {
      if (payload.notification) {

        console.info('🔔🔔🔔')
        console.info(JSON.stringify(payload.notification))
        console.info('🔔🔔🔔')

        const { title = '', body = '' } = payload.notification
        const options = {
          body,
          icon: notification_logo,
          image: notification_logo ?? (payload.data?.icon ?? ''),
          badge: payload.data?.badge ?? '',
          data: payload.data
        };

        if (Notification.permission === 'granted') new Notification(title, options);
      }
    });
  }

  // 初始化
  const initFireBaseClient = useCallback(async (fcmToken: [string, Messaging]) => {
    executed = true

    // 将 token 与当前用户做关联
    await publicService.refreshFcmToken(fcmToken[0])

    console.info(`✅✅✅FCMTokenBoundOK`)
    console.info(`🔔🔔🔔StartWaitingForMessages...`)

    const c = new BroadcastChannel('notification_logo')
    c.postMessage({ type: 'notification_logo', icon: notification_logo })

    handleMessage(fcmToken[1])
  }, [])

  // 触发拿权限请求
  useEffect(() => {
    const timer = setTimeout(() => {
      void requestPermission()
      clearTimeout(timer)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 触发firebase初始化
  useEffect(() => {
    if (user && fcmToken && !executed) void initFireBaseClient(fcmToken)
  }, [user, fcmToken])

  return (
    <>
      {children}
    </>
  )
}

export default FirebaseClient
