import md5 from "md5";

export function randomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export interface Auth {
  username: string;
  key: string;
  timestamp: number;
  token: string;
  noMd5?: string;
}

export function getAuth(): Auth {
  const username = localStorage.getItem("username");
  const storedToken = localStorage.getItem("token");

  if (!username || !storedToken) {
    // throw new Error('User not authenticated');
  }

  const auth: Auth = {
    username: username || "",
    key: randomString(20),
    timestamp: Date.now(),
    token: "",
  };

  auth.token = md5(storedToken + auth.key + auth.timestamp);
  return auth;
}

/**
 * Clear all authentication data and optionally dispatch event
 */
export function clearAuth(reason?: string) {
  // Only log in development
  if (process.env.NODE_ENV === "development" && reason) {
    console.log(`🗑️ Clearing auth - Reason: ${reason}`);
  }

  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Dispatch event for other parts of the app to react
  if (reason) {
    window.dispatchEvent(
      new CustomEvent("auth:expired", {
        detail: { reason },
      }),
    );
  }
}

/**
 * Check if user has authentication data
 */
export function hasAuth(): boolean {
  return !!(localStorage.getItem("token") && localStorage.getItem("username"));
}
