<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');

const loginMutation = useMutation({
  mutationFn: async (credentials: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Falha na autenticação');
    }
    
    return response.json();
  },
  onSuccess: (data) => {
    if (data.ok) {
      authStore.setToken(data.data.access_token);
      authStore.setUser(data.data.user);
      router.push('/');
    } else {
      error.value = data.error || 'Erro desconhecido';
    }
  },
  onError: (err: any) => {
    error.value = err.message || 'Erro ao conectar com o servidor';
  },
});

const handleLogin = () => {
  error.value = '';
  loginMutation.mutate({ username: username.value, password: password.value });
};
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
    <!-- Left Section: Info Panel -->
    <div class="hidden lg:flex flex-col text-white space-y-8">
      <div class="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-full py-2 px-6 w-fit backdrop-blur-sm">
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-white/20">
          <img src="/branding/hal-ai-logo.jpg" alt="Hal-AI" class="w-full h-full object-cover">
        </div>
        <div>
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-60">Plataforma Hal AI</p>
          <p class="text-sm font-bold">Acesso ao ecossistema operacional</p>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-[32px] font-bold leading-tight tracking-tight uppercase">
          LOGIN SEGURO PARA TIMES, OPERADORES E GESTÃO
        </h2>
        <h1 class="text-5xl font-black leading-[1.1] tracking-tighter">
          Entre na operação e <br/>
          continue exatamente <br/>
          de onde parou.
        </h1>
        <p class="text-lg text-white/60 leading-relaxed max-w-lg">
          Gerencie jornadas de onboarding, campanhas, cobrança e atendimento em um único ambiente, com sessão rastreada e autenticação centralizada.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-3">
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-40">Segurança</p>
          <p class="text-[11px] leading-relaxed text-white/80">
            Sessão única por usuário com controle centralizado de acesso.
          </p>
        </div>
        <div class="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-3">
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-40">Operação</p>
          <p class="text-[11px] leading-relaxed text-white/80">
            Continue onboarding, cobrança e supervisão sem trocar de ambiente.
          </p>
        </div>
        <div class="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-3">
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-40">Suporte</p>
          <p class="text-[11px] leading-relaxed text-white/80">
            Acesso rápido para gestores, operadores e perfis de acompanhamento.
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <span class="bg-white/10 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-white/50">Onboarding</span>
        <span class="bg-white/10 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-white/50">Cobrança</span>
        <span class="bg-white/10 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-white/50">Whatsapp Business</span>
      </div>
    </div>

    <!-- Right Section: Login Card -->
    <div class="w-full max-w-lg mx-auto">
      <div class="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <!-- Logo Top Right (Instituto do Frete) -->
        <div class="absolute top-8 right-12 w-16 h-16 pointer-events-none">
          <img src="/branding/instituto-do-frete.png" alt="Instituto do Frete" class="w-full h-full object-contain">
        </div>

        <div class="mb-10">
          <p class="text-[10px] font-bold tracking-[0.2em] text-blue-300 uppercase mb-2">Autenticação</p>
          <h2 class="text-3xl font-black text-[#070d29]">Acesse sua conta</h2>
          <p class="text-sm text-gray-400 mt-2 leading-relaxed">
            Use seu e-mail ou usuário para entrar no ambiente da transportadora, operação ou gestão.
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl text-xs font-semibold">
            {{ error }}
          </div>

          <div class="space-y-2">
            <label for="username" class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">E-mail ou Usuário</label>
            <div class="relative group">
              <input 
                id="username" 
                v-model="username"
                type="text" 
                required 
                placeholder="marcello"
                class="w-full h-14 bg-gray-50 border-2 border-transparent group-focus-within:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]"
              />
              <div class="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="password" class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Senha</label>
            <div class="relative group">
              <input 
                id="password" 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                required 
                placeholder="••••"
                class="w-full h-14 bg-gray-50 border-2 border-transparent group-focus-within:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] font-bold">
            <label class="flex items-center space-x-2 cursor-pointer text-gray-400">
              <input type="checkbox" class="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500">
              <span>Lembrar de mim</span>
            </label>
            <a href="#" class="text-blue-600 hover:text-blue-700">Esqueceu a senha?</a>
          </div>

          <div class="space-y-4 pt-4">
            <button 
              type="submit" 
              :disabled="loginMutation.isPending.value"
              class="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] disabled:opacity-50 font-bold tracking-wide"
            >
              <span v-if="loginMutation.isPending.value">Entrando...</span>
              <template v-else>
                <span>Entrar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </template>
            </button>

            <button 
              type="button" 
              @click="router.push('/onboarding')"
              class="w-full h-14 border-2 border-gray-100 text-gray-500 rounded-2xl flex items-center justify-center space-x-3 transition-all hover:bg-gray-50 hover:border-gray-200 font-bold tracking-wide"
            >
              <span>Criar conta e iniciar onboarding</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
