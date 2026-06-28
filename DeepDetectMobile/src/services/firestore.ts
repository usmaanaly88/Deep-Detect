import firestore from '@react-native-firebase/firestore';

export interface HistoryItem {
  id: string;
  imageUrl: string;
  publicId: string;
  prediction: string;
  confidence: number;
  createdAt: Date;
}

export interface SaveHistoryPayload {
  imageUrl: string;
  publicId: string;
  prediction: string;
  confidence: number;
}

/**
 * Saves a detection result to Firestore under users/{uid}/history.
 */
export const saveHistory = async (
  uid: string,
  payload: SaveHistoryPayload,
): Promise<void> => {
  try {
    await firestore()
      .collection('users')
      .doc(uid)
      .collection('history')
      .add({
        imageUrl: payload.imageUrl,
        publicId: payload.publicId,
        prediction: payload.prediction,
        confidence: payload.confidence,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    console.log('[Firestore] History saved for uid:', uid);
  } catch (error) {
    console.error('[Firestore] saveHistory error:', error);
    throw error;
  }
};

/**
 * Fetches history documents for a user, ordered by createdAt descending.
 */
export const getHistory = async (uid: string): Promise<HistoryItem[]> => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .doc(uid)
      .collection('history')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl ?? '',
        publicId: data.publicId ?? '',
        prediction: data.prediction ?? 'unknown',
        confidence: data.confidence ?? 0,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as HistoryItem;
    });
  } catch (error) {
    console.error('[Firestore] getHistory error:', error);
    throw error;
  }
};
