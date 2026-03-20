<template>
  <div class="min-h-screen bg-[#070d29] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Grid Background -->
    <div class="absolute inset-0 z-0 opacity-20" 
         style="background-image: radial-gradient(#2563eb 0.5px, transparent 0.5px); background-size: 24px 24px;">
    </div>
    
    <!-- Content Wrapper -->
    <div class="z-10 w-full max-w-6xl">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Optional: additive styles if needed, but Tailwind 4 handles most */
</style>
