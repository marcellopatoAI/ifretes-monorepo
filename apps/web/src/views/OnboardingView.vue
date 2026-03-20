<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const cnpj = ref('');
const nome = ref('');
const email = ref('');
const razaoSocial = ref('');
const step = ref('check'); // 'check' | 'details' | 'payment' | 'waitlist'
const waitlistSubmitted = ref(false);
const error = ref('');
const loading = ref(false);

let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
const clientSecret = ref('');

onMounted(async () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...your_placeholder_if_env_missing';
  stripe = await loadStripe(publishableKey);
});

// Automatic CNPJ validation when 14 digits are typed
watch(cnpj, (newValue) => {
  const digits = newValue.replace(/\D/g, '');
  if (digits.length === 14 && step.value === 'check' && !loading.value) {
    handleCnpjBlur();
  }
});

const handleCnpjBlur = async () => {
  const digits = cnpj.value.replace(/\D/g, '');
  if (digits.length < 14) return;
  
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/check-cnpj`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj: digits }),
    });
    const result = await response.json();
    if (result.ok) {
      razaoSocial.value = result.data.razaoSocial;
      nome.value = result.data.responsavel || '';
      email.value = result.data.email || '';
      
      if (result.data.status === 'waitlist') {
        step.value = 'waitlist';
      } else {
        step.value = 'details';
        // Automatically start payment flow
        initPaymentFlow();
      }
    } else {
      error.value = result.error || 'Erro ao validar CNPJ';
    }
  } catch (err: any) {
    error.value = 'Erro de conexão com o servidor';
  } finally {
    loading.value = false;
  }
};

const submitWaitlist = async () => {
  if (!nome.value || !email.value) {
    error.value = 'Por favor, preencha nome e e-mail.';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/submit-waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cnpj: cnpj.value.replace(/\D/g, ''),
        nome: nome.value,
        email: email.value,
        razaoSocial: razaoSocial.value,
      }),
    });
    const result = await response.json();
    if (result.ok) {
      waitlistSubmitted.value = true;
    } else {
      error.value = result.error || 'Erro ao enviar para lista de espera';
    }
  } catch (err: any) {
    error.value = 'Erro ao conectar com o servidor';
  } finally {
    loading.value = false;
  }
};

const initPaymentFlow = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    const result = await response.json();
    
    if (result.ok && result.clientSecret) {
        clientSecret.value = result.clientSecret;
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
  
  const { setupIntent, error: stripeError } = await stripe.confirmSetup({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/onboarding`,
    },
    redirect: 'if_required',
  });

  if (stripeError) {
    error.value = stripeError.message || 'Erro ao confirmar cartão';
    loading.value = false;
  } else if (setupIntent && setupIntent.status === 'succeeded') {
    // Payment method is confirmed (SetupIntent successful)
    // Now provision the access and charge
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: cnpj.value.replace(/\D/g, ''),
          nome: nome.value,
          email: email.value,
          razaoSocial: razaoSocial.value,
          setupIntentId: setupIntent.id,
        }),
      });
      const result = await response.json();
      
      if (result.ok) {
        const auth = useAuthStore();
        auth.setToken(result.token);
        auth.setUser(result.user);
        
        localStorage.setItem('show_post_checkout_tutorial', 'true');
        router.push('/');
      } else {
        error.value = result.error || 'Erro ao provisionar acesso';
        loading.value = false;
      }
    } catch (err: any) {
      error.value = 'Erro ao conectar com o servidor para provisionamento';
      loading.value = false;
    }
  } else {
    error.value = 'Ocorreu um erro inesperado ao confirmar o pagamento.';
    loading.value = false;
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
             <img src="/img/aldino.jpg" alt="Seu Aldino" class="w-full h-full object-cover">
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

        <!-- Step 1 & 2: CNPJ and Details -->
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
              
              <div v-show="clientSecret" class="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-700">
                <div class="space-y-1 mb-4">
                  <h4 class="text-sm font-bold text-[#070d29]">Método de Pagamento</h4>
                  <p class="text-[11px] text-gray-400">Insira os dados do cartão para ativação.</p>
                </div>
                
                <div id="payment-element" class="min-h-[200px]">
                  <!-- Stripe Element -->
                </div>

                <button 
                  @click="handlePaymentConfirmation"
                  :disabled="loading"
                  class="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  <span v-if="loading">Confirmando...</span>
                  <template v-else>
                      <span>Concluir e Acessar Painel</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </template>
                </button>
              </div>

              <div v-if="!clientSecret && loading" class="flex flex-col items-center justify-center py-12 space-y-4">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Preparando Checkout Seguro...</p>
              </div>
            </div>
          </transition>
        </div>

        <!-- Step: Waitlist -->
        <div v-if="step === 'waitlist'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div v-if="!waitlistSubmitted" class="space-y-6">
            <div class="bg-blue-50 border border-blue-100 rounded-3xl p-6 space-y-3">
              <div class="flex items-center space-x-3 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <h3 class="font-bold uppercase tracking-wider text-xs">Aviso importante</h3>
              </div>
              <p class="text-sm text-blue-800 leading-relaxed font-medium">
                Sua transportadora ainda não está liberada para o onboarding imediato. 
                Deixe seus contatos para entrar na nossa <strong>lista de espera prioritária</strong>.
              </p>
            </div>

            <div class="space-y-4">
               <div class="space-y-2">
                 <label class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">NOME DO RESPONSÁVEL *</label>
                 <input v-model="nome" type="text" placeholder="Como podemos te chamar?" class="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]" />
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">E-MAIL CORPORATIVO *</label>
                 <input v-model="email" type="email" placeholder="seu@email.com.br" class="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 outline-none transition-all font-semibold text-[#070d29]" />
               </div>
            </div>

            <button 
              @click="submitWaitlist"
              :disabled="loading"
              class="w-full h-14 bg-[#070d29] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span v-if="loading">Enviando...</span>
              <span v-else>Entrar na Fila de Espera</span>
            </button>
          </div>

          <!-- Waitlist Success State -->
          <div v-else class="text-center space-y-6 py-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-black text-[#070d29]">Pedido Recebido!</h2>
              <p class="text-gray-500 leading-relaxed">
                Obrigado pelo interesse. Sua transportadora foi adicionada à nossa lista de espera. Entraremos em contato em breve!
              </p>
            </div>
            <button @click="router.push('/')" class="text-blue-600 font-bold hover:underline">Voltar para o início</button>
          </div>
        </div>


        <!-- Link de Login sempre visível no card -->
        <div class="mt-8 text-center border-t border-gray-100 pt-6">
            <button 
              @click="router.push('/login')"
              class="text-[11px] font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
            >
              Já tem conta? <span class="text-blue-600 font-black">Fazer login</span>
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
