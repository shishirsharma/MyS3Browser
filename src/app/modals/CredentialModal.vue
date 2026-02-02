<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCredentialsStore } from '../stores/credentials';
import type { Credential } from '@/types';

const props = defineProps<{
  show: boolean;
  editCredential?: Credential | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const credentialsStore = useCredentialsStore();

const name = ref('');
const accessKeyId = ref('');
const secretAccessKey = ref('');
const region = ref('us-east-1');
const bucket = ref('');
const error = ref<string | null>(null);
const isSaving = ref(false);

const isEditing = computed(() => !!props.editCredential);
const modalTitle = computed(() => isEditing.value ? 'Edit Credential' : 'Add Credential');

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'af-south-1',
  'ap-east-1',
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'eu-south-1',
  'me-south-1',
  'sa-east-1',
];

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editCredential) {
      name.value = props.editCredential.name;
      accessKeyId.value = props.editCredential.accessKeyId;
      secretAccessKey.value = props.editCredential.secretAccessKey;
      region.value = props.editCredential.region;
      bucket.value = props.editCredential.bucket;
    } else {
      resetForm();
    }
    error.value = null;
  }
});

function resetForm() {
  name.value = '';
  accessKeyId.value = '';
  secretAccessKey.value = '';
  region.value = 'us-east-1';
  bucket.value = '';
  error.value = null;
}

async function onSubmit() {
  error.value = null;

  // Validation
  if (!name.value.trim()) {
    error.value = 'Name is required';
    return;
  }
  if (!accessKeyId.value.trim()) {
    error.value = 'Access Key ID is required';
    return;
  }
  if (!secretAccessKey.value.trim()) {
    error.value = 'Secret Access Key is required';
    return;
  }
  if (!region.value.trim()) {
    error.value = 'Region is required';
    return;
  }

  // Check for duplicate name (only when adding new)
  if (!isEditing.value && credentialsStore.getCredentialByName(name.value.trim())) {
    error.value = 'A credential with this name already exists';
    return;
  }

  isSaving.value = true;

  try {
    const credential: Credential = {
      name: name.value.trim(),
      accessKeyId: accessKeyId.value.trim(),
      secretAccessKey: secretAccessKey.value.trim(),
      region: region.value.trim(),
      bucket: bucket.value.trim(),
    };

    await credentialsStore.saveCredential(credential);
    emit('saved');
    emit('close');
    resetForm();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save credential';
  } finally {
    isSaving.value = false;
  }
}

function onClose() {
  emit('close');
  resetForm();
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
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-key me-2"></i>
            {{ modalTitle }}
          </h5>
          <button type="button" class="btn-close" @click="onClose"></button>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="modal-body">
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div class="mb-3">
              <label class="form-label">Name *</label>
              <input
                v-model="name"
                type="text"
                class="form-control"
                placeholder="e.g., Production AWS"
                :disabled="isEditing"
              />
              <div class="form-text">A friendly name to identify this credential</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Access Key ID *</label>
              <input
                v-model="accessKeyId"
                type="text"
                class="form-control"
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Secret Access Key *</label>
              <input
                v-model="secretAccessKey"
                type="password"
                class="form-control"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Region *</label>
              <select v-model="region" class="form-select">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Default Bucket (optional)</label>
              <input
                v-model="bucket"
                type="text"
                class="form-control"
                placeholder="my-bucket-name"
              />
              <div class="form-text">Will be selected automatically when switching to this credential</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="onClose">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>
