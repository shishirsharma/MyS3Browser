<script setup lang="ts">
import type { S3Folder } from '@/types';

const props = defineProps<{
  folder: S3Folder;
}>();

const emit = defineEmits<{
  navigate: [prefix: string];
  delete: [prefix: string];
}>();

function onNavigate() {
  emit('navigate', props.folder.prefix);
}

function onDelete() {
  if (confirm(`Are you sure you want to delete folder "${props.folder.displayName}"?`)) {
    emit('delete', props.folder.prefix);
  }
}
</script>

<template>
  <tr class="cursor-pointer" @click="onNavigate">
    <td>
      <i class="bi bi-folder-fill text-warning me-2"></i>
      {{ folder.displayName }}/
    </td>
    <td class="text-muted">-</td>
    <td class="text-muted">-</td>
    <td @click.stop>
      <button
        class="btn btn-outline-danger btn-sm"
        title="Delete Folder"
        @click="onDelete"
      >
        <i class="bi bi-trash"></i>
      </button>
    </td>
  </tr>
</template>

<style scoped>
tr.cursor-pointer {
  cursor: pointer;
}

tr.cursor-pointer:hover {
  background-color: #f8f9fa;
}
</style>
