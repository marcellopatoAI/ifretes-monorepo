import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { layout: 'admin' },
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('../views/MeView.vue'),
      meta: { layout: 'admin' },
    },
    {
      path: '/transportadoras',
      name: 'transportadoras',
      component: () => import('../views/TransportadorasView.vue'),
      meta: { layout: 'admin' },
    },
    {
      path: '/fretes',
      name: 'fretes',
      component: () => import('../views/FretesView.vue'),
      meta: { layout: 'admin' },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isPublic = to.meta.layout === 'auth';

  if (!isPublic && !auth.isAuthenticated) {
    return next({ name: 'login' });
  }

  if (isPublic && auth.isAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
