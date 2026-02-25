<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useS3Store } from '../stores/s3';
import { useCredentialsStore } from '../stores/credentials';
import { uploadFile } from '../services/s3';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
  uploaded: [];
}>();

const s3Store = useS3Store();
const credentialsStore = useCredentialsStore();

const selectedFile = ref<File | null>(null);
const customFilename = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const error = ref<string | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);

const currentPrefix = computed(() => s3Store.currentPrefix);
const currentBucket = computed(() => s3Store.currentBucket);

const finalFilename = computed(() => {
  if (customFilename.value.trim()) {
    return customFilename.value.trim();
  }
  return selectedFile.value?.name || '';
});

const fullKey = computed(() => {
  return currentPrefix.value + finalFilename.value;
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

function resetForm() {
  selectedFile.value = null;
  customFilename.value = '';
  isUploading.value = false;
  uploadProgress.value = 0;
  error.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
    error.value = null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function onUpload() {
  if (!selectedFile.value) {
    error.value = 'Please select a file';
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
  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const bucketRegion = s3Store.getBucketRegion(currentBucket.value);
    await uploadFile(
      credentialsStore.activeCredential,
      currentBucket.value,
      fullKey.value,
      selectedFile.value,
      (progress) => {
        uploadProgress.value = progress;
      },
      bucketRegion
    );

    emit('uploaded');
    emit('close');
    resetForm();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Upload failed';
  } finally {
    isUploading.value = false;
  }
}

function onClose() {
  if (!isUploading.value) {
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
            <i class="bi bi-upload me-2"></i>
            Upload File
          </h5>
          <button type="button" class="btn-close" :disabled="isUploading" @click="onClose"></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div class="mb-3">
            <label class="form-label">Destination</label>
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
            <label class="form-label">Select File *</label>
            <input
              ref="fileInputRef"
              type="file"
              class="form-control"
              :disabled="isUploading"
              @change="onFileSelect"
            />
          </div>

          <div v-if="selectedFile" class="mb-3">
            <div class="card bg-light">
              <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-file-earmark me-2"></i>
                    <strong>{{ selectedFile.name }}</strong>
                  </div>
                  <span class="badge bg-secondary">{{ formatBytes(selectedFile.size) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Custom Filename (optional)</label>
            <input
              v-model="customFilename"
              type="text"
              class="form-control"
              :placeholder="selectedFile?.name || 'Enter custom filename'"
              :disabled="isUploading"
            />
            <div class="form-text">Leave empty to use the original filename</div>
          </div>

          <div v-if="finalFilename" class="mb-3">
            <label class="form-label">Will be uploaded as:</label>
            <code class="d-block bg-light p-2 rounded">{{ fullKey }}</code>
          </div>

          <div v-if="isUploading" class="mb-3">
            <label class="form-label">Upload Progress</label>
            <div class="progress">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                :style="{ width: uploadProgress + '%' }"
              >
                {{ uploadProgress }}%
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="isUploading" @click="onClose">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="isUploading || !selectedFile"
            @click="onUpload"
          >
            <span v-if="isUploading" class="spinner-border spinner-border-sm me-1"></span>
            {{ isUploading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>
