<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
      <div class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
        Fase 0: Fundação
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
  </div>
</template>
