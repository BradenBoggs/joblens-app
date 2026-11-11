import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { ApiError, apiRequest } from '@/lib/api';
import { clearLocalData, getDatabase } from '@/lib/database';

import { clearStoredToken, getStoredToken, storeToken } from './token-store';

export type Member = {
  user: { name: string; email: string };
  organization: { public_id: string; name: string };
};

type SignInInput = { email: string; password: string; code?: string };

type AuthState = {
  status: 'loading' | 'signed-out' | 'signed-in';
  member: Member | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const MEMBER_KEY = 'member';

/**
 * Keeps the member signed in across launches and while offline. A saved token
 * counts as signed in; the server stays the authority and a 401 signs out.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    void (async () => {
      const token = await getStoredToken();
      if (!token) {
        setStatus('signed-out');

        return;
      }

      setMember(await savedMember());
      setStatus('signed-in');

      try {
        const current = await apiRequest<Member>('/me', { token });
        setMember(current);
        await saveMember(current);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearStoredToken();
          setStatus('signed-out');
        }
        // Offline or a server error: keep working with the saved details.
      }
    })();
  }, []);

  const signIn = useCallback(async ({ email, password, code }: SignInInput) => {
    const { token } = await apiRequest<{ token: string }>('/auth/token', {
      method: 'POST',
      token: null,
      body: { email, password, device_name: 'JobLens app', ...(code ? { code } : {}) },
    });
    const current = await apiRequest<Member>('/me', { token });
    await storeToken(token);
    await saveMember(current);
    setMember(current);
    setStatus('signed-in');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiRequest('/auth/token', { method: 'DELETE' });
    } catch {
      // Offline sign-out still forgets the token on this phone.
    }
    await clearStoredToken();
    await clearLocalData();
    setMember(null);
    setStatus('signed-out');
  }, []);

  return <AuthContext value={{ status, member, signIn, signOut }}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

async function savedMember(): Promise<Member | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    MEMBER_KEY,
  );

  return row ? (JSON.parse(row.value) as Member) : null;
}

async function saveMember(current: Member): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
    MEMBER_KEY,
    JSON.stringify(current),
  );
}
