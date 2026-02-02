<script setup lang="ts">
import { ref } from 'vue';
import BucketDropdown from './BucketDropdown.vue';
import CredentialDropdown from './CredentialDropdown.vue';
import type { Credential } from '@/types';

const emit = defineEmits<{
  search: [query: string];
  showHelp: [];
  showCredentialModal: [];
  editCredentialModal: [credential: Credential];
  showUploadModal: [];
  showCreateFolderModal: [];
}>();

const searchQuery = ref('');

function onSearch() {
  emit('search', searchQuery.value);
}

function clearSearch() {
  searchQuery.value = '';
  emit('search', '');
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="#">
        <i class="bi bi-cloud me-2"></i>
        My S3 Browser
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <BucketDropdown />
          </li>
          <li class="nav-item">
            <CredentialDropdown
              @add-new="$emit('showCredentialModal')"
              @edit="(cred) => $emit('editCredentialModal', cred)"
            />
          </li>
        </ul>

        <form class="d-flex me-2" @submit.prevent="onSearch">
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="search"
              class="form-control form-control-sm"
              placeholder="Search files..."
              @input="onSearch"
            />
            <button
              v-if="searchQuery"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </form>

        <div class="d-flex gap-2">
          <button
            class="btn btn-outline-light btn-sm"
            title="Upload File"
            @click="$emit('showUploadModal')"
          >
            <i class="bi bi-upload"></i>
          </button>
          <button
            class="btn btn-outline-light btn-sm"
            title="Create Folder"
            @click="$emit('showCreateFolderModal')"
          >
            <i class="bi bi-folder-plus"></i>
          </button>
          <button
            class="btn btn-outline-light btn-sm"
            title="Help"
            @click="$emit('showHelp')"
          >
            <i class="bi bi-question-circle"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
