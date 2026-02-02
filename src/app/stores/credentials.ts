import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Credential } from '@/types';

const STORAGE_KEY = 'mys3browser_credentials';
const ACTIVE_KEY = 'mys3browser_active_credential';

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials = ref<Credential[]>([]);
  const activeCredentialName = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const activeCredential = computed(() => {
    if (!activeCredentialName.value) return null;
    return credentials.value.find(c => c.name === activeCredentialName.value) || null;
  });

  async function loadCredentials(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY, ACTIVE_KEY]);
      credentials.value = result[STORAGE_KEY] || [];
      activeCredentialName.value = result[ACTIVE_KEY] || null;

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

  async function saveCredential(credential: Credential): Promise<void> {
    error.value = null;
    try {
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
    const credential = credentials.value.find(c => c.name === name);
    if (!credential) {
      throw new Error(`Credential "${name}" not found`);
    }
    activeCredentialName.value = name;
    await chrome.storage.local.set({ [ACTIVE_KEY]: name });
  }

  function getCredentialByName(name: string): Credential | undefined {
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
