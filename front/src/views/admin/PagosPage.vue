<template>
  <div class="mystic-pro-bg text-white q-pa-md" style="min-height: auto;">
    <!-- PANEL DE INTELIGENCIA FINANCIERA (SUPERIOR) -->
    <div class="row q-col-gutter-md q-mb-md items-stretch">
      <!-- 1. MÉTRICAS PRINCIPALES -->
      <div class="col-12 col-md-4">
        <q-card class="stat-card-pro full-height column justify-between relative-position overflow-hidden" flat bordered>
          <q-icon name="auto_awesome" class="absolute-bottom-right" style="font-size: 180px; color: rgba(245, 158, 11, 0.05); transform: translate(15%, 20%); z-index: 0;" />
          
          <q-card-section class="q-pa-lg" style="z-index: 1;">
            <div class="text-overline text-amber-5 q-mb-sm" style="font-size: 14px;">Energía Total Acumulada</div>
            <div class="text-h2 text-weight-bolder text-amber-1" style="text-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
              {{ formatCurrency(totalIngresos) }}
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-lg" style="z-index: 1;">
            <q-separator dark class="q-mb-md opacity-20" />
            <div class="row q-col-gutter-lg">
              <div class="col-6">
                <div class="text-overline text-grey-5 q-mb-xs">En Riesgo (3 días)</div>
                <div class="text-h5 text-orange-5 flex items-center text-weight-bold">
                  <q-icon name="warning_amber" class="q-mr-sm" size="sm"/> {{ suscripcionesVenciendo }} Almas
                </div>
              </div>
              <div class="col-6">
                <div class="text-overline text-grey-5 q-mb-xs">Ticket Promedio</div>
                <div class="text-h5 text-amber-2 flex items-center text-weight-bold">
                  <q-icon name="local_activity" class="q-mr-sm" size="sm"/> {{ formatCurrency(totalIngresos / (pagos.length || 1)) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 2. MAPA DE CALOR REAL (Flujo de Energía) -->
      <div class="col-12 col-md-5">
        <q-card class="stat-card-pro full-height" flat bordered>
          <q-card-section>
            <div class="text-overline text-amber-5 q-mb-sm">Ritmo del Cosmos (Flujo 30 días)</div>
            <div class="heatmap-grid q-mt-md">
              <div v-for="(day, index) in heatmapData" :key="index" class="heat-square" :style="{ background: day.color }">
                <q-tooltip class="bg-amber-10 text-black text-subtitle2 shadow-4 q-pa-sm" transition-show="scale" transition-hide="scale" anchor="top middle" self="bottom middle">
                  <div class="text-weight-bold row items-center"><q-icon name="event" class="q-mr-xs"/> Día: {{ day.date }}</div>
                  <div class="row items-center"><q-icon name="payments" class="q-mr-xs"/> Ingresos: {{ formatCurrency(day.amount) }}</div>
                  <div class="row items-center"><q-icon name="group" class="q-mr-xs"/> Ofrendas: {{ day.count }}</div>
                </q-tooltip>
              </div>
            </div>
            <div class="row justify-between text-grey-6 q-mt-md q-pt-sm border-top-mystic text-caption" style="font-size: 11px">
              <span>◄ Hace 30 lunas</span>
              <span>Hoy ►</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 3. DISTRIBUCIÓN POR MÉTODOS REAL -->
      <div class="col-12 col-md-3">
        <q-card class="stat-card-pro full-height" flat bordered>
          <q-card-section>
            <div class="text-overline text-amber-5 q-mb-md">Fuentes de Energía (Real)</div>
            <div class="column q-gutter-y-md">
               <div v-for="method in realPaymentMethods" :key="method.name" class="energy-source q-pa-sm rounded-borders transition-hover">
                  <div class="row justify-between items-center q-mb-sm">
                     <div class="flex items-center">
                        <q-icon :name="method.icon" :color="method.color" size="20px" class="q-mr-sm"/> 
                        <span class="text-body2 text-weight-medium text-white">{{ method.label }}</span>
                     </div>
                     <span class="text-subtitle2 text-weight-bolder" :class="`text-${method.color}`">{{ method.percent }}%</span>
                  </div>
                  <q-linear-progress :value="method.percent / 100" :color="method.color.split('-')[0]" track-color="grey-10" rounded class="source-bar-pro" />
               </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- BARRA DE ACCIONES -->
    <q-card class="mystic-toolbar q-mb-md" flat bordered>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input v-model="emailBuscar" dark outlined dense color="amber" placeholder="Buscar por email..." @keyup.enter="listPagos">
            <template v-slot:prepend><q-icon name="search" color="amber-5" /></template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn-toggle v-model="filtroEstado" toggle-color="amber-9" toggle-text-color="black"
            color="transparent" text-color="grey-5" unelevated rounded no-caps
            class="filter-toggle-pro"
            :options="[
              {label: 'Todas', value: 'all', icon: 'list'}, 
              {label: 'En Disputa', value: 'dispute', icon: 'gavel'}, 
              {label: 'Vigentes', value: 'active', icon: 'check_circle'}
            ]" />
        </div>
        <q-space />
        <div class="col-auto q-gutter-x-sm">
          <q-btn color="purple-9" label="Nuevo Cupón" icon="confirmation_number" rounded unelevated @click="showCouponDialog = true" />
          <q-btn color="amber-9" text-color="black" label="Exportar CSV" icon="ios_share" rounded unelevated @click="exportarPagos" />
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA DE PAGOS -->
    <q-table :rows="filteredPagos" :columns="columns" row-key="_id" dark flat bordered class="mystic-table-pro" :loading="loadingTable" :pagination="{ rowsPerPage: 5 }">
      <template v-slot:body-cell-usuarioId="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar size="32px" class="q-mr-sm border-amber">
              <img :src="`https://api.dicebear.com/7.x/bottts/svg?seed=${props.row.usuarioId?.email}`" />
            </q-avatar>
            <div class="column">
              <span class="text-weight-bold text-amber-2">{{ props.row.usuarioId?.email || 'Anónimo' }}</span>
              <span class="text-caption text-grey-5">{{ props.row._id.slice(-6).toUpperCase() }}</span>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-monto="props">
        <q-td :props="props">
          <span class="text-h6 text-amber-5 q-mr-sm">{{ formatCurrency(props.row.monto) }}</span>
          <q-badge v-if="props.row.status === 'dispute'" color="negative" rounded>DISPUTA</q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-vencimiento="props">
        <q-td :props="props">
          <div style="min-width: 140px">
            <q-linear-progress :value="getSubscriptionProgress(props.row.fecha)" :color="getSubscriptionColor(props.row.fecha)" rounded class="energy-bar q-mb-xs" />
            <div class="text-caption text-center" :class="getSubscriptionClass(props.row.fecha)">{{ getStatusText(props.row.fecha) }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round icon="receipt_long" color="amber" size="sm" @click="imprimirRecibo(props.row)" />
          <q-btn flat round :icon="props.row.status === 'dispute' ? 'verified' : 'gavel'" 
            :color="props.row.status === 'dispute' ? 'positive' : 'negative'" size="sm" @click="toggleDisputa(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- DIÁLOGOS -->
    <q-dialog v-model="showCouponDialog">
      <q-card class="expediente-card-pro text-white" style="width: 400px">
        <q-card-section class="bg-purple-9 text-white"><div class="text-h6 mystic-title">Nuevo Ritual de Descuento</div></q-card-section>
        <q-card-section class="q-pa-lg q-gutter-md">
          <q-input v-model="newCoupon.code" label="Código Mágico" dark filled color="amber" mask="AAAAAA" />
          <q-input v-model="newCoupon.percent" label="Descuento (%)" dark filled color="amber" type="number" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" v-close-popup color="grey-5" />
          <q-btn label="Crear" color="amber-9" text-color="black" @click="crearCupon" unelevated rounded />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showReceipt">
       <q-card class="receipt-paper q-pa-xl text-black">
          <div class="text-center"><div class="text-h4 mystic-title text-purple-10">ASTRA AI</div><div class="text-overline">Comprobante de Ofrenda</div></div>
          <q-separator class="q-my-lg" />
          <div class="row justify-between">
             <div class="column"><div class="text-caption">USUARIO</div><div class="text-subtitle1 text-weight-bold">{{ currentReceipt?.usuarioId?.email }}</div></div>
             <div class="column text-right"><div class="text-caption">FECHA</div><div class="text-subtitle1 text-weight-bold">{{ formatDate(currentReceipt?.fecha) }}</div></div>
          </div>
          <div class="q-mt-xl bg-grey-2 q-pa-md rounded-borders flex justify-between">
             <div class="text-h6">Suscripción Premium</div><div class="text-h5 text-weight-bolder">{{ formatCurrency(currentReceipt?.monto) }}</div>
          </div>
          <div class="text-center q-mt-lg no-print"><q-btn icon="print" label="Imprimir" color="purple-10" @click="windowPrint" /></div>
       </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { getData } from '../../services/services'
import { useQuasar, exportFile } from 'quasar'

const $q = useQuasar()
const pagos = ref([])
const emailBuscar = ref("")
const filtroEstado = ref("all")
const loadingTable = ref(false)
const showCouponDialog = ref(false)
const showReceipt = ref(false)
const currentReceipt = ref(null)
const newCoupon = reactive({ code: '', percent: 20 })

const columns = [
  { name: 'usuarioId', label: 'Buscador', align: 'left' },
  { name: 'monto', label: 'Ofrenda', align: 'left' },
  { name: 'vencimiento', label: 'Vigencia', align: 'center' },
  { name: 'fecha', label: 'Fecha', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// LOGICA DE DATOS REALES
const totalIngresos = computed(() => pagos.value.reduce((acc, p) => acc + (Number(p.monto) || 0), 0))

const realPaymentMethods = computed(() => {
  const counts = { mercadopago: 0, transferencia: 0, tarjeta: 0, efectivo: 0 }
  pagos.value.forEach(p => {
    const tipo = (p.tipo || 'otros').toLowerCase()
    if (counts.hasOwnProperty(tipo)) counts[tipo] += p.monto
    else counts['efectivo'] += p.monto
  })

  const total = totalIngresos.value || 1
  return [
    { name: 'mp', label: 'MercadoPago', percent: Math.round((counts.mercadopago / total) * 100), icon: 'payments', color: 'amber-5' },
    { name: 'trans', label: 'Transferencia', percent: Math.round((counts.transferencia / total) * 100), icon: 'account_balance', color: 'purple-4' },
    { name: 'card', label: 'Tarjeta', percent: Math.round((counts.tarjeta / total) * 100), icon: 'credit_card', color: 'blue-4' },
    { name: 'cash', label: 'Otros/Efectivo', percent: Math.round((counts.efectivo / total) * 100), icon: 'local_atm', color: 'green-4' }
  ]
})

const heatmapData = computed(() => {
  const days = []
  const hoy = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(hoy.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    const dayPagos = pagos.value.filter(p => p.fecha?.startsWith(dateStr))
    const amount = dayPagos.reduce((acc, p) => acc + p.monto, 0)
    
    // Cálculo de color basado en intensidad (máximo simulado de 500k para tope de color)
    const intensity = Math.min(1, amount / 500000)
    let color = 'rgba(255, 255, 255, 0.05)'
    if (amount > 0) {
      color = `rgba(251, 191, 36, ${0.1 + intensity * 0.9})`
    }

    days.push({
      date: dateStr,
      amount: amount,
      count: dayPagos.length,
      color: color
    })
  }
  return days
})

const suscripcionesVenciendo = computed(() => pagos.value.filter(p => p.usuarioId?.rol?.toLowerCase() !== 'admin' && estaVenciendo(p.fecha)).length)

const filteredPagos = computed(() => {
  let list = pagos.value
  if (filtroEstado.value === 'dispute') list = list.filter(p => p.status === 'dispute')
  if (filtroEstado.value === 'active') list = list.filter(p => !haVencido(p.fecha))
  return list
})

async function listPagos(showLoading = true) {
  if (showLoading) loadingTable.value = true
  try {
    let url = emailBuscar.value ? `pagos?email=${emailBuscar.value}` : "pagos"
    let res = await getData(url)
    pagos.value = res.map(p => ({ ...p, status: p.status || 'approved' }))
  } catch (error) { console.error(error) } finally { loadingTable.value = false }
}

function toggleDisputa(pago) {
  pago.status = pago.status === 'dispute' ? 'approved' : 'dispute'
  $q.notify({ message: pago.status === 'dispute' ? 'Marcado en disputa' : 'Disputa resuelta', color: 'amber-9', textColor: 'black' })
}

function imprimirRecibo(pago) { currentReceipt.value = pago; showReceipt.value = true; }
function crearCupon() { $q.notify({ message: 'Cupón creado', color: 'purple-9' }); showCouponDialog.value = false; }
function windowPrint() { window.print() }
function formatCurrency(v) { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '--' }
function haVencido(f) { const v = new Date(f); v.setMonth(v.getMonth() + 1); return v < new Date() }
function estaVenciendo(f) { 
  const v = new Date(f); v.setMonth(v.getMonth() + 1);
  const diff = (v - new Date()) / 86400000; return diff >= 0 && diff <= 3
}
function getSubscriptionProgress(f) { 
  const v = new Date(f); v.setMonth(v.getMonth() + 1);
  return Math.max(0, Math.min(1, (v - new Date()) / 2592000000))
}
function getSubscriptionColor(f) { return haVencido(f) ? 'grey-8' : (estaVenciendo(f) ? 'orange-5' : 'cyan-4') }
function getSubscriptionClass(f) { return haVencido(f) ? 'text-grey-7' : (estaVenciendo(f) ? 'text-orange-5' : 'text-cyan-4') }
function getStatusText(f) { 
  if (haVencido(f)) return 'EXPIRADA'
  const v = new Date(f); v.setMonth(v.getMonth() + 1);
  return `${Math.floor((v - new Date()) / 86400000)} días restantes`
}

function exportarPagos() {
  const content = [columns.map(c => c.label).join(','), ...pagos.value.map(p => [p.usuarioId?.email, p.monto, p.fecha, p.status].join(','))].join('\r\n')
  exportFile('Reporte_Pagos.csv', content, 'text/csv')
}

onMounted(() => listPagos())
</script>

<style scoped>
.mystic-pro-bg { background: radial-gradient(circle at 100% 100%, #1e1b4b 0%, #0f172a 50%, #020617 100%); }
.mystic-title { font-family: 'Cinzel', serif; text-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
.stat-card-pro { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(245, 158, 11, 0.2); backdrop-filter: blur(10px); border-radius: 16px; }
.heatmap-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px; }
.heat-square { border-radius: 6px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); aspect-ratio: 1; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.08); }
.heat-square:hover { transform: translateY(-4px) scale(1.15); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6); border-color: rgba(245, 158, 11, 0.8); z-index: 10; position: relative; }
.border-top-mystic { border-top: 1px dashed rgba(255, 255, 255, 0.1); }
.source-bar { height: 6px; border-radius: 10px; }
.source-bar-pro { height: 8px; border-radius: 10px; }
.transition-hover { transition: background 0.3s ease, transform 0.3s ease; }
.transition-hover:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); }
.filter-toggle-pro { border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(0, 0, 0, 0.2) !important; padding: 3px; border-radius: 30px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }
.mystic-toolbar { background: rgba(15, 23, 42, 0.8); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2); }
.mystic-table-pro { background: rgba(15, 23, 42, 0.6) !important; border-radius: 20px; }
.energy-bar { height: 6px; border-radius: 10px; }
.receipt-paper { background: #fff; width: 500px; }
.no-print { @media print { display: none; } }
.opacity-20 { opacity: 0.2; }
</style>