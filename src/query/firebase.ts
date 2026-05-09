import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { getPathInROIBEST } from "@/utils/helper.ts";

const FIREBASE_MESSAGING_SW_FILE = "/firebase-messaging-sw.js";
const FIREBASE_MESSAGING_SW_SCOPE = "/firebase-cloud-messaging-push-scope/";
let firebaseMessagingSwRegistrationPromise: Promise<ServiceWorkerRegistration> | null = null;

function getFirebaseMessagingSwRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    return Promise.reject(new Error("Service Worker is not supported"));
  }

  if (firebaseMessagingSwRegistrationPromise) {
    return firebaseMessagingSwRegistrationPromise;
  }

  const basePath = getPathInROIBEST();
  const scriptURL = `${basePath}${FIREBASE_MESSAGING_SW_FILE}`;
  const scope = `${basePath}${FIREBASE_MESSAGING_SW_SCOPE}`;

  firebaseMessagingSwRegistrationPromise = (async () => {
    const existing = await navigator.serviceWorker.getRegistration(scope);
    if (existing) return existing;

    return navigator.serviceWorker.register(scriptURL, {
      scope,
      updateViaCache: "none",
    });
  })();

  return firebaseMessagingSwRegistrationPromise;
}

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

        // 使用独立 scope 的 FCM SW，避免与 PWA SW 作用域冲突
        const serviceWorkerRegistration = await getFirebaseMessagingSwRegistration();
        const fcm_token = await getToken(msg, { vapidKey: firebase?.data?.vapidKey, serviceWorkerRegistration })

        console.info(`✅✅✅GetFirebaseFCMTokenOK`)

        return [fcm_token, msg];
      } catch (e) {
        console.warn("❌❌❌ Firebase messaging initialize failed", e)
      }
    },
    enabled: !!firebase,
    retryOnMount: false,
    refetchOnWindowFocus: false
  })
}
