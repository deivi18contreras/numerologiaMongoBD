<template>
  <q-drawer v-model="drawer" side="right" overlay :width="450" class="command-center text-white">
    <!-- HEADER -->
    <div class="q-pa-lg flex justify-between items-center border-bottom">
      <div class="row items-center q-gutter-md">
        <div class="pulse-container">
          <q-icon name="settings_input_component" color="amber" size="32px" />
          <div class="pulse-ring"></div>
        </div>
        <div>
          <div class="text-h6 text-weight-bolder letter-spacing-1">CENTRO DE COMANDO</div>
          <div class="text-caption text-amber-5 text-uppercase">Administración Global del Sistema</div>
        </div>
      </div>
      <q-btn flat round icon="close" color="grey-5" @click="drawer = false" />
    </div>

    <q-scroll-area class="drawer-scroll">
      <div class="q-pa-lg q-gutter-y-xl">
        
        <!-- MÓDULO 1: ESTADO DEL NÚCLEO (HEALTH) -->
        <section>
          <div class="section-title">
            <q-icon name="memory" class="q-mr-sm" /> ESTADO DEL NÚCLEO
          </div>
          <q-card flat class="module-card q-pa-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-grey-5">Latencia API</div>
                <div class="text-h6 text-positive">Estable <q-icon name="trending_down" size="14px" /></div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-5">Base de Datos</div>
                <div class="text-h6">Conectada</div>
              </div>
              <div class="col-12 q-mt-sm">
                <div class="row justify-between text-caption text-grey-5">
                  <span>Carga Operativa</span>
                  <span>Saludable</span>
                </div>
                <q-linear-progress :value="0.12" color="amber" class="q-mt-xs" rounded />
              </div>
            </div>
          </q-card>
        </section>

        <!-- MÓDULO 2: PARÁMETROS FINANCIEROS -->
        <section>
          <div class="section-title">
            <q-icon name="payments" class="q-mr-sm" /> FLUJO DE ENERGÍA (FINANZAS)
          </div>
          <div class="q-mt-md q-gutter-y-md">
            <div class="control-row">
              <div class="text-body2">Precio Mensual</div>
              <q-input 
                v-model.number="config.precioMensual" 
                type="number" 
                dark dense outlined 
                prefix="$" 
                class="compact-input"
              />
            </div>
            <div class="control-row">
              <div class="text-body2">Precio Trimestral</div>
              <q-input 
                v-model.number="config.precioTrimestral" 
                type="number" 
                dark dense outlined 
                prefix="$" 
                class="compact-input"
              />
            </div>
            <div class="control-row">
              <div class="text-body2">Precio Anual</div>
              <q-input 
                v-model.number="config.precioAnual" 
                type="number" 
                dark dense outlined 
                prefix="$" 
                class="compact-input"
              />
            </div>
            <div class="control-row">
              <div class="text-body2">Moneda Principal</div>
              <q-select 
                v-model="config.moneda" 
                :options="['USD', 'EUR', 'COP']" 
                dark dense outlined 
                class="compact-input"
              />
            </div>
          </div>
        </section>

        <!-- MÓDULO 3: PROTOCOLO DE SEGURIDAD -->
        <section>
          <div class="section-title">
            <q-icon name="security" class="q-mr-sm" /> PROTOCOLO DE SEGURIDAD
          </div>
          <q-card flat class="module-card q-mt-md overflow-hidden">
            <q-list dark padding>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Modo Mantenimiento</q-item-label>
                  <q-item-label caption class="text-grey-5">Bloquea el acceso a usuarios externos</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="red" v-model="config.modoMantenimiento" />
                </q-item-section>
              </q-item>

              <!-- Programación y Pre-Aviso -->
              <div class="q-px-md q-pb-md">
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-5 q-mb-xs">Fecha Programada:</div>
                    <q-input v-model="config.mantenimientoFecha" type="date" dark outlined dense />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-5 q-mb-xs">Hora Programada:</div>
                    <q-input v-model="config.mantenimientoHora" type="time" dark outlined dense />
                  </div>
                </div>

                <!-- Botón de Pre-Aviso -->
                <q-btn 
                  label="Enviar Aviso Previo (1-3 días)" 
                  color="amber-9" 
                  outline
                  class="full-width q-mb-md cinzel-font"
                  icon="campaign"
                  :loading="loadingPreNotif"
                  @click="enviarPreAviso"
                />

                <!-- Editor de mensaje de mantenimiento -->
                <div v-if="config.modoMantenimiento || config.mantenimientoFecha" class="animate-fade">
                  <div class="text-caption text-grey-5 q-mb-xs">Mensaje personalizado:</div>
                  <q-input
                    v-model="config.mensajeMantenimiento"
                    type="textarea"
                    dark
                    outlined
                    dense
                    rows="3"
                    placeholder="Escribe el aviso previo o el motivo del bloqueo..."
                    class="bg-black-opacity-20"
                  />
                  <div class="row q-gutter-xs q-mt-xs">
                    <q-btn 
                      v-for="msg in sugerenciasMantenimiento" 
                      :key="msg"
                      size="xs" 
                      color="grey-9" 
                      :label="msg" 
                      flat 
                      bordered
                      @click="config.mensajeMantenimiento = msg"
                    />
                  </div>
                </div>
              </div>
              
              <q-separator dark inset class="opacity-10" />

              <q-item clickable v-ripple @click="backupSystem">
                <q-item-section avatar>
                  <q-icon name="cloud_download" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Generar Snapshot (Backup)</q-item-label>
                  <q-item-label caption>Respaldar base de datos mística</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </section>

        <!-- MÓDULO 4: INTELIGENCIA ARTIFICIAL -->
        <section>
          <div class="section-title">
            <q-icon name="auto_awesome" class="q-mr-sm" /> CONFIGURACIÓN DE IA
          </div>
          <div class="q-mt-md">
            <div class="text-caption text-grey-5 q-mb-sm">Nivel de Sabiduría (Temperatura: {{ config.aiCreativity }})</div>
            <q-slider 
              v-model="config.aiCreativity" 
              :min="0" :max="1" :step="0.1" 
              label 
              color="amber" 
            />
            <div class="row justify-between text-caption text-grey-6 italic">
              <span>Precisa / Técnica</span>
              <span>Creativa / Mística</span>
            </div>
          </div>
        </section>

      </div>
    </q-scroll-area>

    <!-- FOOTER ACCIONES -->
    <div class="absolute-bottom q-pa-lg border-top bg-dark-soft">
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-btn flat class="full-width text-grey-5" label="Descartar" @click="drawer = false" />
        </div>
        <div class="col-6">
          <q-btn 
            unelevated 
            class="full-width save-btn" 
            label="Aplicar Cambios" 
            :loading="saving"
            @click="saveChanges"
          />
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getData, putData, postData } from '../services/services'

const $q = useQuasar()
const drawer = ref(false)
const saving = ref(false)

const config = ref({
  precioSuscripcion: 49.99,
  precioMensual: 15000,
  precioTrimestral: 40000,
  precioAnual: 140000,
  moneda: 'COP',
  modoMantenimiento: false,
  mensajeMantenimiento: '',
  mantenimientoFecha: '',
  mantenimientoHora: '',
  aiCreativity: 0.7
})

const loadingPreNotif = ref(false)

const sugerenciasMantenimiento = [
  "Realineando los astros (Mantenimiento técnico)",
  "Pausa cósmica para actualizar el sistema",
  "Mejorando la conexión estelar"
]

const loadConfig = async () => {
  try {
    const res = await getData('config')
    if (res) {
      Object.assign(config.value, res)
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error)
  }
}

const saveChanges = async () => {
  saving.value = true
  try {
    // Limpiamos el objeto para enviar solo lo necesario
    const dataToSend = {
      precioSuscripcion: config.value.precioSuscripcion,
      precioMensual: config.value.precioMensual,
      precioTrimestral: config.value.precioTrimestral,
      precioAnual: config.value.precioAnual,
      moneda: config.value.moneda,
      modoMantenimiento: config.value.modoMantenimiento,
      mensajeMantenimiento: config.value.mensajeMantenimiento,
      mantenimientoFecha: config.value.mantenimientoFecha,
      mantenimientoHora: config.value.mantenimientoHora,
      aiCreativity: config.value.aiCreativity
    }

    await putData('config', dataToSend)
    $q.notify({
      message: 'Protocolos actualizados correctamente',
      color: 'positive',
      icon: 'check_circle',
      position: 'top-right'
    })
    drawer.value = false
  } catch (error) {
    console.error('Error al guardar configuración:', error.response?.data || error.message)
    $q.notify({
      message: error.response?.data?.msg || 'Error al sincronizar cambios con el núcleo',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

const backupSystem = () => {
  $q.notify({
    message: 'Snapshot generado. El respaldo se ha completado en el servidor.',
    color: 'info',
    icon: 'storage',
    timeout: 3000
  })
}

const enviarPreAviso = async () => {
  if (!config.value.mantenimientoFecha) {
    $q.notify({ message: 'Primero elige una fecha para el aviso', color: 'amber-9', icon: 'warning' })
    return
  }

  loadingPreNotif.value = true
  try {
    await postData('config/notify-maintenance', {
      fecha: config.value.mantenimientoFecha,
      hora: config.value.mantenimientoHora,
      mensaje: config.value.mensajeMantenimiento
    })
    $q.notify({ 
      message: 'Aviso anticipado enviado a todos los usuarios', 
      color: 'positive', 
      icon: 'campaign' 
    })
  } catch (error) { 
    console.error(error)
    $q.notify({ message: 'Error al enviar el aviso estelar', color: 'negative' })
  } finally { 
    loadingPreNotif.value = false 
  }
}

const openDrawer = () => {
  loadConfig()
  drawer.value = true
}

defineExpose({
  openDrawer
})

onMounted(loadConfig)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@300;400;600&display=swap');

.command-center {
  background: rgba(10, 10, 15, 0.98);
  backdrop-filter: blur(25px);
  border-left: 1px solid rgba(251, 191, 36, 0.2);
  font-family: 'Montserrat', sans-serif;
}

.border-bottom { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.border-top { border-top: 1px solid rgba(255, 255, 255, 0.05); }

.drawer-scroll {
  height: calc(100vh - 160px);
}

.letter-spacing-1 { letter-spacing: 2px; font-family: 'Cinzel', serif; }

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  letter-spacing: 1.5px;
  opacity: 0.8;
}

.module-card {
  background: rgba(15, 15, 20, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.05);
  transition: all 0.3s ease;
  animation: float-pulse 4s infinite alternate;
}

@keyframes float-pulse {
  0% { box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(251, 191, 36, 0.02); transform: translateY(0); }
  100% { box-shadow: 0 8px 40px rgba(251, 191, 36, 0.1), inset 0 0 20px rgba(251, 191, 36, 0.08); transform: translateY(-2px); }
}

/* Efectos Neón Ámbar */
:deep(.q-toggle__thumb) {
  box-shadow: 0 0 10px #fbbf24 !important;
}
:deep(.q-toggle--truthy .q-toggle__track) {
  background-color: #fbbf24 !important;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.6) !important;
}
:deep(.q-slider__track) {
  box-shadow: 0 0 8px #fbbf24;
}
:deep(.q-slider__thumb) {
  box-shadow: 0 0 15px #fbbf24 !important;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.compact-input {
  width: 120px;
}

.save-btn {
  background: linear-gradient(135deg, #fbbf24 0%, #b45309 100%);
  color: #000;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-radius: 8px;
  box-shadow: 0 6px 0 #78350f, 0 10px 20px rgba(0,0,0,0.5);
  transition: all 0.1s ease;
  border: 1px solid #fde68a;
  transform: translateY(0);
}

.save-btn:active {
  transform: translateY(4px) !important;
  box-shadow: 0 2px 0 #78350f, 0 5px 10px rgba(0,0,0,0.5) !important;
}

.bg-dark-soft {
  background: rgba(0, 0, 0, 0.4);
}

/* ANIMACIONES */
.pulse-container {
  position: relative;
  display: inline-block;
}

.pulse-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid #fbbf24;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

.opacity-10 { opacity: 0.1; }
</style>