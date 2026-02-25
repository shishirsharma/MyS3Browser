<script setup lang="ts">
import { useS3Store } from '../stores/s3';
import FolderRow from './FolderRow.vue';
import FileRow from './FileRow.vue';

const emit = defineEmits<{
  navigateFolder: [prefix: string];
  downloadFile: [key: string];
  deleteFile: [key: string];
  deleteFolder: [prefix: string];
  renameFile: [key: string];
  shareFile: [key: string];
}>();

const s3Store = useS3Store();
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover table-striped mb-0">
      <thead class="table-light">
        <tr>
          <th style="width: 50%">Name</th>
          <th style="width: 15%">Size</th>
          <th style="width: 20%">Last Modified</th>
          <th style="width: 15%">Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="s3Store.isLoading">
          <td colspan="4" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 mb-0 text-muted">Loading...</p>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-else-if="s3Store.filteredFolders.length === 0 && s3Store.filteredObjects.length === 0">
          <td colspan="4" class="text-center py-4">
            <i class="bi bi-folder2-open fs-1 text-muted"></i>
            <p class="mt-2 mb-0 text-muted">
              {{ s3Store.searchQuery ? 'No matching files or folders' : 'This folder is empty' }}
            </p>
          </td>
        </tr>

        <!-- Folders -->
        <FolderRow
          v-for="folder in s3Store.filteredFolders"
          :key="folder.prefix"
          :folder="folder"
          @navigate="emit('navigateFolder', $event)"
          @delete="emit('deleteFolder', $event)"
        />

        <!-- Files -->
        <FileRow
          v-for="obj in s3Store.filteredObjects"
          :key="obj.key"
          :object="obj"
          @download="emit('downloadFile', $event)"
          @delete="emit('deleteFile', $event)"
          @rename="emit('renameFile', $event)"
          @share="emit('shareFile', $event)"
        />
      </tbody>
    </table>
  </div>
</template>
