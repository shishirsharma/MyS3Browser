import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCredentialsStore } from './credentials';
import type { Credential } from '@/types';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
} as any;

describe('useCredentialsStore - Migration Logic', () => {
  let saveSpy: any;

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());

    // Spy on chrome.storage.local.set to verify plain objects are saved
    saveSpy = chrome.storage.local.set as any;

    // Clear all mocks
    vi.clearAllMocks();

    // Clear localStorage
    window.localStorage.clear();

    // Reset chrome.storage mocks to return empty by default
    (chrome.storage.local.get as any).mockResolvedValue({});
    (chrome.storage.local.set as any).mockResolvedValue(undefined);
    (chrome.storage.local.remove as any).mockResolvedValue(undefined);
  });

  describe('New Installation (Empty Storage)', () => {
    it('should initialize with empty credentials array', async () => {
      const store = useCredentialsStore();

      await store.loadCredentials();

      expect(store.credentials).toEqual([]);
      expect(store.activeCredentialName).toBeNull();
    });
  });

  describe('Existing Valid Data', () => {
    it('should load valid array from chrome.storage.local', async () => {
      const validCredentials: Credential[] = [
        {
          name: 'Production',
          accessKeyId: 'AKIATEST1',
          secretAccessKey: 'secret1',
          region: 'us-east-1',
          bucket: 'my-bucket',
        },
        {
          name: 'Development',
          accessKeyId: 'AKIATEST2',
          secretAccessKey: 'secret2',
          region: 'us-west-2',
          bucket: 'dev-bucket',
        },
      ];

      (chrome.storage.local.get as any).mockResolvedValue({
        mys3browser_credentials: validCredentials,
        mys3browser_active_credential: 'Production',
      });

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(store.credentials).toEqual(validCredentials);
      expect(store.activeCredentialName).toBe('Production');
    });
  });

  describe('Corrupted Data - Single Object Instead of Array', () => {
    it('should convert single credential object to array', async () => {
      const singleCredential: Credential = {
        name: 'Production',
        accessKeyId: 'AKIATEST1',
        secretAccessKey: 'secret1',
        region: 'us-east-1',
        bucket: 'my-bucket',
      };

      (chrome.storage.local.get as any).mockResolvedValue({
        mys3browser_credentials: singleCredential,
      });

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(Array.isArray(store.credentials)).toBe(true);
      expect(store.credentials).toHaveLength(1);
      expect(store.credentials[0]).toEqual(singleCredential);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        mys3browser_credentials: [singleCredential],
      });
    });
  });

  describe('Old Angular Format - Single Credential', () => {
    it('should migrate from old localStorage single credential format', async () => {
      const oldCredential = {
        access_key_id: 'AKIATEST1',
        secret_access_key: 'secret1',
        s3_region: 'us-east-1',
        s3_bucket: 'my-bucket',
        name: 'Old Cred',
      };

      window.localStorage.setItem('credential', JSON.stringify(oldCredential));

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(store.credentials).toHaveLength(1);
      expect(store.credentials[0]).toEqual({
        name: 'Old Cred',
        accessKeyId: 'AKIATEST1',
        secretAccessKey: 'secret1',
        region: 'us-east-1',
        bucket: 'my-bucket',
      });

      // Should clean up old localStorage
      expect(window.localStorage.getItem('credential')).toBeNull();

      // Should save to new storage
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    it('should generate default name if old credential has no name', async () => {
      const oldCredential = {
        access_key_id: 'AKIATEST1',
        secret_access_key: 'secret1',
        s3_region: 'us-east-1',
        s3_bucket: 'my-bucket',
      };

      window.localStorage.setItem('credential', JSON.stringify(oldCredential));

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(store.credentials[0].name).toBe('Credential 1');
    });
  });

  describe('Old Angular Format - Multiple Credentials Array', () => {
    it('should migrate from old localStorage allCredentials array', async () => {
      const oldCredentials = [
        {
          access_key_id: 'AKIATEST1',
          secret_access_key: 'secret1',
          s3_region: 'us-east-1',
          s3_bucket: 'bucket1',
          name: 'Cred 1',
        },
        {
          access_key_id: 'AKIATEST2',
          secret_access_key: 'secret2',
          s3_region: 'us-west-2',
          s3_bucket: 'bucket2',
          name: 'Cred 2',
        },
      ];

      window.localStorage.setItem('allCredentials', JSON.stringify(oldCredentials));

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(store.credentials).toHaveLength(2);
      expect(store.credentials[0].name).toBe('Cred 1');
      expect(store.credentials[1].name).toBe('Cred 2');
      expect(store.credentials[0].accessKeyId).toBe('AKIATEST1');
      expect(store.credentials[1].accessKeyId).toBe('AKIATEST2');

      // Should clean up old localStorage
      expect(window.localStorage.getItem('allCredentials')).toBeNull();
    });
  });

  describe('Old Angular Format - Single Object in allCredentials (Bug)', () => {
    it('should handle single object stored in allCredentials', async () => {
      const oldCredential = {
        access_key_id: 'AKIATEST1',
        secret_access_key: 'secret1',
        s3_region: 'us-east-1',
        s3_bucket: 'my-bucket',
        name: 'Single Cred',
      };

      // Bug in old code: stored single object instead of array
      window.localStorage.setItem('allCredentials', JSON.stringify(oldCredential));

      const store = useCredentialsStore();
      await store.loadCredentials();

      expect(store.credentials).toHaveLength(1);
      expect(store.credentials[0].name).toBe('Single Cred');
      expect(store.credentials[0].accessKeyId).toBe('AKIATEST1');
    });
  });

  describe('Both Old Keys Present', () => {
    it('should merge both old keys without duplicates', async () => {
      const sharedCredential = {
        access_key_id: 'AKIATEST1',
        secret_access_key: 'secret1',
        s3_region: 'us-east-1',
        s3_bucket: 'my-bucket',
        name: 'Shared',
      };

      const additionalCredential = {
        access_key_id: 'AKIATEST2',
        secret_access_key: 'secret2',
        s3_region: 'us-west-2',
        s3_bucket: 'other-bucket',
        name: 'Additional',
      };

      // Same credential in both places (duplicate scenario)
      window.localStorage.setItem('credential', JSON.stringify(sharedCredential));
      window.localStorage.setItem('allCredentials', JSON.stringify([sharedCredential]));

      const store = useCredentialsStore();
      await store.loadCredentials();

      // Should only have one credential (duplicate removed)
      expect(store.credentials).toHaveLength(1);
      expect(store.credentials[0].accessKeyId).toBe('AKIATEST1');
    });

    it('should merge both old keys with unique credentials', async () => {
      const credential1 = {
        access_key_id: 'AKIATEST1',
        secret_access_key: 'secret1',
        s3_region: 'us-east-1',
        s3_bucket: 'bucket1',
        name: 'Cred 1',
      };

      const credential2 = {
        access_key_id: 'AKIATEST2',
        secret_access_key: 'secret2',
        s3_region: 'us-west-2',
        s3_bucket: 'bucket2',
        name: 'Cred 2',
      };

      // Different credentials in each place
      window.localStorage.setItem('credential', JSON.stringify(credential1));
      window.localStorage.setItem('allCredentials', JSON.stringify([credential2]));

      const store = useCredentialsStore();
      await store.loadCredentials();

      // Should have both credentials
      expect(store.credentials).toHaveLength(2);
      expect(store.credentials[0].accessKeyId).toBe('AKIATEST2');
      expect(store.credentials[1].accessKeyId).toBe('AKIATEST1');

      // Should clean up both old keys
      expect(window.localStorage.getItem('credential')).toBeNull();
      expect(window.localStorage.getItem('allCredentials')).toBeNull();
    });
  });

  describe('Defensive Array Checks', () => {
    it('should handle getCredentialByName when credentials is not an array', async () => {
      const store = useCredentialsStore();

      // Force credentials to be non-array (shouldn't happen, but defensive check)
      (store as any).credentials = 'not-an-array';

      const result = store.getCredentialByName('test');

      expect(result).toBeUndefined();
    });

    it('should handle activeCredential computed when credentials is not an array', async () => {
      const store = useCredentialsStore();
      store.activeCredentialName = 'test';

      // Force credentials to be non-array
      (store as any).credentials = 'not-an-array';

      expect(store.activeCredential).toBeNull();
    });
  });

  describe('Save Credential with Array Check', () => {
    it('should reset to empty array if credentials is corrupted before saving', async () => {
      const store = useCredentialsStore();

      // Force corruption
      (store as any).credentials = 'corrupted';

      const newCred: Credential = {
        name: 'New',
        accessKeyId: 'AKIATEST',
        secretAccessKey: 'secret',
        region: 'us-east-1',
        bucket: 'bucket',
      };

      await store.saveCredential(newCred);

      expect(Array.isArray(store.credentials)).toBe(true);
      expect(store.credentials).toHaveLength(1);
      expect(store.credentials[0]).toEqual(newCred);
    });
  });

  describe('Serialization', () => {
    it('should save plain JSON objects, not Vue proxies', async () => {
      const store = useCredentialsStore();

      const newCred: Credential = {
        name: 'Test',
        accessKeyId: 'AKIATEST',
        secretAccessKey: 'secret',
        region: 'us-east-1',
        bucket: 'test-bucket',
      };

      await store.saveCredential(newCred);

      // Verify chrome.storage.local.set was called
      expect(chrome.storage.local.set).toHaveBeenCalled();

      // Get the data that was saved - check all calls that have mys3browser_credentials
      const allCalls = (chrome.storage.local.set as any).mock.calls;
      const relevantCall = allCalls.find((call: any) =>
        call[0] && call[0].mys3browser_credentials
      );

      expect(relevantCall).toBeDefined();
      const savedData = relevantCall[0].mys3browser_credentials;

      // Verify it's a plain array of plain objects
      expect(Array.isArray(savedData)).toBe(true);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toEqual(newCred);

      // Verify it's not a Vue Proxy (plain objects only have expected keys)
      const objKeys = Object.keys(savedData[0]);
      expect(objKeys.sort()).toEqual(['accessKeyId', 'bucket', 'name', 'region', 'secretAccessKey']);
    });
  });
});
