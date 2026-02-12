<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const version = '0.2.1';

function onClose() {
  emit('close');
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
            <i class="bi bi-question-circle me-2"></i>
            Help & About
          </h5>
          <button type="button" class="btn-close" @click="onClose"></button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-4">
            <i class="bi bi-cloud display-1 text-primary"></i>
            <h4 class="mt-2">My S3 Browser</h4>
            <p class="text-muted">Version {{ version }}</p>
          </div>

          <div class="mb-4">
            <h6><i class="bi bi-info-circle me-2"></i>About</h6>
            <p class="small text-muted">
              My S3 Browser is a Chrome extension that allows you to browse, upload, and manage
              files in your Amazon S3 buckets directly from your browser.
            </p>
          </div>

          <div class="mb-4">
            <h6><i class="bi bi-rocket me-2"></i>Getting Started</h6>
            <ol class="small">
              <li>Add your AWS credentials using the credential dropdown in the navbar</li>
              <li>Select a bucket from the bucket dropdown</li>
              <li>Browse folders and files in your bucket</li>
              <li>Upload files, create folders, and download or delete files as needed</li>
            </ol>
          </div>

          <div class="mb-4">
            <h6><i class="bi bi-keyboard me-2"></i>Features</h6>
            <ul class="small">
              <li>Multiple AWS credential profiles</li>
              <li>Browse S3 buckets and folders</li>
              <li>Upload files to any location</li>
              <li>Create new folders</li>
              <li>Download files with pre-signed URLs</li>
              <li>Delete files and folders</li>
              <li>Search within current folder</li>
              <li>Pagination for large folders</li>
            </ul>
          </div>

          <div class="mb-4">
            <h6><i class="bi bi-shield-check me-2"></i>Security</h6>
            <p class="small text-muted">
              Your AWS credentials are stored locally in Chrome's secure storage.
              All S3 operations are performed directly between your browser and AWS.
              No data is sent to any third-party servers.
            </p>
          </div>

          <div>
            <h6><i class="bi bi-link-45deg me-2"></i>Links</h6>
            <ul class="list-unstyled small">
              <li>
                <a href="https://github.com/shishirsharma/MyS3Browser" target="_blank">
                  <i class="bi bi-github me-1"></i>
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com/shishirsharma/MyS3Browser/issues" target="_blank">
                  <i class="bi bi-bug me-1"></i>
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="onClose">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>
