import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/connect',
    name: 'WordConnect',
    component: () => import('../views/wordConnect/WordConnectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  next();
  // if (requiresAuth && !isAuthenticated) {
  //   next('/login');
  // } else if (!requiresAuth && isAuthenticated && (to.path === '/login' || to.path === '/register')) {
  //   next('/home');
  // } else {
  //   next();
  // }
});

export default router; 