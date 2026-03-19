<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const isSidebarOpen = ref(true);
const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <aside 
      class="bg-blue-900 text-white w-64 flex-shrink-0 transition-all duration-300"
      :class="{ '-ml-64': !isSidebarOpen }"
    >
      <div class="p-6 border-b border-blue-800/50">
        <h1 class="text-2xl font-bold tracking-tight">iFretes <span class="text-blue-400">V2</span></h1>
      </div>
      <nav class="mt-4 px-4 space-y-2">
        <RouterLink to="/" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800/50 transition-all text-sm font-medium" active-class="bg-blue-800 shadow-inner">
          Dashboard
        </RouterLink>
        <RouterLink to="/me" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800/50 transition-all text-sm font-medium" active-class="bg-blue-800 shadow-inner">
          Meus Dados
        </RouterLink>
        <div class="pt-4 pb-2 text-[10px] font-bold text-blue-400/50 uppercase tracking-widest px-4">Logística</div>
        <RouterLink to="/transportadoras" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800/50 transition-all text-sm font-medium">
          Transportadoras
        </RouterLink>
        <RouterLink to="/fretes" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800/50 transition-all text-sm font-medium">
          Fretes
        </RouterLink>
      </nav>
      
      <div class="absolute bottom-0 w-64 p-4 border-t border-blue-800/50">
        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-bold border border-transparent hover:border-red-500/20">
          Sair do Sistema
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 bg-white">
      <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <span class="sr-only">Toggle Sidebar</span>
          <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex items-center space-x-4">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-bold text-gray-900 leading-none">Administrador</p>
            <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Plano Pro</p>
          </div>
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>
      
      <main class="p-8 flex-1 overflow-y-auto bg-gray-50/50">
        <slot />
      </main>
    </div>
  </div>
</template>
