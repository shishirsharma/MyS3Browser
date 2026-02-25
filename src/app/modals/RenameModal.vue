<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useS3Store } from '../stores/s3';
import { useCredentialsStore } from '../stores/credentials';
import * as s3Service from '../services/s3';
import type { S3Object } from '@/types';

const props = defineProps<{
  show: boolean;
  object: S3Object | null;
}>();

const emit = defineEmits<{
  close: [];
  completed: [];
}>();

const s3Store = useS3Store();
const credentialsStore = useCredentialsStore();

const isWorking = ref(false);
const error = ref<string | null>(null);
const newName = ref('');
const destPrefix = ref('');
const deleteOriginal = ref(false);
const activeMode = ref<'rename' | 'copy'>('rename');

const currentPrefix = computed(() => s3Store.currentPrefix);
const currentBucket = computed(() => s3Store.currentBucket);

const sourceKey = computed(() => props.object?.key || '');
const sourceDisplayName = computed(() => props.object?.displayName || '');

const renameDestKey = computed(() => {
  if (!newName.value.trim()) return '';
  return currentPrefix.value + newName.value.trim();
});

const copyDestKey = computed(() => {
  if (!newName.value.trim()) return '';
  const finalPrefix = destPrefix.value.endsWith('/') ? destPrefix.value : destPrefix.value + '/';
  return finalPrefix + newName.value.trim();
});

const previewKey = computed(() => {
  if (activeMode.value === 'rename') {
    return renameDestKey.value;
  } else {
    return copyDestKey.value;
  }
});

watch(() => props.show, (newVal) => {
  if (newVal && props.object) {
    resetForm();
  }
});

function resetForm() {
  newName.value = sourceDisplayName.value;
  destPrefix.value = currentPrefix.value;
  deleteOriginal.value = false;
  activeMode.value = 'rename';
  error.value = null;
  isWorking.value = false;
}

async function onRename() {
  if (!newName.value.trim()) {
    error.value = 'Please enter a new filename';
    return;
  }

  if (!currentBucket.value || !credentialsStore.activeCredential || !props.object) {
    error.value = 'Missing required information';
    return;
  }

  if (sourceKey.value === renameDestKey.value) {
    error.value = 'New name must be different from current name';
    return;
  }

  error.value = null;
  isWorking.value = true;

  try {
    const bucketRegion = s3Store.getBucketRegion(currentBucket.value);

    // Copy to new location
    await s3Service.copyObject(
      credentialsStore.activeCredential,
      currentBucket.value,
      sourceKey.value,
      currentBucket.value,
      renameDestKey.value,
      bucketRegion
    );

    // Delete original
    await s3Service.deleteObject(
      credentialsStore.activeCredential,
      currentBucket.value,
      sourceKey.value,
      bucketRegion
    );

    emit('completed');
    emit('close');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Rename failed';
  } finally {
    isWorking.value = false;
  }
}

async function onCopyMove() {
  if (!newName.value.trim()) {
    error.value = 'Please enter a filename';
    return;
  }

  if (!currentBucket.value || !credentialsStore.activeCredential || !props.object) {
    error.value = 'Missing required information';
    return;
  }

  if (sourceKey.value === copyDestKey.value) {
    error.value = 'Destination must be different from source';
    return;
  }

  error.value = null;
  isWorking.value = true;

  try {
    const bucketRegion = s3Store.getBucketRegion(currentBucket.value);

    // Copy to destination
    await s3Service.copyObject(
      credentialsStore.activeCredential,
      currentBucket.value,
      sourceKey.value,
      currentBucket.value,
      copyDestKey.value,
      bucketRegion
    );

    // Delete original if requested
    if (deleteOriginal.value) {
      await s3Service.deleteObject(
        credentialsStore.activeCredential,
        currentBucket.value,
        sourceKey.value,
        bucketRegion
      );
    }

    emit('completed');
    emit('close');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Copy/Move failed';
  } finally {
    isWorking.value = false;
  }
}

function onClose() {
  if (!isWorking.value) {
    emit('close');
  }
}
</script>

<template>
  <div
    class="modal fade"
    :class="{ show: show }"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    @click.self="onClose"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil me-2"></i>
            {{ activeMode === 'rename' ? 'Rename File' : 'Copy/Move File' }}
          </h5>
          <button type="button" class="btn-close" :disabled="isWorking" @click="onClose"></button>
        </div>

        <!-- Mode tabs -->
        <div class="nav nav-tabs border-bottom" role="tablist">
          <button
            class="nav-link"
            :class="{ active: activeMode === 'rename' }"
            :disabled="isWorking"
            @click="activeMode = 'rename'"
          >
            <i class="bi bi-pencil-square me-1"></i>
            Rename
          </button>
          <button
            class="nav-link"
            :class="{ active: activeMode === 'copy' }"
            :disabled="isWorking"
            @click="activeMode = 'copy'"
          >
            <i class="bi bi-files me-1"></i>
            Copy/Move
          </button>
        </div>

        <div class="modal-body">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <!-- Source key (read-only) -->
          <div class="mb-3">
            <label class="form-label">Source</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-file-earmark"></i>
              </span>
              <input
                type="text"
                class="form-control"
                :value="`s3://${currentBucket}/${sourceKey}`"
                disabled
              />
            </div>
          </div>

          <!-- Rename mode -->
          <template v-if="activeMode === 'rename'">
            <div class="mb-3">
              <label class="form-label">Current Filename</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-file-earmark"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  :value="sourceDisplayName"
                  disabled
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">New Filename *</label>
              <input
                v-model="newName"
                type="text"
                class="form-control"
                :disabled="isWorking"
                placeholder="Enter new filename"
              />
            </div>
          </template>

          <!-- Copy/Move mode -->
          <template v-else>
            <div class="mb-3">
              <label class="form-label">Destination Prefix</label>
              <input
                v-model="destPrefix"
                type="text"
                class="form-control"
                :disabled="isWorking"
                placeholder="e.g., folder/ or folder/subfolder/"
              />
              <div class="form-text">Leave empty for root, include trailing slash for folders</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Filename *</label>
              <input
                v-model="newName"
                type="text"
                class="form-control"
                :disabled="isWorking"
                placeholder="Enter filename"
              />
            </div>

            <div class="form-check mb-3">
              <input
                v-model="deleteOriginal"
                type="checkbox"
                class="form-check-input"
                id="deleteOriginal"
                :disabled="isWorking"
              />
              <label class="form-check-label" for="deleteOriginal">
                Delete original (Move instead of Copy)
              </label>
            </div>
          </template>

          <!-- Preview -->
          <div v-if="previewKey" class="mb-3">
            <label class="form-label">Will be {{ activeMode === 'rename' ? 'renamed to' : deleteOriginal ? 'moved to' : 'copied to' }}:</label>
            <code class="d-block bg-light p-2 rounded text-break">s3://{{ currentBucket }}/{{ previewKey }}</code>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="isWorking" @click="onClose">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="isWorking || !newName.trim()"
            @click="activeMode === 'rename' ? onRename() : onCopyMove()"
          >
            <span v-if="isWorking" class="spinner-border spinner-border-sm me-1"></span>
            {{ isWorking ? 'Processing...' : activeMode === 'rename' ? 'Rename' : deleteOriginal ? 'Move' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>
