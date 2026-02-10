import { createRouter, createWebHashHistory } from 'vue-router';
import { trackPageView } from '../services/analytics';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
  ],
});

// Track page views on route change
router.afterEach((to) => {
  trackPageView(to.path, to.name as string || 'Page');
});

export default router;
