import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const USER_DATA_KEY = "paCommentsUserData";

export interface UserData {
  userId: Id<"users">;
  firstName: string;
  email: string;
  displayName: string;
  isCustomName: boolean;
  emailNotifications: boolean;
  sessionToken: string;
}

export async function getStoredUser(): Promise<UserData | null> {
  try {
    const result = await chrome.storage.local.get(USER_DATA_KEY);
    const stored = result[USER_DATA_KEY] as UserData | string | undefined;
    if (!stored) return null;
    const data: UserData = typeof stored === "string" ? JSON.parse(stored) : stored;
    if (!data.sessionToken) return null;
    return data;
  } catch {
    return null;
  }
}

export async function storeUser(data: UserData): Promise<void> {
  await chrome.storage.local.set({ [USER_DATA_KEY]: data });
}

async function clearStoredUser(): Promise<void> {
  await chrome.storage.local.remove(USER_DATA_KEY);
}

export async function migrateFromLocalStorage(): Promise<void> {
  const stored = localStorage.getItem(USER_DATA_KEY);
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    await chrome.storage.local.set({ [USER_DATA_KEY]: data });
  } catch {
    // Ignore parse errors
  }
  localStorage.removeItem(USER_DATA_KEY);
}

function sendMessage<T>(msg: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime?.sendMessage) {
      reject(new Error("Extension context invalidated. Please refresh the page."));
      return;
    }
    chrome.runtime.sendMessage(msg, (response: T & { ok: boolean; error?: string }) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response) {
        reject(new Error("No response from background script"));
      } else if (!response.ok) {
        reject(new Error(response.error ?? "Unknown error"));
      } else {
        resolve(response);
      }
    });
  });
}

export async function signInWithGoogle(anonymousId: string): Promise<UserData> {
  const result = await sendMessage<{ ok: boolean; token?: string }>({ type: "GOOGLE_AUTH" });
  if (!result.token) throw new Error("Failed to get auth token");

  const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
  const client = new ConvexHttpClient(convexUrl);
  const signInResult = await client.action(api.users.signIn, {
    googleToken: result.token,
    anonymousId,
  });

  const userData: UserData = {
    userId: signInResult.userId as Id<"users">,
    firstName: signInResult.firstName,
    email: signInResult.email,
    displayName: signInResult.displayName,
    isCustomName: signInResult.isCustomName,
    emailNotifications: signInResult.emailNotifications,
    sessionToken: signInResult.sessionToken,
  };

  await storeUser(userData);
  return userData;
}

export async function signOut(): Promise<void> {
  try {
    await sendMessage({ type: "GOOGLE_AUTH_REVOKE" });
  } catch {
    // No token cached, that's fine
  }
  await clearStoredUser();
}
