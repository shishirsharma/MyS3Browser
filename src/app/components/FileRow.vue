<script setup lang="ts">
import { computed } from 'vue';
import type { S3Object } from '@/types';

const props = defineProps<{
  object: S3Object;
}>();

const emit = defineEmits<{
  download: [key: string];
  delete: [key: string];
}>();

const fileIcon = computed(() => {
  const name = props.object.displayName.toLowerCase();

  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.webp')) {
    return 'bi-file-image text-success';
  }
  if (name.endsWith('.pdf')) {
    return 'bi-file-pdf text-danger';
  }
  if (name.endsWith('.doc') || name.endsWith('.docx')) {
    return 'bi-file-word text-primary';
  }
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
    return 'bi-file-excel text-success';
  }
  if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.gz') || name.endsWith('.rar')) {
    return 'bi-file-zip text-warning';
  }
  if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) {
    return 'bi-file-music text-info';
  }
  if (name.endsWith('.mp4') || name.endsWith('.avi') || name.endsWith('.mov') || name.endsWith('.webm')) {
    return 'bi-file-play text-danger';
  }
  if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py') || name.endsWith('.java') || name.endsWith('.c') || name.endsWith('.cpp')) {
    return 'bi-file-code text-secondary';
  }
  if (name.endsWith('.json') || name.endsWith('.xml') || name.endsWith('.yaml') || name.endsWith('.yml')) {
    return 'bi-file-code text-info';
  }
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return 'bi-file-text text-secondary';
  }

  return 'bi-file-earmark text-secondary';
});

const formattedDate = computed(() => {
  const date = props.object.lastModified;
  if (!date) return '-';
  return new Date(date).toLocaleString();
});

function onDownload() {
  emit('download', props.object.key);
}

function onDelete() {
  if (confirm(`Are you sure you want to delete "${props.object.displayName}"?`)) {
    emit('delete', props.object.key);
  }
}
</script>

<template>
  <tr>
    <td>
      <i :class="['bi me-2', fileIcon]"></i>
      {{ object.displayName }}
    </td>
    <td>{{ object.humanSize }}</td>
    <td>{{ formattedDate }}</td>
    <td>
      <div class="btn-group btn-group-sm">
        <button
          class="btn btn-outline-primary"
          title="Download"
          @click="onDownload"
        >
          <i class="bi bi-download"></i>
        </button>
        <button
          class="btn btn-outline-danger"
          title="Delete"
          @click="onDelete"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
</template>
