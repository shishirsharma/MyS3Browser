<script setup lang="ts">
import { computed } from 'vue';
import { useCredentialsStore } from '../stores/credentials';
import { trackEvent } from '../services/analytics';
import { getAnonymousCredentialId } from '../services/anonymization';
import type { Credential } from '@/types';

const emit = defineEmits<{
  addNew: [];
  edit: [credential: Credential];
}>();

const credentialsStore = useCredentialsStore();

const currentCredentialName = computed(() => {
  return credentialsStore.activeCredential?.name || 'No Credentials';
});

async function selectCredential(name: string) {
  await credentialsStore.setActiveCredential(name);
  await getAnonymousCredentialId(name); // Register credential ID
  trackEvent('credential_action', { action: 'selected' });
}

function editCredential(event: Event, credential: Credential) {
  event.stopPropagation();
  emit('edit', credential);
}

async function deleteCredential(event: Event, name: string) {
  event.stopPropagation();

  if (confirm(`Are you sure you want to delete the credential "${name}"?`)) {
    try {
      await credentialsStore.deleteCredential(name);
      trackEvent('credential_action', { action: 'deleted' });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete credential');
    }
  }
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
        <div class="dropdown-item-wrapper d-flex align-items-center justify-content-between px-0">
          <a
            class="dropdown-item flex-grow-1"
            :class="{ active: cred.name === credentialsStore.activeCredentialName }"
            href="#"
            @click.prevent="selectCredential(cred.name)"
          >
            <i class="bi bi-key-fill me-2"></i>
            {{ cred.name }}
          </a>
          <div class="dropdown-actions d-flex gap-1 pe-2">
            <button
              class="btn btn-sm btn-link p-0 text-info"
              title="Edit credential"
              @click="editCredential($event, cred)"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-link p-0 text-danger"
              title="Delete credential"
              @click="deleteCredential($event, cred.name)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
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

<style scoped>
.dropdown-item-wrapper {
  position: relative;
}

.dropdown-item-wrapper .dropdown-item {
  padding-right: 60px;
}

.dropdown-item-wrapper .dropdown-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.dropdown-item-wrapper:hover .dropdown-actions {
  display: flex !important;
}

.dropdown-actions .btn {
  font-size: 0.85rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.dropdown-actions .btn:hover {
  opacity: 0.7;
}
</style>
