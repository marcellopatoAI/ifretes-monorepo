<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showTutorialModal = ref(false);

onMounted(() => {
  const autoOpen = localStorage.getItem('show_post_checkout_tutorial') === 'true';
  const hasSeenTutorial = document.cookie.includes('view-tutorial=1');

  if (autoOpen && !hasSeenTutorial) {
    showTutorialModal.value = true;
  }
});

const openTutorial = () => {
  showTutorialModal.value = true;
};

const closeTutorial = () => {
  document.cookie = 'view-tutorial=1; Path=/; Max-Age=31536000; SameSite=Lax';
  localStorage.removeItem('show_post_checkout_tutorial');
  showTutorialModal.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        <p class="text-sm text-gray-500">Bem-vindo de volta ao iFretes.</p>
      </div>
      <div class="flex items-center gap-4">
        <button
          @click="openTutorial"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] active:scale-95"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.75 12 9 15.5V8.5L14.75 12Z" fill="currentColor"></path>
          </svg>
          Ver tutorial
        </button>
        <div class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
          Fase 0: Fundação
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status do Sistema</h3>
        <p class="mt-2 text-2xl font-bold text-green-600 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          Online
        </p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monorepo</h3>
        <p class="mt-2 text-2xl font-bold text-blue-900">pnpm + Turbo</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Backend</h3>
        <p class="mt-2 text-2xl font-bold text-blue-900">NestJS + Fastify</p>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <h3 class="font-bold text-gray-900">Próximos Passos (Fase 1)</h3>
      </div>
      <div class="p-6">
        <ul class="space-y-3">
          <li class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <span class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              Sincronização de Sessão (HALAI)
            </span>
            <span class="text-xs font-bold text-gray-400">AGUARDANDO</span>
          </li>
          <li class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <span class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              Gestão de Assinaturas
            </span>
            <span class="text-xs font-bold text-gray-400">AGUARDANDO</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Tutorial Modal -->
    <div v-if="showTutorialModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/75 p-3 sm:p-6" role="dialog" aria-modal="true" @click.self="closeTutorial">
        <div class="w-full max-w-6xl rounded-2xl bg-white p-3 shadow-2xl dark:bg-slate-900 sm:p-4 animate-in fade-in zoom-in-95 duration-300">
            <div class="mb-3 flex items-center justify-between gap-3">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">Tutorial de primeiros passos</h2>
                <button
                    @click="closeTutorial"
                    class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
                >
                    Fechar
                </button>
            </div>

            <iframe 
              src="https://scribehow.com/embed/Add_User_Import_Freight_Data_and_Calculate_Minimum_Freight__xEsWHDSCQHGy_LYUExw8ZA?as=video" 
              width="100%" 
              height="600" 
              allow="fullscreen" 
              style="aspect-ratio: 16 / 10; border: 0; min-height: 480px"
              class="rounded-xl"
            ></iframe>
        </div>
    </div>
  </div>
</template>
