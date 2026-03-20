<template>
  <q-layout view="lHh Lpr lFf" class="user-layout-bg" @mousemove="handleMouseMove" :style="{ '--aura-primary': aura.color, '--aura-glow': aura.glow }">
    <!-- BARRA SUPERIOR PROFESIONAL -->
    <q-header class="header-glass q-py-sm">
      <q-toolbar class="row no-wrap items-center justify-between q-px-lg">
        <!-- IZQUIERDA: LOGO Y TÍTULO DINÁMICO -->
        <div class="row items-center q-gutter-md">
          <div class="logo-box row items-center q-gutter-xs">
            <q-icon name="auto_awesome" size="28px" class="text-amber-5 text-glow-amber" />
            <div class="text-h6 cinzel-font text-white text-weight-bolder letter-spacing-2">ASTRA<span class="text-amber-5">●</span>AI</div>
          </div>
          <q-separator vertical dark inset class="q-mx-md opacity-20" />
          <div class="text-overline text-amber-5 letter-spacing-2 current-page-title animate-slide-left">
            {{ currentTitle }}
          </div>
        </div>

        <!-- DERECHA: ACCIONES Y AURAS -->
        <div class="row items-center q-gutter-md z-top">
          
          <!-- SELECTOR DE AURA GLOBAL -->
          <div class="row items-center q-gutter-sm hide-on-mobile q-mr-md">
             <div class="text-caption text-grey-4 cinzel-font q-mr-sm">Aura:</div>
             <q-btn round size="xs" class="aura-btn amber-aura" :class="{ 'active-aura': aura.name === 'Fuerza' }" @click="setAura('Fuerza')" />
             <q-btn round size="xs" class="aura-btn sapphire-aura" :class="{ 'active-aura': aura.name === 'Paz' }" @click="setAura('Paz')" />
             <q-btn round size="xs" class="aura-btn amethyst-aura" :class="{ 'active-aura': aura.name === 'Claridad' }" @click="setAura('Claridad')" />
          </div>

          <!-- ICONO CAMPANA (DISPARADOR) -->
          <q-btn flat round icon="notifications" color="amber-5" @click="notifRef.openDrawer()" class="action-icon">
            <q-badge floating color="red-6" text-color="white" rounded v-if="authStore.unreadCount > 0">{{ authStore.unreadCount }}</q-badge>
          </q-btn>
          
          <q-separator vertical dark inset class="q-mx-sm opacity-20" />
          
          <!-- ICONO PERFIL (DISPARADOR) -->
          <div class="profile-trigger row items-center q-gutter-sm cursor-pointer" @click="perfilRef.openDrawer()">
            <div class="column items-end justify-center q-mr-xs hide-on-mobile">
              <span class="text-white text-caption text-weight-bolder">{{ userName }}</span>
              <span class="text-amber-5" style="font-size: 9px">{{ authStore.usuario?.estado === 1 ? 'ILUMINADO' : 'INICIADO' }}</span>
            </div>
            <q-avatar size="38px" class="avatar-glow">
              <img :src="userAvatar">
            </q-avatar>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL MINIMALISTA -->
    <q-drawer v-model="drawer" show-if-above :width="80" class="sidebar-glass">
      <div class="full-height column items-center q-py-xl">
        <q-list class="q-gutter-y-lg">
          <q-item clickable v-ripple to="/user/dashboard" active-class="nav-active" class="nav-icon-item">
            <q-icon name="dashboard" size="24px" />
            <q-tooltip anchor="center right" self="center left">COSMOS</q-tooltip>
          </q-item>
          <q-item clickable v-ripple to="/user/oracle" active-class="nav-active" class="nav-icon-item">
            <q-icon name="stars" size="24px" />
            <q-tooltip anchor="center right" self="center left">SANTUARIO</q-tooltip>
          </q-item>
          <q-item clickable v-ripple to="/user/vault" active-class="nav-active" class="nav-icon-item">
            <q-icon name="auto_stories" size="24px" />
            <q-tooltip anchor="center right" self="center left">ARCHIVO</q-tooltip>
          </q-item>
          <q-item clickable v-ripple to="/user/seals" active-class="nav-active" class="nav-icon-item">
            <q-icon name="military_tech" size="24px" />
            <q-tooltip anchor="center right" self="center left">GRIMORIO</q-tooltip>
          </q-item>
          <q-item clickable v-ripple to="/user/payments" active-class="nav-active" class="nav-icon-item">
            <q-icon name="payments" size="24px" />
            <q-tooltip anchor="center right" self="center left">OFRENDAS</q-tooltip>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <!-- CONTENEDOR CON SCROLL NATIVO PARA EVITAR CORTES -->
      <q-scroll-area style="height: calc(100vh - 75px);" :thumb-style="{ background: '#fbbf24', width: '5px' }">
        <router-view v-slot="{ Component }">
          <transition name="nebula-travel" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </q-scroll-area>
    </q-page-container>

    <!-- COMPONENTES DE DIÁLOGO (LOS QUE BAJAN DE ARRIBA) -->
    <Perfil ref="perfilRef" />
    <NotificacionesUser ref="notifRef" />

    <!-- EFECTO DE PARTÍCULAS -->
    <div class="magic-particles" v-for="p in particles" :key="p.id" :style="{ left: p.x + 'px', top: p.y + 'px', opacity: p.opacity }"></div>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/Auth.js'
import { useRoute } from 'vue-router'
import Perfil from '../components/perfil.vue'
import NotificacionesUser from '../components/notificacionesUser.vue'

const authStore = useAuthStore()
const route = useRoute()
const drawer = ref(true)
const perfilRef = ref(null)
const notifRef = ref(null)

const userName = computed(() => authStore.usuario?.nombre?.split(' ')[0] || 'Buscador')
const userAvatar = computed(() => authStore.usuario?.avatar || 'https://i.pravatar.cc/150?img=33')

// CONTROL DE AURA GLOBAL
const auras = {
  Fuerza: { name: 'Fuerza', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  Paz: { name: 'Paz', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)' },
  Claridad: { name: 'Claridad', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' }
}
const aura = ref(auras.Fuerza)
const setAura = (tipo) => { aura.value = auras[tipo] }

const currentTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return 'SINTONÍA ACTUAL'
  if (path.includes('oracle')) return 'SANTUARIO INTERIOR'
  if (path.includes('vault')) return 'CRÓNICAS DEL TIEMPO'
  if (path.includes('seals')) return 'EL GRIMORIO'
  if (path.includes('payments')) return 'OFRENDAS AL DESTINO'
  return 'COSMOS'
})

// LÓGICA DE PARTÍCULAS
const particles = ref([])
let pId = 0
const handleMouseMove = (e) => {
   const id = pId++
   particles.value.push({ id, x: e.clientX, y: e.clientY, opacity: 1 })
   if (particles.value.length > 15) particles.value.shift()
   setTimeout(() => {
      const idx = particles.value.findIndex(p => p.id === id)
      if (idx !== -1) particles.value[idx].opacity = 0
   }, 300)
}
</script>

<style>
body, html { margin: 0; padding: 0; background-color: #020617; }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');

.user-layout-bg {
  background: #020617;
  background-image: radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.5) 0%, #020617 100%);
  min-height: 100vh;
  width: 100%;
}

.header-glass {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-glass {
  background: rgba(15, 23, 42, 0.4) !important;
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-icon-item {
  color: #94a3b8; border-radius: 16px; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-active {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24 !important;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.15);
}

.avatar-glow { border: 2px solid #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3); transition: 0.3s; }
.avatar-glow:hover { transform: scale(1.1); }

.current-page-title { font-weight: 900; font-size: 14px; }

.aura-btn { border: 2px solid rgba(255, 255, 255, 0.1); transition: all 0.3s; opacity: 0.7; }
.aura-btn:hover { transform: scale(1.2); opacity: 1; }
.active-aura { border-color: #fff; box-shadow: 0 0 10px var(--aura-primary); transform: scale(1.2); opacity: 1; }
.amber-aura { background: linear-gradient(45deg, #fbbf24, #d97706); }
.sapphire-aura { background: linear-gradient(45deg, #60a5fa, #2563eb); }
.amethyst-aura { background: linear-gradient(45deg, #c084fc, #7e22ce); }

.magic-particles {
  position: fixed; width: 3px; height: 3px; background: #fbbf24;
  border-radius: 50%; pointer-events: none; z-index: 9999;
  box-shadow: 0 0 8px #fbbf24; transition: opacity 0.3s ease;
}

.animate-slide-left { animation: slideLeft 0.5s ease-out both; }
@keyframes slideLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }

@media (max-width: 600px) { .hide-on-mobile { display: none; } }

.nebula-travel-enter-active, .nebula-travel-leave-active { transition: all 0.5s ease; }
.nebula-travel-enter-from { opacity: 0; transform: scale(1.1) blur(10px); }
.nebula-travel-leave-to { opacity: 0; transform: scale(0.9) blur(10px); }
</style>