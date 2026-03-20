<template>
  <div class="mystic-pro-bg text-white q-pa-md" style="min-height: auto;">
    <!-- CABECERA CON KPIs -->
    <div class="row q-col-gutter-md q-mb-md items-center">
      <div class="col-12 col-md-6">
        <h1 class="text-h3 text-amber-5 mystic-title q-ma-none">Gestión de Almas</h1>
        <p class="text-deep-purple-3 q-mt-sm">Arquitecto del Destino: Control total sobre los buscadores. 🌌</p>
      </div>
      
      <div class="col-12 col-md-6">
        <div class="row q-col-gutter-sm">
          <div v-for="(stat, index) in stats" :key="index" class="col-6 col-sm-3">
            <q-card class="stat-card text-center" flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="text-overline text-amber-5">{{ stat.label }}</div>
                <div class="text-h5 text-weight-bolder">{{ stat.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- BARRA DE HERRAMIENTAS -->
    <q-card class="mystic-toolbar q-mb-md" flat bordered>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input v-model="emailBuscar" dark outlined dense color="amber" 
            placeholder="Rastrear alma por email..." @keyup.enter="listUsers">
            <template v-slot:prepend><q-icon name="psychology" color="amber-5" /></template>
          </q-input>
        </div>

        <div class="col-auto">
          <q-btn-toggle v-model="filtroEstado" toggle-color="amber-9" toggle-text-color="black"
            color="transparent" text-color="grey-5" unelevated rounded no-caps
            class="filter-toggle-pro"
            :options="[
              {label: 'Todos', value: 'all', icon: 'list'}, 
              {label: 'Activos', value: '1', icon: 'check_circle'}, 
              {label: 'Inactivos', value: '0', icon: 'block'}
            ]" />
        </div>

        <q-space />

        <div class="col-auto" v-if="selected.length > 0">
          <q-btn-dropdown color="amber-9" label="Acciones en Masa" text-color="black" unelevated rounded icon="auto_fix_high">
            <q-list dark class="mystic-dropdown">
              <q-item clickable v-close-popup @click="bulkStatus(1)">
                <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                <q-item-section>Activar {{ selected.length }} Seleccionados</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="bulkStatus(0)">
                <q-item-section avatar><q-icon name="block" color="negative" /></q-item-section>
                <q-item-section>Inactivar {{ selected.length }} Seleccionados</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA DE USUARIOS -->
    <q-table :rows="filteredUsers" :columns="columns" row-key="_id" selection="multiple" v-model:selected="selected"
      dark flat bordered class="mystic-table-pro" :loading="loadingTable" :pagination="{ rowsPerPage: 6 }">
      
      <template v-slot:body-cell-nombre="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar size="38px" class="q-mr-sm shadow-2 border-amber">
              <img :src="props.row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${props.row.email}`" />
              <q-badge v-if="isBirthday(props.row.fechanacimiento)" floating rounded color="pink" class="birthday-star">
                <q-icon name="auto_awesome" size="10px" />
              </q-badge>
            </q-avatar>
            <div class="column">
              <div class="row items-center">
                <span class="text-weight-bold text-amber-2">{{ props.row.nombre }}</span>
                <q-icon v-if="isOldSoul(props.row.createdAt)" name="workspace_premium" color="amber-8" size="14px" class="q-ml-xs">
                   <q-tooltip>Alma Ancestral (+30 días)</q-tooltip>
                </q-icon>
              </div>
              <span class="text-caption text-grey-5">{{ props.row.email }}</span>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-suscripcion="props">
        <q-td :props="props">
          <div v-if="props.row.rol && props.row.rol.toLowerCase() === 'admin'">
            <div class="row items-center justify-center">
              <q-icon name="workspace_premium" color="amber-5" size="20px" class="q-mr-sm"/>
              <span class="text-amber-5 text-weight-bolder">Acceso Eterno</span>
            </div>
          </div>
          <div v-else-if="props.row.estado === 1" style="min-width: 120px">
            <div class="row justify-between items-center q-mb-xs">
              <span class="text-caption text-amber-5">{{ getDaysLeft(props.row.fechaExpiracion) }} días</span>
              <q-icon :name="getSubscriptionIcon(props.row.fechaExpiracion)" :color="getSubscriptionColor(props.row.fechaExpiracion)" size="14px" />
            </div>
            <q-linear-progress :value="getSubscriptionProgress(props.row.fechaExpiracion)" 
              :color="getSubscriptionColor(props.row.fechaExpiracion)" rounded track-color="grey-9" class="energy-bar" />
          </div>
          <div v-else class="text-grey-7 italic text-caption">Sin conexión activa</div>
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-chip v-if="props.row.rol && props.row.rol.toLowerCase() === 'admin'" color="purple-9" text-color="amber-2" size="sm" dense class="text-weight-bold shadow-4">
            <q-icon name="stars" class="q-mr-xs" size="14px" /> ADMIN VIP
          </q-chip>
          <q-chip v-else :color="props.row.estado === 1 ? 'positive' : 'grey-9'" text-color="white" size="sm" dense outline>
            {{ props.row.estado === 1 ? 'ACTIVO' : 'INACTIVO' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round icon="visibility" color="amber" size="sm" @click="verExpediente(props.row)" />
          <q-btn flat round :icon="props.row.estado === 1 ? 'block' : 'check_circle'"
            :color="props.row.estado === 1 ? 'negative' : 'positive'" size="sm"
            @click="cambiarEstado(props.row._id, props.row.estado === 1 ? 0 : 1)" />
        </q-td>
      </template>
    </q-table>

    <!-- EXPEDIENTE CON TABS -->
    <q-dialog v-model="showExpediente" backdrop-filter="blur(15px) saturate(150%)">
      <q-card class="expediente-card-pro text-white" style="width: 850px; max-width: 95vw;">
        <q-tabs v-model="tabExpediente" dense class="text-grey" active-color="amber" indicator-color="amber" align="justify">
          <q-tab name="esencia" label="Esencia" icon="auto_awesome" />
          <q-tab name="ofrendas" label="Ofrendas" icon="payments" />
        </q-tabs>

        <q-separator dark />

        <q-tab-panels v-model="tabExpediente" animated class="bg-transparent" style="min-height: 400px;">
          <q-tab-panel name="esencia" class="q-pa-xl row q-col-gutter-xl">
             <div class="col-12 col-md-4 text-center">
              <q-avatar size="120px" class="profile-ring-pro q-mb-md">
                <img :src="selectedSoul?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedSoul?.email}`" />
              </q-avatar>
              <div class="text-h6 text-weight-bolder text-amber-2">{{ selectedSoul?.nombre }}</div>
              <div class="text-caption text-deep-purple-3 q-mb-md">{{ selectedSoul?.rol }}</div>
              <q-separator dark class="q-my-md opacity-20" />
              <div class="text-caption text-grey-5 italic">Registrado el</div>
              <div class="text-subtitle2">{{ formatDate(selectedSoul?.createdAt) }}</div>
            </div>

            <div class="col-12 col-md-8">
              <div class="row q-col-gutter-md">
                <div class="col-12"><q-input v-model="editForm.nombre" label="Nombre (Seña Terrenal)" dark dense filled color="amber" /></div>
                <div class="col-12"><q-input v-model="editForm.email" label="Email de Conexión" dark dense filled color="amber" /></div>
                <div class="col-12 col-md-6"><q-input v-model="editForm.fechanacimiento" label="Fecha Nacimiento" dark dense filled color="amber" type="date" stack-label clearable /></div>
                <div class="col-12 col-md-6">
                  <q-select v-model="editForm.rol" :options="[{label: 'User', value: 'user'}, {label: 'Admin', value: 'admin'}]" 
                    label="Jerarquía del Alma" dark dense filled color="amber" emit-value map-options>
                    <template v-slot:prepend><q-icon :name="editForm.rol === 'admin' ? 'stars' : 'person'" :color="editForm.rol === 'admin' ? 'amber-5' : 'grey'" /></template>
                  </q-select>
                </div>
              </div>
              <div class="row justify-end q-mt-xl">
                <q-btn color="amber-9" text-color="black" label="Guardar Cambios" @click="guardarCambios" unelevated rounded icon="sync_alt" />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="ofrendas" class="q-pa-md">
             <div class="row justify-between items-center q-mb-md">
               <div class="text-overline text-amber-5 text-weight-bold">Registro Energético de Transacciones</div>
               <q-btn color="positive" icon="add" label="Pago Manual" unelevated rounded size="sm" @click="registrarOfrendaManual" />
             </div>
             
             <div v-if="loadingPagos" class="column items-center justify-center q-pa-xl">
                <q-spinner-orbit color="amber" size="64px" />
             </div>
             <div v-else-if="pagosUsuario.length === 0" class="column items-center justify-center q-pa-xl text-grey-5 border-top-mystic">
                <q-icon name="sentiment_dissatisfied" size="64px" />
                <div class="text-h6 q-mt-md">Aún no hay energía ofrendada.</div>
             </div>
             <div v-else>
                <q-list dark bordered separator class="mystic-list rounded-borders">
                  <q-item v-for="pago in pagosUsuario" :key="pago._id">
                    <q-item-section avatar><q-icon :name="getPagoIcon(pago.tipo)" color="amber-5" /></q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-amber-2">{{ formatCurrency(pago.monto) }}</q-item-label>
                      <q-item-label caption class="text-grey-4">{{ pago.tipo }} • {{ formatDateShort(pago.fecha) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip :color="getStatusColor(pago.status)" text-color="black" size="sm" class="text-weight-bold">
                        {{ pago.status }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="row justify-between items-center q-mt-lg">
                  <div class="text-grey-5 text-caption">LTV (Lifetime Value) Aportado</div>
                  <div class="text-h5 text-weight-bolder text-amber-5">{{ totalInvertido }}</div>
                </div>
             </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { getData, putData, postData } from '../../services/services'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const usuarios = ref([])
const selected = ref([])
const emailBuscar = ref('')
const filtroEstado = ref('all')
const showExpediente = ref(false)
const tabExpediente = ref('esencia')
const selectedSoul = ref(null)
const loadingTable = ref(false)
const pagosUsuario = ref([])
const loadingPagos = ref(false)

const editForm = reactive({ nombre: '', email: '', fechanacimiento: '', rol: 'user' })

const columns = [
  { name: 'nombre', label: 'Buscador', align: 'left', field: 'nombre', sortable: true },
  { name: 'suscripcion', label: 'Suscripción', align: 'center' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// LOGICA KPI Y FILTROS
const stats = computed(() => {
  const clientes = usuarios.value.filter(u => !(u.rol && u.rol.toLowerCase() === 'admin'))
  const admins = usuarios.value.filter(u => u.rol && u.rol.toLowerCase() === 'admin').length
  
  const total = clientes.length
  const activos = clientes.filter(u => u.estado === 1 || u.estado === '1').length
  const hoy = new Date().toISOString().split('T')[0]
  const nuevos = clientes.filter(u => u.createdAt?.startsWith(hoy)).length
  
  return [
    { label: 'Total', value: total },
    { label: 'Activos', value: activos },
    { label: 'Nuevos', value: nuevos },
    { label: 'Admins', value: admins }
  ]
})

const filteredUsers = computed(() => {
  let list = usuarios.value
  if (filtroEstado.value === '1') {
    list = list.filter(u => u.estado === 1 || u.estado === '1')
  } else if (filtroEstado.value === '0') {
    list = list.filter(u => u.estado !== 1 && u.estado !== '1')
  }
  return list
})

const totalInvertido = computed(() => {
  const sum = pagosUsuario.value.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.monto, 0)
  return formatCurrency(sum)
})

// CARGA DE DATOS
async function listUsers(showLoading = true) {
  if (showLoading) loadingTable.value = true
  try {
    let url = emailBuscar.value ? `usuario?email=${emailBuscar.value}` : "usuario"
    let res = await getData(url)
    // Simulación de fecha de expiración para la barra de progreso (30 días desde registro si está activo)
    usuarios.value = res.map(u => ({
      ...u,
      fechaExpiracion: u.estado === 1 ? new Date(new Date(u.createdAt).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString() : null
    }))
  } catch (error) { console.error(error) } finally { loadingTable.value = false }
}

watch(tabExpediente, (val) => { if (val === 'ofrendas' && selectedSoul.value) cargarPagos(selectedSoul.value._id) })

async function cargarPagos(id) {
  loadingPagos.value = true
  try {
    pagosUsuario.value = await getData(`pagos/${id}`)
  } catch (error) { pagosUsuario.value = [] } finally { loadingPagos.value = false }
}

// ACCIONES (Sin cambiar lógica original)
async function cambiarEstado(id, nuevoEstado) {
  try {
    const accion = nuevoEstado === 1 ? 'activar' : 'inactivar'
    await putData(`usuario/${accion}/${id}`)
    $q.notify({ message: 'Estado actualizado', color: 'positive', position: 'top' })
    listUsers(false)
  } catch (error) { console.error(error) }
}

async function bulkStatus(nuevoEstado) {
  $q.loading.show()
  try {
    const accion = nuevoEstado === 1 ? 'activar' : 'inactivar'
    await Promise.all(selected.value.map(user => putData(`usuario/${accion}/${user._id}`)))
    selected.value = []
    listUsers(false)
  } finally { $q.loading.hide() }
}

async function guardarCambios() {
  $q.loading.show()
  try {
    const payload = { ...editForm }
    // Remover fechanacimiento si viene vacía para que Mongoose no crasheé al intentar guardar
    if (!payload.fechanacimiento) delete payload.fechanacimiento
    
    await putData(`usuario/${selectedSoul.value._id}`, payload)
    showExpediente.value = false
    listUsers(false)
    $q.notify({ message: 'Jerarquía cósmica actualizada con éxito', color: 'amber-9', textColor: 'black', position: 'top' })
  } catch (error) { console.error(error) } finally { $q.loading.hide() }
}

function registrarOfrendaManual() {
  $q.dialog({
    title: 'Materializar Ofrenda Manual',
    message: 'Ingresa el monto exacto entregado en físico o transferencia directa:',
    prompt: { model: '', type: 'number', outlined: true, color: 'amber' },
    cancel: true,
    color: 'amber-9'
  }).onOk(async (montoStr) => {
    const monto = Number(montoStr)
    if (!monto || monto <= 0) return
    
    $q.loading.show()
    try {
      await postData('pagos', { usuarioId: selectedSoul.value._id, monto, tipo: "efectivo", status: "approved" })
      $q.notify({ message: 'Ofrenda materializada con éxito', color: 'positive', position: 'top' })
      cargarPagos(selectedSoul.value._id)
      listUsers(false) // Refresca afuera para activar la capa general al instante (Inmortal/Vigente)
    } catch (error) {
      console.error(error)
      $q.notify({ message: 'La ofrenda no pudo concretarse', color: 'negative' })
    } finally { $q.loading.hide() }
  })
}

function verExpediente(user) {
  selectedSoul.value = user
  editForm.nombre = user.nombre
  editForm.email = user.email
  editForm.rol = user.rol || 'user'
  editForm.fechanacimiento = user.fechanacimiento ? new Date(user.fechanacimiento).toISOString().split('T')[0] : ''
  tabExpediente.value = 'esencia'
  showExpediente.value = true
}

// HELPERS VISUALES
const getDaysLeft = (d) => d ? Math.max(0, Math.floor((new Date(d) - new Date()) / 86400000)) : 0
const getSubscriptionProgress = (d) => Math.min(1, getDaysLeft(d) / 30)
const getSubscriptionColor = (d) => getDaysLeft(d) > 15 ? 'cyan-4' : (getDaysLeft(d) > 7 ? 'amber-5' : 'negative')
const getSubscriptionIcon = (d) => getDaysLeft(d) > 15 ? 'bolt' : 'warning'
const isBirthday = (d) => d && new Date().getDate() === new Date(d).getDate() && new Date().getMonth() === new Date(d).getMonth()
const isOldSoul = (d) => d && (new Date() - new Date(d)) > 2592000000
const getPagoIcon = (t) => ({ mercadopago: 'payments', transferencia: 'account_balance', tarjeta: 'credit_card' }[t] || 'local_atm')
const getStatusColor = (s) => ({ approved: 'positive', pending: 'amber-5', rejected: 'negative' }[s] || 'grey')
const formatCurrency = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Eternidad'
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '--'

onMounted(() => listUsers())
</script>

<style scoped>
.mystic-pro-bg { background: radial-gradient(circle at 0% 0%, #1e1b4b 0%, #0f172a 50%, #020617 100%); }
.filter-toggle-pro { border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(0, 0, 0, 0.2) !important; padding: 3px; border-radius: 30px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }
.mystic-title { font-family: 'Cinzel', serif; text-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
.stat-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(245, 158, 11, 0.2); backdrop-filter: blur(8px); }
.mystic-toolbar { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; }
.mystic-table-pro { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; }
.mystic-table-pro :deep(th) { color: #fbbf24; font-weight: 800; text-transform: uppercase; }
.border-amber { border: 2px solid rgba(245, 158, 11, 0.4); }
.energy-bar { height: 6px; border-radius: 10px; }
.birthday-star { animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
.expediente-card-pro { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px; }
.profile-ring-pro { border: 4px solid #fbbf24; padding: 4px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
.mystic-list { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(245, 158, 11, 0.1); }
</style>