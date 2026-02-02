<script setup lang="ts">
import { computed } from 'vue';
import { useCredentialsStore } from '../stores/credentials';

const emit = defineEmits<{
  addNew: [];
}>();

const credentialsStore = useCredentialsStore();

const currentCredentialName = computed(() => {
  return credentialsStore.activeCredential?.name || 'No Credentials';
});

async function selectCredential(name: string) {
  await credentialsStore.setActiveCredential(name);
}
</script>

<template>
  <div class="dropdown ms-2">
    <button
      class="btn btn-outline-light btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="bi bi-key me-1"></i>
      {{ currentCredentialName }}
    </button>
    <ul class="dropdown-menu dropdown-menu-dark">
      <li v-if="credentialsStore.credentials.length === 0">
        <span class="dropdown-item-text text-muted">No credentials saved</span>
      </li>
      <li v-for="cred in credentialsStore.credentials" :key="cred.name">
        <a
          class="dropdown-item"
          :class="{ active: cred.name === credentialsStore.activeCredentialName }"
          href="#"
          @click.prevent="selectCredential(cred.name)"
        >
          <i class="bi bi-key-fill me-2"></i>
          {{ cred.name }}
        </a>
      </li>
      <li v-if="credentialsStore.credentials.length > 0"><hr class="dropdown-divider"></li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click.prevent="emit('addNew')"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Add New Credential
        </a>
      </li>
    </ul>
  </div>
</template>
