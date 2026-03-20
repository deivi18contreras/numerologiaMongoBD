<template>
  <q-page class="templo-astral-page" :style="{ '--aura-primary': aura.color, '--aura-glow': aura.glow }">
    <!-- FONDO INMERSIVO: NEBULOSA LÍQUIDA DINÁMICA -->
    <div class="nebula-overlay transition-colors"
      :style="{ background: `radial-gradient(circle at 50% 50%, ${aura.bg} 0%, #02040a 100%)` }"></div>
    <div class="stars-fixed"></div>

    <Perfil ref="perfilRef" />
    <notificaciones ref="notifRef" />

    <!-- HEADER ULTRA WIDE -->
    <q-header class="glass-header" flat>
      <div class="row items-center justify-between no-wrap q-py-md q-px-xl window-width relative-position">

        <!-- IZQUIERDA: LOGO GIGANTE Y CERCANO AL MARGEN -->
        <div class="templo-logo cursor-pointer text-h4" @click="activeTab = 'dashboard'">
          <span class="aura-text transition-colors cinzel-font text-weight-bolder letter-spacing-5">ASTRA</span>
          <span class="text-white opacity-40 q-mx-sm">●</span>
          <span class="text-white cinzel-font text-weight-bolder letter-spacing-5">AI</span>
        </div>

        <!-- CENTRO ABSOLUTO: MENÚ PÍLDORA -->
        <div class="glass-pill-nav desktop-only absolute-center">
          <q-tabs v-model="activeTab" class="text-gold" active-color="amber-5" indicator-color="amber-5" align="center"
            narrow-indicator no-caps>
            <q-tab name="dashboard" icon="dashboard" label="Sintonía" />
            <q-tab name="oracle" icon="psychic" label="Oráculo" />
            <q-tab name="seals" icon="auto_awesome" label="Grimorio" />
            <q-tab name="vault" icon="history_edu" label="Archivo" />
            <q-tab name="payments" icon="workspace_premium" label="Ofrendas (Pagos)" />
          </q-tabs>
        </div>

        <!-- DERECHA: AURA, PERFIL Y NOTIFICACIONES -->
        <div class="row items-center q-gutter-md q-ml-auto z-top right-controls">
          
          <!-- SELECTOR DE AURA GLOBAL (RESTAURADO) -->
          <div class="aura-selector row items-center q-gutter-sm q-mr-md desktop-only">
             <div class="text-caption text-gold cinzel-font q-mr-sm">Tu Aura:</div>
             <q-btn round size="xs" class="aura-btn amber-aura" :class="{ 'active-aura': aura.name === 'Fuerza' }" @click="setAura('Fuerza')">
                <q-tooltip class="bg-black text-amber-5">Fuerza</q-tooltip>
             </q-btn>
             <q-btn round size="xs" class="aura-btn sapphire-aura" :class="{ 'active-aura': aura.name === 'Paz' }" @click="setAura('Paz')">
                <q-tooltip class="bg-black text-blue-4">Paz</q-tooltip>
             </q-btn>
             <q-btn round size="xs" class="aura-btn amethyst-aura" :class="{ 'active-aura': aura.name === 'Claridad' }" @click="setAura('Claridad')">
                <q-tooltip class="bg-black text-purple-4">Claridad</q-tooltip>
             </q-btn>
          </div>

          <q-btn flat round icon="notifications" @click="notifRef.openDrawer()" class="text-gold action-btn-hover" size="md">
            <!-- ALTO CONTRASTE: FONDO ROJO, TEXTO BLANCO -->
            <q-badge floating color="red-7" text-color="white" rounded v-if="authStore.unreadCount > 0" class="text-weight-bold">
              {{ authStore.unreadCount }}
            </q-badge>
          </q-btn>
          <q-avatar size="55px" class="avatar-glow cursor-pointer q-ml-sm" @click="perfilRef.openDrawer()">
            <img :src="user.avatar" />
          </q-avatar>
        </div>

      </div>
    </q-header>

    <q-page-container>
      <div class="container-max q-pb-xl">

        <!-- BIENVENIDA MÍSTICA -->
        <div class="row justify-center q-mb-xl text-center animate-fade-in" v-if="activeTab === 'dashboard'">
          <div class="col-12 relative-position">
            <div class="text-overline aura-text transition-colors q-mb-sm">PORTAL DE LA SABIDURÍA</div>
            <h1 class="text-h2 cinzel-font text-white q-ma-none">Bienvenido, <span
                class="aura-text transition-colors">{{ user.nombre }}</span></h1>
            <div class="aura-divider q-mx-auto q-mt-md transition-colors"></div>

            <!-- ORÁCULO FLASH (MANTRA ANIMADO) -->
            <div class="oracle-flash-container q-mt-lg">
              <p class="text-h6 text-italic text-grey-4 typewriter-text">"{{ mantraActual }}"</p>
            </div>

            <!-- El aura selector fue movido a la cabecera superior. -->

          </div>
        </div>

        <!-- PANELES DE VISTAS (Integrando todas en una sola) -->
        <q-tab-panels v-model="activeTab" animated class="transparent">
          <q-tab-panel name="dashboard" class="q-pa-none overflow-hidden">
            <UserDashboard />
          </q-tab-panel>
          <q-tab-panel name="oracle" class="q-pa-none overflow-hidden">
            <UserOracle />
          </q-tab-panel>
          <q-tab-panel name="seals" class="q-pa-none overflow-hidden">
            <UserSeals />
          </q-tab-panel>
          <q-tab-panel name="vault" class="q-pa-none overflow-hidden">
            <UserVault />
          </q-tab-panel>
          <q-tab-panel name="payments" class="q-pa-none overflow-hidden">
            <UserPayments />
          </q-tab-panel>
        </q-tab-panels>

      </div>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import Perfil from '../../components/perfil.vue'
import Notificaciones from '../../components/notificaciones.vue'
import { useAuthStore } from '../../store/Auth.js'

import UserDashboard from './UserDashboard.vue'
import UserOracle from './UserOracle.vue'
import UserPayments from './UserPayments.vue'
import UserSeals from './UserSeals.vue'
import UserVault from './UserVault.vue'

const authStore = useAuthStore()
const perfilRef = ref(null)
const notifRef = ref(null)

const activeTab = ref('dashboard')

const user = ref({
  nombre: authStore.usuario?.nombre || 'Buscador',
  avatar: authStore.usuario?.avatar || 'https://i.pravatar.cc/150?img=33'
})

// MÓDULO: ORÁCULO Y AURAS
const mantras = [
  "La tranquilidad ilumina tu sendero hacia la prosperidad infinita.",
  "Tus pensamientos tejen la realidad que caminas hoy.",
  "El cosmos conspira a favor de tu paz interior y evolución.",
  "Eres el arquitecto de tu destino y el guardián de tu energía."
]
const mantraActual = ref(mantras[0])

const auras = {
  Fuerza: { name: 'Fuerza', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', bg: '#1a103d' },
  Paz: { name: 'Paz', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', bg: '#0b162c' },
  Claridad: { name: 'Claridad', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', bg: '#170b24' }
}
const aura = ref(auras.Fuerza)

const setAura = (tipo) => {
  aura.value = auras[tipo]
  // Cambiar mantra con animación simple forzando el repintado de la máquina
  const index = Math.floor(Math.random() * mantras.length)
  mantraActual.value = mantras[index]
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');

.templo-astral-page {
  background: #02040a;
  color: #fff;
  font-family: 'Cinzel', serif;
  overflow-x: hidden;
}

.cinzel-font {
  font-family: 'Cinzel', serif;
}

.text-gold {
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.letter-spacing-5 {
  letter-spacing: 5px;
}

/* NEBULA BACKGROUND */
.nebula-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, #1a103d 0%, #02040a 100%);
  opacity: 0.8;
  z-index: 0;
}

.stars-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
  opacity: 0.2;
  z-index: 0;
}

.container-max {
  position: relative;
  z-index: 1;
  width: 96%;
  max-width: none;
  margin: 0 auto;
}

/* HEADER ULTRA WIDE GLASS */
.glass-header {
  background: rgba(2, 4, 10, 0.6);
  backdrop-filter: blur(25px) saturate(120%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.glass-pill-nav {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 50px;
  padding: 0 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(212, 175, 55, 0.05);
}

.desktop-only {
  display: none;
}

@media (min-width: 1024px) {
  .desktop-only {
    display: block;
  }
}

.avatar-glow {
  border: 2px solid var(--aura-primary);
  box-shadow: 0 0 15px var(--aura-glow);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.5s ease;
}

.avatar-glow:hover {
  transform: scale(1.1);
  box-shadow: 0 0 25px var(--aura-primary);
}

.action-btn-hover {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-btn-hover:hover {
  transform: scale(1.15) rotate(10deg);
  color: #fff !important;
}

/* NUEVOS EFECTOS DEL AURA */
.transition-colors {
  transition: all 0.5s ease-in-out;
}

.aura-text {
  color: var(--aura-primary);
  text-shadow: 0 0 15px var(--aura-glow);
}

.aura-divider {
  width: 150px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--aura-primary), transparent);
}

/* TYPEWRITER (ORÁCULO FLASH) */
.oracle-flash-container {
  min-height: 40px;
}

.typewriter-text {
  overflow: hidden;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: .15em;
  animation: typing 4s steps(50, end), blink-caret .75s step-end infinite;
  border-right: .15em solid var(--aura-primary);
  display: inline-block;
  max-width: fit-content;
}

@keyframes typing {
  from {
    width: 0
  }

  to {
    width: 100%
  }
}

@keyframes blink-caret {

  from,
  to {
    border-color: transparent
  }

  50% {
    border-color: var(--aura-primary);
  }
}

/* BOTONES SELECTOR AURA */
.aura-btn {
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  opacity: 0.7;
}

.aura-btn:hover {
  transform: scale(1.2);
  opacity: 1;
}

.active-aura {
  border-color: #fff;
  box-shadow: 0 0 15px var(--aura-primary);
  transform: scale(1.2);
  opacity: 1;
}

.amber-aura {
  background: linear-gradient(45deg, #fbbf24, #d97706);
}

.sapphire-aura {
  background: linear-gradient(45deg, #60a5fa, #2563eb);
}

.amethyst-aura {
  background: linear-gradient(45deg, #c084fc, #7e22ce);
}

.animate-fade-in {
  animation: fadeIn 1.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fix layout overrides for imported panels */
.q-tab-panels {
  background: transparent !important;
}

.q-tab-panel {
  padding: 0;
}
</style>