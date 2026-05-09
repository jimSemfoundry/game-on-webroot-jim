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
  userid?: string | number;
  noMd5?: string;
}

function isInvalidStoredValue(value: string | null | undefined): boolean {
  return !value || value === "undefined" || value === "null";
}

export function getAuth(): Auth {
  let username = localStorage.getItem("username") || "";
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let userId: string | number | undefined;

  if (isInvalidStoredValue(username)) {
    username = "";
  }

  try {
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userId = parsed?.id ?? parsed?.user_id;
      if (!username && parsed?.username) {
        username = parsed.username;
      }
    }
  } catch {
    userId = undefined;
  }

  if (isInvalidStoredValue(username) || isInvalidStoredValue(storedToken)) {
    // throw new Error('User not authenticated');
  }

  const auth: Auth = {
    username: username || "",
    key: randomString(20),
    timestamp: Date.now(),
    token: "",
    userid: userId,
  };

  auth.token = md5((storedToken || "") + auth.key + auth.timestamp);
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
  localStorage.removeItem("status");
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
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  return !isInvalidStoredValue(token) && !isInvalidStoredValue(username);
}
