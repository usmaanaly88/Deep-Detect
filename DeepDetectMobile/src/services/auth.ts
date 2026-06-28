import auth from '@react-native-firebase/auth';

/**
 * Signs in the current user anonymously.
 * If already signed in, does nothing.
 * Returns the uid.
 */
export const signInGuest = async (): Promise<string | null> => {
  try {
    const current = auth().currentUser;
    if (current) {
      console.log('[Auth] Already signed in:', current.uid);
      return current.uid;
    }
    const userCredential = await auth().signInAnonymously();
    console.log('[Auth] Guest UID:', userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error) {
    console.error('[Auth] signInGuest error:', error);
    return null;
  }
};

/**
 * Returns the current user's uid, or null if not signed in.
 */
export const getCurrentUID = (): string | null => {
  return auth().currentUser?.uid ?? null;
};
