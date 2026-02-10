/**
 * Anonymization service for privacy-preserving analytics
 * Maps actual S3 bucket/file names to random IDs stored locally
 * Only the IDs are sent to Google Analytics
 */

const STORAGE_KEY = 'analytics_anonymization_map';

interface AnonymizationMap {
  buckets: Record<string, string>; // actual bucket name -> random ID
  files: Record<string, string>;   // actual file key -> random ID
  credentials: Record<string, string>; // actual credential name -> random ID
}

/**
 * Generate a random ID (UUID-like string)
 */
function generateRandomId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Load anonymization map from storage
 */
async function loadAnonymizationMap(): Promise<AnonymizationMap> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        resolve(result[STORAGE_KEY]);
      } else {
        resolve({
          buckets: {},
          files: {},
          credentials: {}
        });
      }
    });
  });
}

/**
 * Save anonymization map to storage
 */
async function saveAnonymizationMap(map: AnonymizationMap): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: map }, () => {
      resolve();
    });
  });
}

/**
 * Get or create an anonymous ID for a bucket
 */
export async function getAnonymousBucketId(bucketName: string): Promise<string> {
  const map = await loadAnonymizationMap();

  if (!map.buckets[bucketName]) {
    map.buckets[bucketName] = generateRandomId();
    await saveAnonymizationMap(map);
  }

  return map.buckets[bucketName];
}

/**
 * Get or create an anonymous ID for a file
 */
export async function getAnonymousFileId(fileKey: string): Promise<string> {
  const map = await loadAnonymizationMap();

  if (!map.files[fileKey]) {
    map.files[fileKey] = generateRandomId();
    await saveAnonymizationMap(map);
  }

  return map.files[fileKey];
}

/**
 * Get or create an anonymous ID for a credential
 */
export async function getAnonymousCredentialId(credentialName: string): Promise<string> {
  const map = await loadAnonymizationMap();

  if (!map.credentials[credentialName]) {
    map.credentials[credentialName] = generateRandomId();
    await saveAnonymizationMap(map);
  }

  return map.credentials[credentialName];
}

/**
 * Get count of unique buckets tracked
 */
export async function getUniqueBucketCount(): Promise<number> {
  const map = await loadAnonymizationMap();
  return Object.keys(map.buckets).length;
}

/**
 * Get count of unique files tracked
 */
export async function getUniqueFileCount(): Promise<number> {
  const map = await loadAnonymizationMap();
  return Object.keys(map.files).length;
}

/**
 * Get count of unique credentials tracked
 */
export async function getUniqueCredentialCount(): Promise<number> {
  const map = await loadAnonymizationMap();
  return Object.keys(map.credentials).length;
}

/**
 * Clear all anonymization mappings (for debugging only)
 */
export async function clearAnonymizationMap(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([STORAGE_KEY], () => {
      resolve();
    });
  });
}
