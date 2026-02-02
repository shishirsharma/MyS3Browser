import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BucketInfo, S3Folder, S3Object } from '@/types';

export const useS3Store = defineStore('s3', () => {
  const buckets = ref<BucketInfo[]>([]);
  const currentBucket = ref<string | null>(null);
  const currentPrefix = ref<string>('');
  const folders = ref<S3Folder[]>([]);
  const objects = ref<S3Object[]>([]);
  const nextToken = ref<string | undefined>(undefined);
  const prevTokens = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref<string>('');

  const filteredFolders = computed(() => {
    if (!searchQuery.value) return folders.value;
    const query = searchQuery.value.toLowerCase();
    return folders.value.filter(f => f.displayName.toLowerCase().includes(query));
  });

  const filteredObjects = computed(() => {
    if (!searchQuery.value) return objects.value;
    const query = searchQuery.value.toLowerCase();
    return objects.value.filter(o => o.displayName.toLowerCase().includes(query));
  });

  const hasPrevPage = computed(() => prevTokens.value.length > 0);
  const hasNextPage = computed(() => !!nextToken.value);

  const breadcrumbs = computed(() => {
    const parts: { name: string; prefix: string }[] = [];
    if (!currentBucket.value) return parts;

    parts.push({ name: currentBucket.value, prefix: '' });

    if (currentPrefix.value) {
      const segments = currentPrefix.value.split('/').filter(Boolean);
      let accumulatedPrefix = '';
      for (const segment of segments) {
        accumulatedPrefix += segment + '/';
        parts.push({ name: segment, prefix: accumulatedPrefix });
      }
    }

    return parts;
  });

  function setBuckets(bucketList: BucketInfo[]) {
    buckets.value = bucketList;
  }

  function setCurrentBucket(bucket: string | null) {
    currentBucket.value = bucket;
    currentPrefix.value = '';
    folders.value = [];
    objects.value = [];
    nextToken.value = undefined;
    prevTokens.value = [];
    searchQuery.value = '';
  }

  function setCurrentPrefix(prefix: string) {
    currentPrefix.value = prefix;
    folders.value = [];
    objects.value = [];
    nextToken.value = undefined;
    prevTokens.value = [];
    searchQuery.value = '';
  }

  function setListResult(
    folderList: S3Folder[],
    objectList: S3Object[],
    token?: string
  ) {
    folders.value = folderList;
    objects.value = objectList;
    nextToken.value = token;
  }

  function pushPrevToken(token: string | undefined) {
    if (token) {
      prevTokens.value.push(token);
    } else {
      prevTokens.value.push('');
    }
  }

  function popPrevToken(): string | undefined {
    return prevTokens.value.pop();
  }

  function clearPrevTokens() {
    prevTokens.value = [];
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function removeObject(key: string) {
    objects.value = objects.value.filter(o => o.key !== key);
  }

  function removeFolder(prefix: string) {
    folders.value = folders.value.filter(f => f.prefix !== prefix);
  }

  return {
    buckets,
    currentBucket,
    currentPrefix,
    folders,
    objects,
    nextToken,
    prevTokens,
    isLoading,
    error,
    searchQuery,
    filteredFolders,
    filteredObjects,
    hasPrevPage,
    hasNextPage,
    breadcrumbs,
    setBuckets,
    setCurrentBucket,
    setCurrentPrefix,
    setListResult,
    pushPrevToken,
    popPrevToken,
    clearPrevTokens,
    setLoading,
    setError,
    setSearchQuery,
    removeObject,
    removeFolder,
  };
});
