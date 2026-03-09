import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getStoredUser, storeUser, migrateFromLocalStorage, signInWithGoogle, signOut as authSignOut, UserData } from "../utils/auth";
import { trackEvent } from "../utils/tracking";

export function useAuth(anonymousId: string) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const updateDisplayNameMutation = useMutation(api.users.updateDisplayName);
  const updateEmailMutation = useMutation(api.users.updateEmailNotifications);

  useEffect(() => {
    migrateFromLocalStorage()
      .then(() => getStoredUser())
      .then((stored) => {
        setUser(stored);
        setLoading(false);
      });
  }, []);

  const liveUser = useQuery(
    api.users.getUser,
    user ? { userId: user.userId, sessionToken: user.sessionToken } : "skip"
  );

  const prevLiveRef = useRef(liveUser);
  useEffect(() => {
    if (!liveUser || !user || liveUser === prevLiveRef.current) return;
    prevLiveRef.current = liveUser;
    if (
      liveUser.displayName !== user.displayName ||
      liveUser.isCustomName !== user.isCustomName ||
      liveUser.emailNotifications !== user.emailNotifications
    ) {
      const updated = { ...user, ...liveUser };
      setUser(updated);
      storeUser(updated);
    }
  }, [liveUser, user]);

  const signIn = useCallback(async () => {
    setSigningIn(true);
    try {
      const userData = await signInWithGoogle(anonymousId);
      setUser(userData);
      trackEvent("sign_in");
    } catch (err) {
      console.error("Sign-in failed:", err);
    } finally {
      setSigningIn(false);
    }
  }, [anonymousId]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    trackEvent("sign_out");
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!user) return;
    await updateDisplayNameMutation({ userId: user.userId, sessionToken: user.sessionToken, displayName });
    const updated = { ...user, displayName, isCustomName: true };
    setUser(updated);
    await storeUser(updated);
  }, [user, updateDisplayNameMutation]);

  const updateEmailNotifications = useCallback(async (enabled: boolean) => {
    if (!user) return;
    await updateEmailMutation({ userId: user.userId, sessionToken: user.sessionToken, enabled });
    const updated = { ...user, emailNotifications: enabled };
    setUser(updated);
    await storeUser(updated);
  }, [user, updateEmailMutation]);

  return {
    user,
    loading,
    signingIn,
    signIn,
    signOut,
    updateDisplayName,
    updateEmailNotifications,
  };
}
