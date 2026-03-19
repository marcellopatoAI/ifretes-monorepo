<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
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
  <form @submit.prevent="handleLogin" class="space-y-6">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
      {{ error }}
    </div>

    <div>
      <label for="username" class="block text-sm font-semibold text-gray-700">Usuário</label>
      <div class="mt-1">
        <input 
          id="username" 
          v-model="username"
          type="text" 
          required 
          placeholder="Ex: admin"
          class="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all border"
        />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-semibold text-gray-700">Senha</label>
      <div class="mt-1">
        <input 
          id="password" 
          v-model="password"
          type="password" 
          required 
          placeholder="••••••••"
          class="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all border"
        />
      </div>
    </div>

    <div>
      <button 
        type="submit" 
        :disabled="loginMutation.isPending.value"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all font-sans"
      >
        <span v-if="loginMutation.isPending.value">Entrando...</span>
        <span v-else>Entrar no Sistema</span>
      </button>
    </div>
    
    <div class="text-center">
      <p class="text-xs text-gray-400">
        Esqueceu sua senha? Entre em contato com o suporte.
      </p>
    </div>
  </form>
</template>
