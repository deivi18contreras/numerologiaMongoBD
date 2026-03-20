<template>
  <q-drawer v-model="drawer" side="right" overlay :width="420" class="glass-panel text-white">
    <div class="notif-header">
      <div class="row items-center q-gutter-sm">
        <q-icon name="notifications_active" color="primary" size="28px" />
        <div class="text-h6 text-weight-bold">Alertas del Sistema</div>
      </div>
      <q-btn flat round dense icon="close" color="grey-5" @click="drawer = false" />
    </div>

    <div class="notif-filters">
      <q-btn :unelevated="filtro === 'ALL'" :flat="filtro !== 'ALL'" label="TODAS" color="primary" size="sm" rounded @click="filtro = 'ALL'" />
      <q-btn :unelevated="filtro === 'UNREAD'" :flat="filtro !== 'UNREAD'" label="NO LEÍDAS" color="primary" size="sm" rounded @click="filtro = 'UNREAD'" />
    </div>

    <div class="notif-content">
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
      <div v-else-if="notificacionesFiltradas.length === 0" class="text-center q-pa-xl text-grey-5">
        <q-icon name="bedtime" size="60px" class="q-mb-md opacity-20" />
        <div>No hay alertas pendientes.</div>
      </div>

      <div v-for="notif in notificacionesFiltradas" :key="notif._id" class="notif-card" :class="{ 'opacity-80': notif.leida }">
        <div class="row justify-between items-start">
          <div class="row items-center q-gutter-sm">
            <div class="icon-box" :class="notif.tipo">
              <q-icon :name="notif.tipo === 'pago' ? 'monetization_on' : 'system_update'" />
            </div>
            <div>
              <div class="notif-tag">{{ notif.tipo }}</div>
              <div class="notif-title">{{ notif.titulo }}</div>
            </div>
          </div>
          <div v-if="!notif.leida" class="glow-dot"></div>
        </div>
        <div class="notif-text">{{ notif.mensaje }}</div>
        <div v-if="!notif.leida" class="row q-mt-sm">
          <q-btn size="sm" color="primary" label="Marcar como leída" unelevated @click="marcarLeida(notif._id)" />
        </div>
      </div>
    </div>
  </q-drawer>
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

defineExpose({ openDrawer: () => { drawer.value = true; fetchNotificaciones() } })
</script>

<style scoped>
.glass-panel { background: rgba(25, 16, 34, 0.95); backdrop-filter: blur(14px); border-left: 1px solid rgba(255, 255, 255, 0.1); }
.notif-header, .notif-filters { padding: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.notif-content { padding: 15px; overflow-y: auto; }
.notif-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px; border-radius: 12px; margin-bottom: 10px; }
.notif-title { font-weight: bold; }
.notif-tag { font-size: 10px; text-transform: uppercase; color: #8c2bee; }
.notif-text { font-size: 13px; color: #ccc; margin-top: 5px; }
.glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #4cc9f0; box-shadow: 0 0 8px #4cc9f0; }
.icon-box { width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(140, 43, 238, 0.1); color: #8c2bee; }
</style>