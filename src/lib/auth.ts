// Client-side Security & Password Authentication for Raj Press ERP
// Uses Web Crypto API (SHA-256) for secure client-side hashing without plaintext storage

const PASS_HASH_KEY = 'raj_press_master_pass_hash';
const PASS_SALT_KEY = 'raj_press_pass_salt';
const UNLOCKED_SESSION_KEY = 'raj_press_session_unlocked';
const REMEMBER_DEVICE_KEY = 'raj_press_remember_device';

// Default initial password for Raj Press
export const DEFAULT_INITIAL_PASSWORD = 'rajpress';

/**
 * Computes a SHA-256 hash of a password string with salt
 */
export async function hashPassword(password: string, salt: string = 'raj_press_secure_salt'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a custom password has already been set by the press owner
 */
export function isCustomPasswordSet(): boolean {
  return Boolean(localStorage.getItem(PASS_HASH_KEY));
}

/**
 * Verifies if the entered password matches the stored hash (or default password)
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PASS_HASH_KEY);

  if (!storedHash) {
    // If no custom password was set yet, check against default password
    return password.trim() === DEFAULT_INITIAL_PASSWORD;
  }

  const enteredHash = await hashPassword(password.trim());
  return enteredHash === storedHash;
}

/**
 * Sets a new master password
 */
export async function setMasterPassword(newPassword: string): Promise<void> {
  const newHash = await hashPassword(newPassword.trim());
  localStorage.setItem(PASS_HASH_KEY, newHash);
  localStorage.setItem(PASS_SALT_KEY, 'raj_press_secure_salt');
}

/**
 * Checks if the current browser session is unlocked
 */
export function isAppUnlocked(): boolean {
  // Check session storage first
  const sessionUnlocked = sessionStorage.getItem(UNLOCKED_SESSION_KEY) === 'true';
  if (sessionUnlocked) return true;

  // Check if user chose to remember on this device
  const rememberDevice = localStorage.getItem(REMEMBER_DEVICE_KEY) === 'true';
  return rememberDevice;
}

/**
 * Marks the application as unlocked
 */
export function unlockApp(rememberOnDevice: boolean = false): void {
  sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true');
  if (rememberOnDevice) {
    localStorage.setItem(REMEMBER_DEVICE_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_DEVICE_KEY);
  }
}

/**
 * Locks the application immediately
 */
export function lockApp(): void {
  sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
  localStorage.removeItem(REMEMBER_DEVICE_KEY);
}
