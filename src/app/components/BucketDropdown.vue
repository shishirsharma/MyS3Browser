<script setup lang="ts">
import { computed } from 'vue';
import { useS3Store } from '../stores/s3';

const s3Store = useS3Store();

const currentBucketName = computed(() => {
  return s3Store.currentBucket || 'Select Bucket';
});

function selectBucket(bucketName: string) {
  s3Store.setCurrentBucket(bucketName);
}
</script>

<template>
  <div class="dropdown">
    <button
      class="btn btn-outline-light btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="bi bi-bucket me-1"></i>
      {{ currentBucketName }}
    </button>
    <ul class="dropdown-menu dropdown-menu-dark">
      <li v-if="s3Store.buckets.length === 0">
        <span class="dropdown-item-text text-muted">No buckets available</span>
      </li>
      <li v-for="bucket in s3Store.buckets" :key="bucket.name">
        <a
          class="dropdown-item"
          :class="{ active: bucket.name === s3Store.currentBucket }"
          href="#"
          @click.prevent="selectBucket(bucket.name)"
        >
          <i class="bi bi-bucket-fill me-2"></i>
          {{ bucket.name }}
        </a>
      </li>
    </ul>
  </div>
</template>
