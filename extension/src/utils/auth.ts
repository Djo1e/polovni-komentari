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
}

export function getStoredUser(): UserData | null {
  const stored = localStorage.getItem(USER_DATA_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function storeUser(data: UserData): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
}

function clearStoredUser(): void {
  localStorage.removeItem(USER_DATA_KEY);
}

export function getStoredUserId(): Id<"users"> | null {
  const stored = getStoredUser();
  return stored?.userId ?? null;
}

function sendMessage<T>(msg: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (response: T & { ok: boolean; error?: string }) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
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
  };

  storeUser(userData);
  return userData;
}

export async function signOut(): Promise<void> {
  try {
    await sendMessage({ type: "GOOGLE_AUTH_REVOKE" });
  } catch {
    // No token cached, that's fine
  }
  clearStoredUser();
}
