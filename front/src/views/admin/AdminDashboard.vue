<template>
  <div class="q-pa-md mystic-bg text-white" style="min-height: auto;">
    <!-- CABECERA -->
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-6 text-left">
        <h1 class="text-h3 text-amber-5 mystic-title q-ma-none">Oráculo de Datos</h1>
        <p class="text-deep-purple-3 q-mt-xs">Visión trascendental del ecosistema Astra AI 🌌</p>
      </div>
      <div class="col-12 col-md-auto q-gutter-sm flex items-center">
        <q-btn round color="amber-9" icon="refresh" @click="loadData">
          <q-tooltip>Sincronizar Cosmos</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- KPIs DINÁMICOS -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Ingresos -->
      <div class="col-12 col-sm-4">
        <q-card dark bordered class="mystic-card overflow-hidden">
          <div class="card-glow" style="background: rgba(251, 191, 36, 0.1)"></div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="text-overline text-amber-5 opacity-70">Energía Recolectada</div>
                <div class="text-h3 text-weight-bolder q-my-xs">{{ formatCurrency(totalMonto) }}</div>
                <div class="text-caption text-grey-5">Total histórico acumulado</div>
              </div>
              <q-icon name="auto_graph" size="56px" color="amber-9" class="opacity-20" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Usuarios -->
      <div class="col-12 col-sm-4">
        <q-card dark bordered class="mystic-card overflow-hidden">
          <div class="card-glow" style="background: rgba(139, 92, 246, 0.1)"></div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="text-overline text-amber-5 opacity-70">Almas Registradas</div>
                <div class="text-h3 text-weight-bolder q-my-xs">{{ totalUsuarios }}</div>
                <div class="text-caption text-grey-5">Buscadores en la base de datos</div>
              </div>
              <q-icon name="hub" size="56px" color="amber-9" class="opacity-20" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pagos del Mes -->
      <div class="col-12 col-sm-4">
        <q-card dark bordered class="mystic-card overflow-hidden">
          <div class="card-glow" style="background: rgba(34, 197, 94, 0.1)"></div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="text-overline text-amber-5 opacity-70">Suscripciones del Mes</div>
                <div class="text-h3 text-weight-bolder q-my-xs">{{ pagosMes }}</div>
                <div class="text-caption text-grey-5">Transacciones ciclo actual</div>
              </div>
              <q-icon name="payments" size="56px" color="amber-9" class="opacity-20" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-xl">
      <!-- GRÁFICO DE REGISTROS (DINÁMICO) -->
      <div class="col-12 col-lg-7">
        <q-card dark bordered class="mystic-card full-height">
          <q-card-section class="q-pa-lg">
            <div class="text-h5 text-amber-4 q-mb-xl mystic-title">Conexiones Celestiales (7 días)</div>
            <div class="chart-box">
              <div v-for="(day, i) in chartData" :key="i" class="bar-col">
                
                <div class="bar-value text-amber-3 text-weight-bolder" :class="{'opacity-0': day.count === 0}">
                  {{ day.count }}
                </div>
                
                <div class="bar-track">
                  <div class="bar-fill" :style="{ height: day.count === 0 ? '0%' : (day.count / maxRegistros * 100) + '%' }">
                    <div class="bar-glow"></div>
                  </div>
                  <q-tooltip class="bg-amber-9 text-black text-weight-bold" anchor="top middle" self="bottom middle">
                    {{ day.count }} almas conectaron el {{ day.label }}
                  </q-tooltip>
                </div>
                
                <div class="bar-label text-uppercase" :class="{'text-amber-4 text-weight-bolder': i === 6 }">
                  {{ day.label }}
                </div>

              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- DISTRIBUCIÓN DE ALMAS (REAL) -->
      <div class="col-12 col-lg-5">
        <q-card dark bordered class="mystic-card full-height flex column">
          <q-card-section class="q-pa-lg flex-grow-1">
            <div class="text-h5 text-amber-4 q-mb-lg mystic-title text-center">Balance Cósmico</div>
            
            <div class="row items-center justify-center q-mb-md">
              <!-- DONUT -->
              <div class="col-12 col-sm-6 flex justify-center">
                <div class="donut-container">
                  <svg viewBox="0 0 36 36" class="donut">
                    <circle class="donut-ring" cx="18" cy="18" r="15.915" fill="transparent" stroke="#2e1065" stroke-width="3"></circle>
                    <circle class="donut-segment" cx="18" cy="18" r="15.915" fill="transparent" stroke="#fbbf24" stroke-width="3" 
                      :stroke-dasharray="`${porcentajeActivos} ${100 - porcentajeActivos}`" stroke-dashoffset="25"></circle>
                  </svg>
                  <div class="donut-text text-center">
                    <div class="text-h4 text-weight-bolder">{{ porcentajeActivos }}%</div>
                    <div class="text-caption text-amber-5 text-weight-bold">ACTIVOS</div>
                  </div>
                </div>
              </div>
              
              <!-- ESTADÍSTICAS -->
              <div class="col-12 col-sm-6 q-mt-md q-sm-mt-none">
                <q-list dark padding class="mystic-list rounded-borders">
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar color="amber-9" text-color="black" icon="verified_user" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-4 text-weight-medium">Activos</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-h6 text-amber-5 text-weight-bolder">{{ activosCount }}</div>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar color="deep-purple-9" text-color="white" icon="hourglass_empty" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-4 text-weight-medium">Inactivos</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-h6 text-deep-purple-3 text-weight-bolder">{{ inactivosCount }}</div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <q-separator dark class="q-my-md opacity-20" />
            
            <div class="text-left">
              <div class="text-subtitle2 text-amber-5 q-mb-sm text-uppercase" style="letter-spacing: 1px;">Últimos Movimientos</div>
              <q-list dark padding dense class="mystic-list">
                <q-item v-for="pago in ultimosPagos" :key="pago._id" class="q-px-sm q-py-sm">
                  <q-item-section avatar style="min-width: 40px">
                    <q-avatar rounded color="white" text-color="black" size="md">
                       <q-icon name="bolt" color="amber-9" size="sm" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2 text-white text-weight-bold">{{ pago.usuarioId?.nombre || 'Buscador' }}</q-item-label>
                    <q-item-label caption class="text-deep-purple-3">Suscripción Pagada</q-item-label>
                  </q-item-section>
                  <q-item-section side class="items-end">
                    <q-item-label class="text-weight-bolder text-amber-4 text-body1">{{ formatCurrency(pago.monto) }}</q-item-label>
                    <q-item-label caption class="text-grey-5">{{ formatDateShort(pago.fecha) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData } from '../../services/services'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const pagos = ref([])
const usuarios = ref([])
const totalMonto = ref(0)
const totalUsuarios = ref(0)
const pagosMes = ref(0)

// LÓGICA DE DATOS REALES
async function loadData() {
  $q.loading.show({
    message: 'Consultando las estrellas...',
    backgroundColor: 'black',
    customClass: 'mystic-loading'
  })
  
  try {
    const [resPagos, resUsers] = await Promise.all([
      getData("pagos"),
      getData("usuario")
    ])

    pagos.value = resPagos
    // Filtramos a los administradores para no mezclarlos en los KPIs del negocio
    usuarios.value = resUsers.filter(u => !(u.rol && u.rol.toLowerCase() === 'admin'))
    totalUsuarios.value = usuarios.value.length
    
    totalMonto.value = resPagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
    
    const mesActual = new Date().getMonth()
    pagosMes.value = resPagos.filter(p => new Date(p.fecha).getMonth() === mesActual).length

    $q.notify({
      message: 'Cosmos sincronizado',
      color: 'amber-9',
      icon: 'auto_awesome',
      position: 'top-right',
      timeout: 1500
    })

  } catch (error) {
    console.log("Error cargando Dashboard:", error)
    $q.notify({ message: 'Error al conectar con el Oráculo', color: 'negative' })
  } finally {
    $q.loading.hide()
  }
}

// CÁLCULOS DINÁMICOS
const chartData = computed(() => {
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7Days.push({
      date: d.toLocaleDateString(),
      label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      count: 0
    })
  }

  usuarios.value.forEach(u => {
    const uDate = new Date(u.createdAt).toLocaleDateString()
    const day = last7Days.find(d => d.date === uDate)
    if (day) day.count++
  })
  return last7Days
})

const maxRegistros = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return 1
  const max = Math.max(...chartData.value.map(d => d.count))
  return max > 0 ? max : 1
})

const activosCount = computed(() => usuarios.value.filter(u => u.estado === 1 || u.estado === '1').length)
const inactivosCount = computed(() => usuarios.value.filter(u => u.estado !== 1).length)
const porcentajeActivos = computed(() => {
  if (totalUsuarios.value === 0) return 0
  return Math.round((activosCount.value / totalUsuarios.value) * 100)
})

const ultimosPagos = computed(() => {
  return [...pagos.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 4)
})

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatCurrency(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor || 0)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.mystic-bg {
  background: radial-gradient(circle at top center, #1e1b4b 0%, #0a0a0c 100%);
}

.mystic-title {
  font-family: 'Cinzel', serif;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  letter-spacing: 1px;
}

.mystic-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(251, 191, 36, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  position: relative;
}

.card-glow {
  position: absolute;
  top: 0; right: 0; width: 100px; height: 100px;
  filter: blur(50px);
  border-radius: 50%;
  pointer-events: none;
}

/* GRÁFICO DE CÁPSULAS (PILLAR) */
.chart-box {
  height: 220px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 10px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-value {
  font-size: 14px;
  margin-bottom: 10px;
  transition: opacity 0.3s ease;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.bar-track {
  width: 36px;
  height: 140px;
  background: rgba(139, 92, 246, 0.05); /* Efecto vidrio vacío */
  border-radius: 18px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: flex-end;
  position: relative;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.bar-track:hover {
  transform: translateY(-5px);
  border-color: rgba(251, 191, 36, 0.5);
}

.bar-fill {
  width: 100%;
  background: linear-gradient(to top, #4c1d95, #fbbf24);
  border-radius: 18px;
  transition: height 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  box-shadow: 0 -5px 15px rgba(251, 191, 36, 0.3);
}

.bar-glow {
  position: absolute;
  top: 0; left: 0; right: 0; height: 10px;
  background: rgba(255, 255, 255, 0.4);
  filter: blur(2px);
  border-radius: 18px 18px 0 0;
}

.bar-label {
  margin-top: 15px;
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  letter-spacing: 1px;
}
.opacity-0 { opacity: 0 !important; }

/* DONUT CHART */
.donut-container {
  position: relative;
  width: 180px;
  height: 180px;
}

.donut-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

.donut-segment {
  transition: stroke-dasharray 1s ease;
}

.opacity-20 { opacity: 0.2; }
.opacity-10 { opacity: 0.1; }
.opacity-70 { opacity: 0.7; }
</style>