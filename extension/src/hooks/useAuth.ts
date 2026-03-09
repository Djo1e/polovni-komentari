import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getStoredUser, signInWithGoogle, signOut as authSignOut, UserData } from "../utils/auth";
import { trackEvent } from "../utils/tracking";

export function useAuth(anonymousId: string) {
  const [user, setUser] = useState<UserData | null>(() => getStoredUser());
  const [signingIn, setSigningIn] = useState(false);
  const updateDisplayNameMutation = useMutation(api.users.updateDisplayName);
  const updateEmailMutation = useMutation(api.users.updateEmailNotifications);

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
    await updateDisplayNameMutation({ userId: user.userId, displayName });
    setUser((prev) => prev ? { ...prev, displayName, isCustomName: true } : null);
  }, [user, updateDisplayNameMutation]);

  const updateEmailNotifications = useCallback(async (enabled: boolean) => {
    if (!user) return;
    await updateEmailMutation({ userId: user.userId, enabled });
    setUser((prev) => prev ? { ...prev, emailNotifications: enabled } : null);
  }, [user, updateEmailMutation]);

  return {
    user,
    signingIn,
    signIn,
    signOut,
    updateDisplayName,
    updateEmailNotifications,
  };
}
