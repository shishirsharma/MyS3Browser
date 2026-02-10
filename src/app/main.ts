import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { initializeAnalytics } from './services/analytics';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);

// Initialize Google Analytics
initializeAnalytics();

app.use(createPinia());
app.use(router);

app.mount('#app');
