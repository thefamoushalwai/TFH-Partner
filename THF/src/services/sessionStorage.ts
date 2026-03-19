import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'thf_session_v1';

export interface AppSession {
  uid: string;
  phoneNumber?: string;
  isLoggedIn: boolean;
  updatedAt: number;
}

function isValidSession(value: unknown): value is AppSession {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AppSession>;
  return (
    typeof candidate.uid === 'string' &&
    candidate.uid.length > 0 &&
    typeof candidate.isLoggedIn === 'boolean' &&
    typeof candidate.updatedAt === 'number'
  );
}

export async function saveSession(payload: {
  uid: string;
  phoneNumber?: string;
}): Promise<void> {
  const session: AppSession = {
    uid: payload.uid,
    phoneNumber: payload.phoneNumber,
    isLoggedIn: true,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<AppSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
