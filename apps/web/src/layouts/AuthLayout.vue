<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-extrabold text-blue-900 tracking-tight">
        iFretes <span class="text-blue-500">V2</span>
      </h1>
      <p class="mt-2 text-center text-sm text-gray-600">
        Painel de Gestão e Logística
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
        <slot />
      </div>
    </div>
  </div>
</template>
