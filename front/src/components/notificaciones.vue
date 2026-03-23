<template>
  <q-dialog v-model="drawer" position="top" transition-show="slide-down" transition-hide="slide-up">
    <q-card class="glass-profile text-white no-scroll" style="width: 100%; max-width: 600px; border-radius: 0 0 32px 32px;">
      <q-card-section class="q-pa-lg">
        <!-- BOTÓN CERRAR -->
        <div class="row justify-end q-mb-md">
          <q-btn flat round icon="close" color="grey-5" @click="drawer = false" />
        </div>

        <!-- HEADER DE NOTIFICACIONES -->
        <div class="row items-center q-mb-lg">
          <div class="col-auto q-mr-md">
            <q-icon name="notifications_active" color="amber-5" size="44px" class="text-glow-amber" />
          </div>
          <div class="col">
            <div class="text-h4 text-weight-bold text-gradient cinzel-font">
              Alertas del Sistema
            </div>
            <div class="text-caption text-grey-5 letter-spacing-2">
              Sincronía de la plataforma en tiempo real
            </div>
          </div>
        </div>

        <!-- FILTROS -->
        <div class="row q-gutter-sm q-mb-md">
          <q-btn 
            dense 
            flat 
            :class="filtro === 'ALL' ? 'text-amber-5 text-weight-bolder' : 'text-grey-5'" 
            label="Todas" 
            @click="filtro = 'ALL'" 
          />
          <q-btn 
            dense 
            flat 
            :class="filtro === 'UNREAD' ? 'text-amber-5 text-weight-bolder' : 'text-grey-5'" 
            label="Nuevas" 
            @click="filtro = 'UNREAD'" 
          />
        </div>

        <!-- LISTA DE NOTIFICACIONES -->
        <div class="notif-scroll-area">
          <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner-orbit color="amber-5" size="50px" />
          </div>

          <div v-else-if="notificacionesFiltradas.length === 0" class="text-center q-pa-xl text-grey-5">
            <q-icon name="bedtime" size="50px" class="q-mb-md opacity-20" />
            <div class="cinzel-font text-h6">No hay alertas pendientes</div>
          </div>

          <div v-for="notif in notificacionesFiltradas" :key="notif._id" class="notif-item q-pa-md q-mb-sm" :class="{ 'unread-bg': !notif.leida }">
            <div class="row items-center q-mb-xs">
              <q-icon 
                :name="notif.tipo === 'pago' ? 'monetization_on' : 'system_update'" 
                :color="notif.tipo === 'pago' ? 'green-4' : 'amber-5'" 
                size="20px" 
                class="q-mr-sm"
              />
              <div class="text-caption text-uppercase text-weight-bold" :class="notif.tipo === 'pago' ? 'text-green-4' : 'text-amber-5'">
                {{ notif.tipo }}
              </div>
            </div>
            
            <div class="row justify-between items-start">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-white">{{ notif.titulo }}</div>
                <div class="text-caption text-grey-5">{{ formatTime(notif.fecha) }}</div>
              </div>
              <q-btn v-if="!notif.leida" flat round dense icon="done" color="amber-5" size="sm" @click="marcarLeida(notif._id)" />
            </div>
            <div class="text-body2 text-grey-4 q-mt-xs">{{ notif.mensaje }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getData, putData } from '../services/services.js'
import { useAuthStore } from '../store/Auth.js'

const drawer = ref(false)
const notificaciones = ref([])
const loading = ref(false)
const filtro = ref('ALL')
const authStore = useAuthStore()

const notificacionesFiltradas = computed(() => {
  if (filtro.value === 'ALL') return notificaciones.value
  return notificaciones.value.filter(n => !n.leida)
})

const fetchNotificaciones = async () => {
  loading.value = true
  try {
    const res = await getData('notificaciones')
    if (res.ok) {
      notificaciones.value = res.notificaciones
      authStore.unreadCount = notificaciones.value.filter(n => !n.leida).length
    }
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const marcarLeida = async (id) => {
  try {
    await putData(`notificaciones/${id}`)
    const index = notificaciones.value.findIndex(n => n._id === id)
    if (index !== -1) {
      notificaciones.value[index].leida = true
      authStore.unreadCount = notificaciones.value.filter(n => !n.leida).length
    }
  } catch (error) { console.error(error) }
}

const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' | ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

defineExpose({ openDrawer: () => { drawer.value = true; fetchNotificaciones() } })
</script>

<style scoped>
.glass-profile {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.cinzel-font { font-family: 'Cinzel', serif; }

.text-gradient {
  background: linear-gradient(to right, #fff, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.notif-scroll-area {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 5px;
}

.notif-scroll-area::-webkit-scrollbar { width: 4px; }
.notif-scroll-area::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.3); border-radius: 10px; }

.notif-item {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.unread-bg {
  background: rgba(251, 191, 36, 0.05);
  border-color: rgba(251, 191, 36, 0.2);
}

.text-glow-amber { filter: drop-shadow(0 0 5px #fbbf24); }

.letter-spacing-2 { letter-spacing: 2px; }
</style>