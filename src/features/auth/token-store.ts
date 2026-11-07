import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'joblens.api-token';

/** The device token lives in the Keychain (iOS) or Keystore (Android), never in plain storage. */
export function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function storeToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export function clearStoredToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
