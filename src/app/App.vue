<script setup lang="ts">
import { onMounted } from 'vue';
import { useCredentialsStore } from './stores/credentials';

const credentialsStore = useCredentialsStore();

onMounted(async () => {
  await credentialsStore.loadCredentials();
});
</script>

<template>
  <router-view />
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
