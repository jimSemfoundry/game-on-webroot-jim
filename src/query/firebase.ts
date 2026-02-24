import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { getPathInROIBEST } from "@/utils/helper.ts";

export const useFirebaseClientConfig = () => {
  return useQuery({
    queryKey: ['firebaseClientConfig'],
    queryFn: () => publicService.getFirebaseClientConfig(),
  })
}

export const useFirebaseClientInitialize = (firebase: Record<string, any>) => {
  return useQuery({
    queryKey: ['firebaseClientInitialize', firebase?.appId],
    queryFn: async (): Promise<[string, Messaging] | undefined> => {
      try {
        const app = initializeApp(firebase?.data);
        const msg = getMessaging(app);

        // 从 firebase 服务端获取 token
        const serviceWorkerRegistration = await navigator.serviceWorker.register(`${getPathInROIBEST()}/firebase-messaging-sw.js`);
        const fcm_token = await getToken(msg, { vapidKey: firebase?.data?.vapidKey, serviceWorkerRegistration })

        console.info(`✅✅✅GetFirebaseFCMTokenOK`)

        return [fcm_token, msg];
      } catch (e) {
        console.info('❌❌❌YouHaveDeclinedTheNotification')
      }
    },
    enabled: !!firebase,
    retryOnMount: false,
    refetchOnWindowFocus: false
  })
}
