<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useS3Store } from '../stores/s3';
import { useCredentialsStore } from '../stores/credentials';
import { createFolder } from '../services/s3';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const s3Store = useS3Store();
const credentialsStore = useCredentialsStore();

const folderName = ref('');
const isCreating = ref(false);
const error = ref<string | null>(null);

const currentPrefix = computed(() => s3Store.currentPrefix);
const currentBucket = computed(() => s3Store.currentBucket);

const fullPrefix = computed(() => {
  const name = folderName.value.trim().replace(/\/+$/, '');
  if (!name) return '';
  return currentPrefix.value + name + '/';
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

function resetForm() {
  folderName.value = '';
  isCreating.value = false;
  error.value = null;
}

async function onCreate() {
  const name = folderName.value.trim();

  if (!name) {
    error.value = 'Folder name is required';
    return;
  }

  if (name.includes('/')) {
    error.value = 'Folder name cannot contain slashes';
    return;
  }

  if (!currentBucket.value) {
    error.value = 'No bucket selected';
    return;
  }

  if (!credentialsStore.activeCredential) {
    error.value = 'No active credential';
    return;
  }

  error.value = null;
  isCreating.value = true;

  try {
    const bucketRegion = s3Store.getBucketRegion(currentBucket.value);
    await createFolder(
      credentialsStore.activeCredential,
      currentBucket.value,
      fullPrefix.value,
      bucketRegion
    );

    emit('created');
    emit('close');
    resetForm();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create folder';
  } finally {
    isCreating.value = false;
  }
}

function onClose() {
  if (!isCreating.value) {
    emit('close');
    resetForm();
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
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-folder-plus me-2"></i>
            Create Folder
          </h5>
          <button type="button" class="btn-close" :disabled="isCreating" @click="onClose"></button>
        </div>
        <form @submit.prevent="onCreate">
          <div class="modal-body">
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div class="mb-3">
              <label class="form-label">Location</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-folder2"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  :value="`s3://${currentBucket}/${currentPrefix}`"
                  disabled
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Folder Name *</label>
              <input
                v-model="folderName"
                type="text"
                class="form-control"
                placeholder="Enter folder name"
                :disabled="isCreating"
                autofocus
              />
            </div>

            <div v-if="fullPrefix" class="mb-3">
              <label class="form-label">Will be created as:</label>
              <code class="d-block bg-light p-2 rounded">{{ fullPrefix }}</code>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="isCreating" @click="onClose">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isCreating || !folderName.trim()">
              <span v-if="isCreating" class="spinner-border spinner-border-sm me-1"></span>
              {{ isCreating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>
