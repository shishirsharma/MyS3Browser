<script setup lang="ts">
import { useS3Store } from '../stores/s3';

const emit = defineEmits<{
  navigate: [prefix: string];
}>();

const s3Store = useS3Store();

function onNavigate(prefix: string) {
  emit('navigate', prefix);
}
</script>

<template>
  <nav aria-label="breadcrumb" class="bg-light p-2 border-bottom">
    <ol class="breadcrumb mb-0">
      <li class="breadcrumb-item">
        <i class="bi bi-cloud-fill text-primary"></i>
        <span class="ms-1">s3://</span>
      </li>
      <li
        v-for="(crumb, index) in s3Store.breadcrumbs"
        :key="crumb.prefix"
        class="breadcrumb-item"
        :class="{ active: index === s3Store.breadcrumbs.length - 1 }"
      >
        <a
          v-if="index < s3Store.breadcrumbs.length - 1"
          href="#"
          @click.prevent="onNavigate(crumb.prefix)"
        >
          {{ crumb.name }}
        </a>
        <span v-else>{{ crumb.name }}</span>
      </li>
    </ol>
  </nav>
</template>
