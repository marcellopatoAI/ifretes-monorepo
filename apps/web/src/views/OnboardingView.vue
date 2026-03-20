<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';

const router = useRouter();
const cnpj = ref('');
const nome = ref('');
const email = ref('');
const step = ref('check'); // 'check' | 'details' | 'payment'
const error = ref('');
const loading = ref(false);

let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
const clientSecret = ref('');

onMounted(async () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...your_placeholder_if_env_missing';
  stripe = await loadStripe(publishableKey);
});

const handleCnpjBlur = async () => {
  if (cnpj.value.length < 14) return;
  
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/check-cnpj`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj: cnpj.value }),
    });
    const result = await response.json();
    if (result.ok) {
      step.value = 'details';
    } else {
      error.value = result.error || 'Erro ao validar CNPJ';
    }
  } catch (err: any) {
    error.value = 'Erro de conexão com o servidor';
  } finally {
    loading.value = false;
  }
};

const proceedToPayment = async () => {
  if (!nome.value || !email.value) {
    error.value = 'Por favor, preencha todos os campos.';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    
    if (result.ok && result.clientSecret) {
        clientSecret.value = result.clientSecret;
        step.value = 'payment';
        
        // Wait for DOM to update and mount Stripe Elements
        setTimeout(() => mountStripeElements(), 100);
    } else {
        error.value = result.error || 'Erro ao preparar pagamento';
    }
  } catch (err: any) {
    error.value = 'Erro ao conectar com Stripe';
  } finally {
    loading.value = false;
  }
};

const mountStripeElements = () => {
    if (!stripe || !clientSecret.value) return;
    
    elements = stripe.elements({
        clientSecret: clientSecret.value,
        appearance: { theme: 'stripe' },
    });
    
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
};

const handlePaymentConfirmation = async () => {
  if (!stripe || !elements) return;

  loading.value = true;
  error.value = '';
  
  const { error: stripeError } = await stripe.confirmSetup({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/`,
    },
    redirect: 'if_required',
  });

  if (stripeError) {
    error.value = stripeError.message || 'Erro ao confirmar cartão';
    loading.value = false;
  } else {
    // Payment method is confirmed (SetupIntent successful)
    // Redirection to index as requested by user
    router.push('/');
  }
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
          <p class="text-sm font-bold">Onboarding de Transportadoras</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 rounded-full border-4 border-blue-500/30 overflow-hidden bg-gray-800 shadow-xl">
             <img src="/img/aldino.png" alt="Seu Aldino" class="w-full h-full object-cover">
          </div>
          <div class="space-y-1">
            <p class="text-xs font-bold text-blue-400 uppercase tracking-widest">Seu Aldino</p>
            <h2 class="text-3xl font-black uppercase leading-tight">
              Digite o CNPJ <br/> para começar.
            </h2>
          </div>
        </div>
        
        <div class="space-y-4">
          <h3 class="text-xl font-bold">Verificação inicial por CNPJ</h3>
          <p class="text-lg text-white/60 leading-relaxed max-w-lg">
            Digite o CNPJ para verificarmos se sua transportadora já está liberada nesta fase do onboarding do Instituto do Frete.
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-6 pt-12">
         <img src="/branding/instituto-do-frete.png" alt="Instituto do Frete" class="h-10 opacity-60 hover:opacity-100 transition-opacity cursor-help">
         <img src="/branding/hal-ai-logo.jpg" alt="Hal-AI" class="h-10 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
      </div>
    </div>

    <!-- Right Section: Onboarding Card -->
    <div class="w-full max-w-lg mx-auto">
      <div class="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center transition-all duration-500">
        
        <div v-if="error" class="mb-6 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl text-xs font-semibold animate-pulse">
            {{ error }}
        </div>

        <div v-if="step === 'check' || step === 'details'" class="space-y-8">
          <div class="space-y-2">
            <label class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">CNPJ *</label>
            <div class="relative">
                <input 
                  v-model="cnpj"
                  type="text" 
                  placeholder="00.000.000/0000-00"
                  @blur="handleCnpjBlur"
                  :disabled="loading"
                  class="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29] disabled:opacity-50"
                />
                <div v-if="loading && step === 'check'" class="absolute right-4 top-1/2 -translate-y-1/2">
                    <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="step === 'details'" class="space-y-8">
              <div class="grid gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">NOME *</label>
                    <input 
                      v-model="nome"
                      type="text" 
                      placeholder="Nome do responsável"
                      class="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">E-MAIL *</label>
                    <input 
                      v-model="email"
                      type="email" 
                      placeholder="E-mail corporativo"
                      class="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]"
                    />
                  </div>
              </div>
              
              <button 
                @click="proceedToPayment"
                :disabled="loading"
                class="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                <span v-if="loading">Iniciando Checkout...</span>
                <template v-else>
                    <span>Ir para Pagamento</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </template>
              </button>
            </div>
          </transition>
        </div>

        <div v-if="step === 'payment'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4">
           <div class="space-y-2">
             <h2 class="text-3xl font-black text-[#070d29]">Checkout Seguro</h2>
             <p class="text-sm text-gray-400">Configure seu cartão para ativar o sistema.</p>
           </div>
           
           <div id="payment-element" class="min-h-[200px]">
             <!-- Stripe Element -->
           </div>
           
           <button 
             @click="handlePaymentConfirmation"
             :disabled="loading"
             class="w-full h-14 bg-[#070d29] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
           >
             <span v-if="loading">Confirmando...</span>
             <span v-else>Concluir e Acessar Painel</span>
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
</style>
