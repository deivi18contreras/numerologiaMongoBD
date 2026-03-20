<template>
  <q-dialog v-model="drawer" position="top" transition-show="slide-down" transition-hide="slide-up">
    <q-card class="glass-profile text-white no-scroll" style="width: 100%; max-width: 600px; border-radius: 0 0 32px 32px;">
      <q-card-section class="q-pa-lg">
        <!-- BOTÓN CERRAR -->
        <div class="row justify-end q-mb-md">
          <q-btn flat round icon="close" color="grey-5" @click="drawer = false" />
        </div>

        <div class="row q-col-gutter-lg items-center">
          <div class="col-12 col-sm-4 text-center">
            <div class="profile-avatar-container">
              <div class="halo-ring halo-ring-1"></div>
              <div class="halo-ring halo-ring-2"></div>
              <q-avatar size="120px" class="profile-avatar shadow-20">
                <img :src="authStore.usuario?.avatar || 'https://i.pravatar.cc/300?img=12'" />
              </q-avatar>
              <div class="status-badge" :class="isPremium ? 'active' : 'inactive'"></div>
            </div>
          </div>

          <div class="col-12 col-sm-8">
            
            <!-- MODO LECTURA -->
            <div v-if="!isEditing" class="row items-center q-mb-xs">
              <div class="text-h4 text-weight-bold text-gradient q-mr-sm">
                {{ authStore.usuario?.nombre }}
              </div>
              <q-btn round flat size="sm" color="amber-5" icon="edit" @click="startEditing" />
            </div>
            <!-- MODO EDICIÓN -->
            <div v-else class="row items-center q-mb-xs no-wrap">
              <q-input v-model="editName" dark dense outlined color="amber-5" class="full-width q-mr-sm" />
              <q-btn round dense color="positive" icon="check" :loading="loadingEdit" @click="saveName" class="q-mr-sm" />
              <q-btn round dense flat color="negative" icon="close" @click="isEditing = false" />
            </div>

            <div class="text-caption text-grey-5 letter-spacing-2 q-mb-sm">
              {{ authStore.usuario?.email }}
            </div>
            
            <div class="q-mb-md">
              <q-badge v-if="authStore.rol === 'admin'" color="amber-9" text-color="black" class="text-weight-bolder letter-spacing-1 q-pa-xs">
                <q-icon name="stars" size="sm" class="q-mr-xs" /> ARQUITECTO CÓSMICO (Admin)
              </q-badge>
              <q-badge v-else color="deep-purple-9" text-color="white" class="text-weight-bolder letter-spacing-1 q-pa-xs">
                <q-icon name="person_outline" size="sm" class="q-mr-xs" /> BUSCADOR (Cliente)
              </q-badge>
            </div>

            <!-- ESTADO DE SUSCRIPCIÓN -->
            <div class="subscription-status-box q-pa-md" :class="{ 'is-premium': isPremium }">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-weight-bolder">{{ isPremium ? 'PLAN PREMIUM ACTIVO' : 'PLAN NEÓFITO (GRATIS)' }}</span>
                <q-icon :name="isPremium ? 'workspace_premium' : 'lock'" :color="isPremium ? 'amber-5' : 'grey-5'" />
              </div>
              <div v-if="isPremium" class="text-caption text-amber-2">
                Tu luz se mantendrá encendida hasta: <span class="text-weight-bold">{{ expirationDate }}</span>
              </div>
              <div v-else class="text-caption text-grey-4">
                Mejora tu plan para acceder al oráculo completo.
              </div>
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-lg">
          <div class="col-6">
            <q-btn outline class="full-width btn-neon-amber text-weight-bold" @click="iniciarRecuperacionPassword">
              <q-icon name="lock_reset" class="q-mr-sm" />
              Seguridad
            </q-btn>
          </div>
          <div class="col-6">
            <q-btn flat class="full-width btn-neon-red text-weight-bold" @click="logout">
              <q-icon name="power_settings_new" class="q-mr-sm" />
              Salir
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/Auth.js'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { postData, putData } from '../services/services.js'

const drawer = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const isEditing = ref(false)
const editName = ref('')
const loadingEdit = ref(false)

const isPremium = computed(() => authStore.usuario?.estado === 1 || authStore.rol === 'admin')

const expirationDate = computed(() => {
  if (authStore.rol === 'admin') return 'Eternidad (Admin)'
  const expiry = authStore.usuario?.suscripcionExpira
  if (!expiry) return 'Próxima renovación'
  return new Date(expiry).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
})

const iniciarRecuperacionPassword = async () => {
  $q.loading.show({ message: 'Enviando código de seguridad...' })
  try {
    const email = authStore.usuario.email;
    await postData("usuario/forgot-password", { email });
    $q.notify({ color: 'positive', message: 'Código enviado al correo', icon: 'send' })
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al solicitar recuperación' })
  } finally { $q.loading.hide() }
}

const startEditing = () => {
  editName.value = authStore.usuario?.nombre
  isEditing.value = true
}

const saveName = async () => {
  if (!editName.value.trim() || editName.value === authStore.usuario?.nombre) {
    isEditing.value = false
    return
  }
  loadingEdit.value = true
  try {
    const payload = { nombre: editName.value.trim() }
    await putData(`usuario/${authStore.usuario._id}`, payload)
    authStore.usuario.nombre = editName.value.trim()
    isEditing.value = false
    $q.notify({ color: 'positive', message: 'Nombre actualizado con éxito', position: 'top' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Error al actualizar el perfil', position: 'top' })
  } finally {
    loadingEdit.value = false
  }
}

const logout = () => {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que quieres finalizar tu viaje cósmico?',
    dark: true,
    cancel: true
  }).onOk(() => {
    authStore.token = ''
    authStore.usuario = null
    authStore.rol = ''
    router.push('/')
  })
}

defineExpose({ openDrawer: () => drawer.value = true })
</script>

<style scoped>
.glass-profile {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

/* CSS PARA HALO DE ENERGÍA */
.profile-avatar-container { 
  position: relative; 
  display: inline-flex; 
  justify-content: center;
  align-items: center;
  padding: 15px; 
}

.profile-avatar { 
  background: #1d1429; 
  padding: 4px; 
  border: 4px solid transparent; /* Quitamos borde chato, lo hace transparente */
  position: relative;
  z-index: 2;
}

.halo-ring {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  pointer-events: none;
}
.halo-ring-1 {
  border: 2px solid rgba(251, 191, 36, 0.8);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.6), inset 0 0 15px rgba(251, 191, 36, 0.6);
  animation: pulse-halo 4s infinite alternate;
  z-index: 1;
}
.halo-ring-2 {
  border: 2px dashed rgba(167, 139, 250, 0.8);
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
  animation: spin-halo 20s linear infinite;
  z-index: 1;
  width: 105%; height: 105%;
  top: -2.5%; left: -2.5%;
}

@keyframes pulse-halo {
  0% { transform: scale(0.95); opacity: 0.6; }
  100% { transform: scale(1.05); opacity: 1; }
}
@keyframes spin-halo {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-badge {
  position: absolute; bottom: 18px; right: 18px; width: 22px; height: 22px;
  border-radius: 50%; border: 4px solid #0f172a; z-index: 3;
}
.status-badge.active { background: #4caf50; box-shadow: 0 0 12px #4caf50; }
.status-badge.inactive { background: #f44336; }

.text-gradient {
  background: linear-gradient(to right, #fff, #fbbf24);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.subscription-status-box {
  background: rgba(255,255,255,0.05); border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}
.subscription-status-box.is-premium {
  background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3);
}

/* BOTONES NEON PREMIUM */
.btn-neon-amber {
  color: #fbbf24 !important;
  border-color: rgba(251, 191, 36, 0.5) !important;
  background: rgba(251, 191, 36, 0.05) !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}
.btn-neon-amber:hover {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.15) !important;
}

.btn-neon-red {
  color: #fca5a5 !important;
  background: rgba(153, 27, 27, 0.3) !important;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}
.btn-neon-red:hover {
  background: rgba(220, 38, 38, 0.5) !important;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
  color: white !important;
}
</style>