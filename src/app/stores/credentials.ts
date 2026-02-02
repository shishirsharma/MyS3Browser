import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Credential } from '@/types';

const STORAGE_KEY = 'mys3browser_credentials';
const ACTIVE_KEY = 'mys3browser_active_credential';

// Old Angular version storage keys
const OLD_STORAGE_KEY = 'credential';
const OLD_ALL_CREDENTIALS_KEY = 'allCredentials';

interface OldCredential {
  access_key_id: string;
  secret_access_key: string;
  s3_region: string;
  s3_bucket: string;
  name?: string;
}

function convertOldCredential(old: OldCredential, index: number = 0): Credential {
  return {
    name: old.name || `Credential ${index + 1}`,
    accessKeyId: old.access_key_id,
    secretAccessKey: old.secret_access_key,
    region: old.s3_region,
    bucket: old.s3_bucket,
  };
}

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials = ref<Credential[]>([]);
  const activeCredentialName = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const activeCredential = computed(() => {
    if (!activeCredentialName.value) return null;
    if (!Array.isArray(credentials.value)) {
      console.error('credentials.value is not an array in activeCredential');
      return null;
    }
    return credentials.value.find(c => c.name === activeCredentialName.value) || null;
  });

  async function loadCredentials(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY, ACTIVE_KEY]);
      let migratedCredentials: Credential[] = [];
      let needsMigration = false;

      // Check if we have data in the new format
      if (result[STORAGE_KEY]) {
        // Ensure it's an array - handle case where single object was stored
        if (Array.isArray(result[STORAGE_KEY])) {
          migratedCredentials = result[STORAGE_KEY];
        } else {
          // Single credential object stored - convert to array
          console.warn('Found single credential object, converting to array');
          migratedCredentials = [result[STORAGE_KEY] as Credential];
          needsMigration = true;
        }
      } else {
        // No data in new format, check for old localStorage data
        needsMigration = await migrateFromLocalStorage(migratedCredentials);
      }

      credentials.value = migratedCredentials;
      activeCredentialName.value = result[ACTIVE_KEY] || null;

      // Save migrated data if needed
      if (needsMigration && credentials.value.length > 0) {
        await chrome.storage.local.set({ [STORAGE_KEY]: credentials.value });
        console.log('Migrated credentials to new format');
      }

      // If no active credential but credentials exist, set first one as active
      if (!activeCredentialName.value && credentials.value.length > 0) {
        activeCredentialName.value = credentials.value[0].name;
        await chrome.storage.local.set({ [ACTIVE_KEY]: activeCredentialName.value });
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load credentials';
      console.error('Failed to load credentials:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function migrateFromLocalStorage(migratedCredentials: Credential[]): Promise<boolean> {
    try {
      // Check old localStorage for credentials (from Angular version)
      const oldCredentialStr = window.localStorage.getItem(OLD_STORAGE_KEY);
      const oldAllCredentialsStr = window.localStorage.getItem(OLD_ALL_CREDENTIALS_KEY);

      let hasMigrated = false;

      // First, migrate from allCredentials (multiple credentials)
      if (oldAllCredentialsStr) {
        try {
          const oldCredentials = JSON.parse(oldAllCredentialsStr);
          if (Array.isArray(oldCredentials)) {
            migratedCredentials.push(...oldCredentials.map((c, i) => convertOldCredential(c, i)));
            console.log(`Migrated ${oldCredentials.length} credentials from old format (allCredentials)`);
            hasMigrated = true;
          } else if (typeof oldCredentials === 'object') {
            // Single object stored under allCredentials (bug in old code)
            migratedCredentials.push(convertOldCredential(oldCredentials, 0));
            console.log('Migrated 1 credential from old format (allCredentials as object)');
            hasMigrated = true;
          }
        } catch (err) {
          console.error('Failed to parse old allCredentials:', err);
        }
      }

      // Then, check the single credential and add it if it's not a duplicate
      if (oldCredentialStr) {
        try {
          const oldCredential = JSON.parse(oldCredentialStr);
          if (oldCredential && typeof oldCredential === 'object') {
            const converted = convertOldCredential(oldCredential, migratedCredentials.length);

            // Check if this credential already exists in migrated credentials
            const isDuplicate = migratedCredentials.some(c =>
              c.accessKeyId === converted.accessKeyId &&
              c.region === converted.region
            );

            if (!isDuplicate) {
              migratedCredentials.push(converted);
              console.log('Migrated 1 additional credential from old format (credential)');
              hasMigrated = true;
            } else {
              console.log('Skipped duplicate credential from old format (credential)');
            }
          }
        } catch (err) {
          console.error('Failed to parse old credential:', err);
        }
      }

      // Clean up old localStorage data if migration was successful
      if (hasMigrated && migratedCredentials.length > 0) {
        window.localStorage.removeItem(OLD_STORAGE_KEY);
        window.localStorage.removeItem(OLD_ALL_CREDENTIALS_KEY);
        console.log('Cleaned up old localStorage data');
        return true;
      }
    } catch (err) {
      console.error('Migration error:', err);
    }
    return false;
  }

  async function saveCredential(credential: Credential): Promise<void> {
    error.value = null;
    try {
      // Ensure credentials is an array
      if (!Array.isArray(credentials.value)) {
        console.error('credentials.value is not an array, resetting to empty array');
        credentials.value = [];
      }

      const existingIndex = credentials.value.findIndex(c => c.name === credential.name);
      if (existingIndex >= 0) {
        credentials.value[existingIndex] = credential;
      } else {
        credentials.value.push(credential);
      }

      await chrome.storage.local.set({ [STORAGE_KEY]: credentials.value });

      // Set as active if it's the first credential
      if (credentials.value.length === 1) {
        await setActiveCredential(credential.name);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save credential';
      throw e;
    }
  }

  async function deleteCredential(name: string): Promise<void> {
    error.value = null;
    try {
      // Ensure credentials is an array
      if (!Array.isArray(credentials.value)) {
        console.error('credentials.value is not an array, resetting to empty array');
        credentials.value = [];
        return;
      }

      credentials.value = credentials.value.filter(c => c.name !== name);
      await chrome.storage.local.set({ [STORAGE_KEY]: credentials.value });

      // If deleted the active credential, switch to another
      if (activeCredentialName.value === name) {
        if (credentials.value.length > 0) {
          await setActiveCredential(credentials.value[0].name);
        } else {
          activeCredentialName.value = null;
          await chrome.storage.local.remove(ACTIVE_KEY);
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete credential';
      throw e;
    }
  }

  async function setActiveCredential(name: string): Promise<void> {
    // Ensure credentials is an array
    if (!Array.isArray(credentials.value)) {
      console.error('credentials.value is not an array');
      throw new Error('Invalid credentials data');
    }

    const credential = credentials.value.find(c => c.name === name);
    if (!credential) {
      throw new Error(`Credential "${name}" not found`);
    }
    activeCredentialName.value = name;
    await chrome.storage.local.set({ [ACTIVE_KEY]: name });
  }

  function getCredentialByName(name: string): Credential | undefined {
    // Ensure credentials is an array
    if (!Array.isArray(credentials.value)) {
      console.error('credentials.value is not an array in getCredentialByName');
      return undefined;
    }
    return credentials.value.find(c => c.name === name);
  }

  return {
    credentials,
    activeCredential,
    activeCredentialName,
    isLoading,
    error,
    loadCredentials,
    saveCredential,
    deleteCredential,
    setActiveCredential,
    getCredentialByName,
  };
});
