<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import AppLayout from './layouts/AppLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

const route = useRoute();

const layouts = {
  admin: AppLayout,
  auth: AuthLayout,
};

const layout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'admin';
  return layouts[layoutName as keyof typeof layouts] || AppLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<style>
@import './assets/main.css';
</style>
