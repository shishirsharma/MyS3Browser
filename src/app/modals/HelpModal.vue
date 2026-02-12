<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const version = '0.2.1';
const activeTab = ref('about');

function onClose() {
  emit('close');
}

function setActiveTab(tab: string) {
  activeTab.value = tab;
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
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'about' }"
                @click="setActiveTab('about')"
                type="button"
              >
                <i class="bi bi-info-circle me-1"></i>
                About
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'getting-started' }"
                @click="setActiveTab('getting-started')"
                type="button"
              >
                <i class="bi bi-rocket me-1"></i>
                Getting Started
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'features' }"
                @click="setActiveTab('features')"
                type="button"
              >
                <i class="bi bi-keyboard me-1"></i>
                Features
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'security' }"
                @click="setActiveTab('security')"
                type="button"
              >
                <i class="bi bi-shield-check me-1"></i>
                Security & Links
              </button>
            </li>
          </ul>

          <!-- Tabs Content -->
          <div class="tab-content">
            <!-- About Tab -->
            <div v-show="activeTab === 'about'" class="tab-pane fade" :class="{ 'show active': activeTab === 'about' }">
              <div class="text-center mb-4">
                <i class="bi bi-cloud display-1 text-primary"></i>
                <h4 class="mt-2">My S3 Browser</h4>
                <p class="text-muted">Version {{ version }}</p>
              </div>
              <p class="text-muted">
                My S3 Browser is a Chrome extension that allows you to browse, upload, and manage
                files in your Amazon S3 buckets and S3-compatible services (Wasabi, MinIO, DigitalOcean Spaces)
                directly from your browser.
              </p>
            </div>

            <!-- Getting Started Tab -->
            <div v-show="activeTab === 'getting-started'" class="tab-pane fade" :class="{ 'show active': activeTab === 'getting-started' }">
              <h6 class="mb-3">Quick Start Guide</h6>
              <ol>
                <li class="mb-2">Add your AWS credentials using the credential dropdown in the navbar</li>
                <li class="mb-2">Optionally specify a custom endpoint URL for S3-compatible services</li>
                <li class="mb-2">Select a bucket from the bucket dropdown</li>
                <li class="mb-2">Browse folders and files in your bucket</li>
                <li class="mb-2">Upload files, create folders, and download or delete files as needed</li>
              </ol>
            </div>

            <!-- Features Tab -->
            <div v-show="activeTab === 'features'" class="tab-pane fade" :class="{ 'show active': activeTab === 'features' }">
              <h6 class="mb-3">Key Features</h6>
              <div class="row">
                <div class="col-md-6">
                  <ul>
                    <li>Multiple AWS credential profiles</li>
                    <li>Custom endpoint URLs for S3-compatible services</li>
                    <li>Browse S3 buckets and folders</li>
                    <li>Upload files to any location</li>
                    <li>Create new folders</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul>
                    <li>Download files with pre-signed URLs</li>
                    <li>Delete files and folders</li>
                    <li>Search within current folder</li>
                    <li>Pagination for large folders</li>
                    <li>Privacy-first analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Security & Links Tab -->
            <div v-show="activeTab === 'security'" class="tab-pane fade" :class="{ 'show active': activeTab === 'security' }">
              <h6 class="mb-3"><i class="bi bi-shield-check me-2"></i>Security</h6>
              <p class="text-muted mb-4">
                Your AWS credentials are stored locally in Chrome's secure storage.
                All S3 operations are performed directly between your browser and AWS.
                No data is sent to any third-party servers.
              </p>

              <h6 class="mb-3"><i class="bi bi-link-45deg me-2"></i>Links</h6>
              <ul class="list-unstyled">
                <li class="mb-2">
                  <a href="https://github.com/shishirsharma/MyS3Browser" target="_blank">
                    <i class="bi bi-github me-1"></i>
                    GitHub Repository
                  </a>
                </li>
                <li class="mb-2">
                  <a href="https://github.com/shishirsharma/MyS3Browser/issues" target="_blank">
                    <i class="bi bi-bug me-1"></i>
                    Report an Issue
                  </a>
                </li>
              </ul>
            </div>
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
