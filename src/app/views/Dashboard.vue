<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCredentialsStore } from '../stores/credentials';
import { useS3Store } from '../stores/s3';
import * as s3Service from '../services/s3';
import Navbar from '../components/Navbar.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import FileList from '../components/FileList.vue';
import CredentialModal from '../modals/CredentialModal.vue';
import UploadModal from '../modals/UploadModal.vue';
import CreateFolderModal from '../modals/CreateFolderModal.vue';
import HelpModal from '../modals/HelpModal.vue';

const credentialsStore = useCredentialsStore();
const s3Store = useS3Store();

// Modal visibility state
const showCredentialModal = ref(false);
const showUploadModal = ref(false);
const showCreateFolderModal = ref(false);
const showHelpModal = ref(false);

// Alert state
const alertMessage = ref<string | null>(null);
const alertType = ref<'success' | 'danger' | 'warning'>('success');

function showAlert(message: string, type: 'success' | 'danger' | 'warning' = 'success') {
  alertMessage.value = message;
  alertType.value = type;
  setTimeout(() => {
    alertMessage.value = null;
  }, 5000);
}

async function loadBuckets() {
  if (!credentialsStore.activeCredential) return;

  s3Store.setLoading(true);
  s3Store.setError(null);

  try {
    const buckets = await s3Service.listBuckets(credentialsStore.activeCredential);
    s3Store.setBuckets(buckets);

    // Auto-select default bucket or first bucket
    if (credentialsStore.activeCredential.bucket) {
      const defaultBucket = buckets.find(b => b.name === credentialsStore.activeCredential!.bucket);
      if (defaultBucket) {
        s3Store.setCurrentBucket(defaultBucket.name);
      } else if (buckets.length > 0) {
        s3Store.setCurrentBucket(buckets[0].name);
      }
    } else if (buckets.length > 0) {
      s3Store.setCurrentBucket(buckets[0].name);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load buckets';
    s3Store.setError(message);
    showAlert(message, 'danger');
  } finally {
    s3Store.setLoading(false);
  }
}

async function loadObjects(continuationToken?: string) {
  if (!credentialsStore.activeCredential || !s3Store.currentBucket) return;

  s3Store.setLoading(true);
  s3Store.setError(null);

  try {
    const result = await s3Service.listObjects(
      credentialsStore.activeCredential,
      s3Store.currentBucket,
      s3Store.currentPrefix,
      continuationToken
    );

    s3Store.setListResult(result.folders, result.objects, result.nextToken);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load objects';
    s3Store.setError(message);
    showAlert(message, 'danger');
  } finally {
    s3Store.setLoading(false);
  }
}

async function navigateToFolder(prefix: string) {
  s3Store.setCurrentPrefix(prefix);
  await loadObjects();
}

async function navigateFromBreadcrumb(prefix: string) {
  s3Store.setCurrentPrefix(prefix);
  await loadObjects();
}

async function downloadFile(key: string) {
  if (!credentialsStore.activeCredential || !s3Store.currentBucket) return;

  try {
    await s3Service.downloadObject(
      credentialsStore.activeCredential,
      s3Store.currentBucket,
      key
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to download file';
    showAlert(message, 'danger');
  }
}

async function deleteFile(key: string) {
  if (!credentialsStore.activeCredential || !s3Store.currentBucket) return;

  try {
    await s3Service.deleteObject(
      credentialsStore.activeCredential,
      s3Store.currentBucket,
      key
    );
    s3Store.removeObject(key);
    showAlert('File deleted successfully', 'success');
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete file';
    showAlert(message, 'danger');
  }
}

async function deleteFolder(prefix: string) {
  if (!credentialsStore.activeCredential || !s3Store.currentBucket) return;

  try {
    await s3Service.deleteObject(
      credentialsStore.activeCredential,
      s3Store.currentBucket,
      prefix
    );
    s3Store.removeFolder(prefix);
    showAlert('Folder deleted successfully', 'success');
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete folder';
    showAlert(message, 'danger');
  }
}

async function nextPage() {
  if (!s3Store.nextToken) return;
  s3Store.pushPrevToken(s3Store.nextToken);
  await loadObjects(s3Store.nextToken);
}

async function prevPage() {
  const token = s3Store.popPrevToken();
  if (token === '') {
    await loadObjects();
  } else {
    await loadObjects(token);
  }
}

function onSearch(query: string) {
  s3Store.setSearchQuery(query);
}

async function onCredentialSaved() {
  await loadBuckets();
  showAlert('Credential saved successfully', 'success');
}

async function onFileUploaded() {
  await loadObjects();
  showAlert('File uploaded successfully', 'success');
}

async function onFolderCreated() {
  await loadObjects();
  showAlert('Folder created successfully', 'success');
}

// Watch for credential changes
watch(() => credentialsStore.activeCredential, async (newCredential) => {
  if (newCredential) {
    await loadBuckets();
  } else {
    s3Store.setBuckets([]);
    s3Store.setCurrentBucket(null);
  }
});

// Watch for bucket changes
watch(() => s3Store.currentBucket, async (newBucket) => {
  if (newBucket) {
    s3Store.clearPrevTokens();
    await loadObjects();
  }
});

// Initial load
onMounted(async () => {
  if (credentialsStore.activeCredential) {
    await loadBuckets();
  } else if (credentialsStore.credentials.length === 0) {
    // Show credential modal if no credentials saved
    showCredentialModal.value = true;
  }
});
</script>

<template>
  <div class="d-flex flex-column h-100">
    <Navbar
      @search="onSearch"
      @show-help="showHelpModal = true"
      @show-credential-modal="showCredentialModal = true"
      @show-upload-modal="showUploadModal = true"
      @show-create-folder-modal="showCreateFolderModal = true"
    />

    <!-- Alert -->
    <div v-if="alertMessage" class="alert-container">
      <div
        class="alert alert-dismissible fade show m-3"
        :class="`alert-${alertType}`"
        role="alert"
      >
        {{ alertMessage }}
        <button type="button" class="btn-close" @click="alertMessage = null"></button>
      </div>
    </div>

    <!-- No credentials state -->
    <div v-if="!credentialsStore.activeCredential" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <i class="bi bi-key display-1 text-muted"></i>
      <h4 class="mt-3">No Credentials Configured</h4>
      <p class="text-muted">Add your AWS credentials to start browsing S3 buckets</p>
      <button class="btn btn-primary" @click="showCredentialModal = true">
        <i class="bi bi-plus-circle me-2"></i>
        Add Credential
      </button>
    </div>

    <!-- Main content -->
    <template v-else>
      <Breadcrumbs @navigate="navigateFromBreadcrumb" />

      <!-- No bucket selected -->
      <div v-if="!s3Store.currentBucket" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <i class="bi bi-bucket display-1 text-muted"></i>
        <h4 class="mt-3">No Bucket Selected</h4>
        <p class="text-muted">Select a bucket from the dropdown menu to browse its contents</p>
      </div>

      <!-- File list -->
      <template v-else>
        <div class="flex-grow-1 overflow-auto">
          <FileList
            @navigate-folder="navigateToFolder"
            @download-file="downloadFile"
            @delete-file="deleteFile"
            @delete-folder="deleteFolder"
          />
        </div>

        <!-- Pagination -->
        <div v-if="s3Store.hasPrevPage || s3Store.hasNextPage" class="border-top p-2 d-flex justify-content-between align-items-center bg-light">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!s3Store.hasPrevPage || s3Store.isLoading"
            @click="prevPage"
          >
            <i class="bi bi-chevron-left me-1"></i>
            Previous
          </button>
          <span class="text-muted small">
            {{ s3Store.filteredFolders.length + s3Store.filteredObjects.length }} items
          </span>
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!s3Store.hasNextPage || s3Store.isLoading"
            @click="nextPage"
          >
            Next
            <i class="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </template>
    </template>

    <!-- Modals -->
    <CredentialModal
      :show="showCredentialModal"
      @close="showCredentialModal = false"
      @saved="onCredentialSaved"
    />

    <UploadModal
      :show="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="onFileUploaded"
    />

    <CreateFolderModal
      :show="showCreateFolderModal"
      @close="showCreateFolderModal = false"
      @created="onFolderCreated"
    />

    <HelpModal
      :show="showHelpModal"
      @close="showHelpModal = false"
    />
  </div>
</template>

<style scoped>
.alert-container {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
  min-width: 300px;
}
</style>
