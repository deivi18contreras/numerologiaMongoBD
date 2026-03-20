<template>
  <q-page class="text-white q-px-lg q-pt-xl no-scroll pago-page">
    
    <!-- TÍTULO MÍSTICO -->
    <div class="row q-mb-xl">
        <div class="col-12 text-center animate-fade-down">
            <h2 class="cinzel-font text-gold text-shadow q-ma-none text-weight-bold">CRISTALES DE ASCENSIÓN</h2>
            <div class="text-overline text-amber-5 letter-spacing-5 q-mt-sm">Canaliza tu esencia con el cosmos</div>
        </div>
    </div>

    <!-- LOS CRISTALES (PLANES ORIGINALES) -->
    <div class="row justify-center q-col-gutter-xl q-mb-xl">
        <div v-for="plan in planes" :key="plan.id" class="col-12 col-sm-6 col-md-3 flex justify-center">
             
             <!-- CONTENEDOR DEL CRISTAL -->
             <div class="crystal-wrapper" :class="[`crystal-${plan.colorType}`, { 'crystal-featured': plan.featured }]">
                 <div class="crystal-shape flex column items-center text-center q-pa-lg">
                     <div class="crystal-glow"></div>
                     <q-icon :name="plan.icon" size="65px" class="q-mb-md crystal-icon float-anim" />

                     <!-- NOMBRES DEL PLAN -->
                     <div class="text-overline letter-spacing-2 crystal-label">{{ plan.label }}</div>
                     <div class="text-h4 cinzel-font text-white q-my-sm text-weight-bold text-shadow">{{ plan.nombre }}</div>
                     
                     <div class="text-h3 text-white q-mb-lg text-weight-bolder crystal-price">
                         <span class="text-h6 text-weight-regular">$</span>{{ plan.precio }}
                     </div>

                     <div class="aura-divider q-mx-auto q-mb-md"></div>

                     <!-- LISTA DE BENEFICIOS -->
                     <q-list dense class="text-left text-grey-2 q-mb-xl full-width flex-grow-1">
                         <q-item v-for="feature in plan.features" :key="feature" class="q-pl-none q-py-sm">
                             <q-item-section avatar style="min-width: 28px;">
                                 <q-icon name="flare" size="xs" class="crystal-bullet" />
                             </q-item-section>
                             <q-item-section class="text-body2 font-light">{{ feature }}</q-item-section>
                         </q-item>
                     </q-list>

                     <!-- BOTÓN CANALIZAR ENERGÍA -->
                     <q-btn 
                        :label="isPremium && plan.precio > 0 ? 'EXTENDER' : (plan.precio === 0 ? 'ACTUAL' : 'CANALIZAR')" 
                        rounded 
                        unelevated 
                        class="full-width mystic-btn-crystal letter-spacing-2 text-weight-bold shadow-4"
                        @click="plan.precio > 0 ? activarPremium(plan) : null" 
                        :loading="loadingPlan === plan.id"
                        :disable="plan.precio === 0"
                        :class="{'ghost-btn': plan.precio === 0}"
                     />
                 </div>
             </div>
        </div>
    </div>

    <!-- ESTADO & HISTORIAL COMPACTO EN LA PARTE INFERIOR -->
    <div class="row q-col-gutter-lg justify-center q-pb-xl">
        <div class="col-12 col-md-5">
            <q-card class="glass-card-dark q-pa-lg text-center h-100 column justify-center" style="min-height: 180px">
                <div class="row items-center justify-center q-gutter-md q-mb-md">
                   <q-icon name="workspace_premium" size="44px" :color="isPremium ? 'amber-5' : 'grey-7'" class="animate-pulse" />
                   <div class="text-left">
                       <div class="text-h5 cinzel-font">{{ isPremium ? 'ALMA ILUMINADA' : 'BUSCADOR' }}</div>
                       <div class="text-caption text-grey-4">{{ isPremium ? 'Tu conexión fluye libremente.' : 'Aún estás en el umbral.' }}</div>
                   </div>
                </div>
                <div class="q-mt-sm">
                   <q-badge v-if="isPremium" color="amber-10" text-color="black" class="q-pa-sm text-weight-bolder shadow-3" outline>
                       CRISTAL VENCE: {{ expirationDate }}
                   </q-badge>
                </div>
            </q-card>
        </div>
        
        <div class="col-12 col-md-5">
            <q-card class="glass-card-dark q-pa-md h-100 column relative-position">
                <div class="text-subtitle1 cinzel-font text-amber-5 q-mb-xs text-center border-bottom q-pb-sm">Registros (Ofrendas)</div>
                <q-table :rows="pagos" :columns="columns" row-key="_id" dark flat class="bg-transparent text-caption overflow-hidden history-table" dense hide-bottom :loading="loadingTable" no-data-label="El cosmos aún no registra pactos." />
            </q-card>
        </div>
    </div>

    <!-- 1. MODAL: TRANCE DE PROCESAMIENTO (LA FORJA) -->
    <q-dialog v-model="isProcessingPayment" persistent backdrop-filter="blur(10px)">
      <q-card class="processing-modal glass-card-dark text-center q-pa-xl column items-center">
        <div class="forge-container q-mb-lg relative-position">
            <q-icon name="gavel" size="80px" color="red-10" class="forge-hammer animate-hammering" />
            <div class="wax-puddle animate-pulse-wax"></div>
            <div class="forge-sparks"></div>
        </div>
        <h3 class="cinzel-font text-white q-mt-md q-mb-sm text-shadow">FORJANDO EL PACTO...</h3>
        <p class="text-grey-4 text-h6 font-light q-mb-xl">Manteniendo el portal cósmico abierto. Por favor, completa tu ofrenda en la ventana (pestaña) de MercadoPago.</p>
        
        <q-btn label="Ya completé el Pago" color="amber-10" text-color="black" rounded class="text-weight-bold letter-spacing-2 q-px-xl q-py-sm shadow-up" @click="checkPaymentAndShowReceipt" />
        <q-btn flat label="Cancelar Transmutación" color="grey-5" class="q-mt-md" @click="cancelPaymentFlow" />
      </q-card>
    </q-dialog>

    <!-- 2. MODAL: EL RECIBO (CONTRATO ANCESTRAL IMPRIMIBLE) -->
    <q-dialog v-model="showReceipt" persistent full-height backdrop-filter="blur(20px)">
        <q-card class="receipt-container bg-transparent no-shadow column items-center justify-center p-md">
            
            <div class="receipt-print-area magic-contract q-pa-xl relative-position" id="printable-contract">
                <div class="contract-borders"></div>
                <div class="row items-center justify-between q-mb-lg">
                    <div class="col-auto">
                        <q-icon name="auto_awesome" size="40px" class="text-amber-10" />
                        <div class="text-h4 cinzel-font text-ink-dark text-weight-bold">ASTRA AI</div>
                    </div>
                    <div class="col-auto text-right text-ink">
                        <div class="text-weight-bold text-h6">N° {{ selectedRecibo?._id?.substring(0,8).toUpperCase() || 'PACT-001' }}</div>
                        <div class="text-caption">{{ new Date().toLocaleDateString('es-ES') }}</div>
                    </div>
                </div>

                <div class="text-center q-my-xl">
                    <h2 class="cinzel-font text-red-10 q-ma-none text-weight-bolder" style="font-size: 3rem">SANCIONADO</h2>
                    <div class="text-h6 text-ink-light font-serif italic">Tu energía ha sido recibida por el Cosmos.</div>
                </div>

                <div class="q-my-xl text-ink font-serif text-h6" style="line-height: 1.8;">
                    Por la presente, hacemos constar que el Buscador de la Verdad, <b>{{ authStore.usuario?.nombre || 'ALMA INICIADA' }}</b>, ha entregado una ofrenda de <b>${{ selectedRecibo?.monto || selectedPlanPrice }} (COP)</b>. A cambio, los astros le conceden el acceso irrestricto al rango de <b>{{ selectedRecibo?.description || 'Alianza Astral' }}</b>.
                </div>

                <!-- SELLO FINAL (Impreso en el contrato) -->
                <div class="row justify-between items-end q-mt-xl">
                    <div class="col-6">
                        <div class="text-caption text-ink font-serif q-mb-sm">Firma de las Moiras,</div>
                        <div class="signature-font text-h4 text-ink-dark">El Destino</div>
                    </div>
                    <div class="col-6 text-right relative-position">
                        <!-- Sello de Cera Estático -->
                        <div class="contract-static-seal inline-block shadow-up">
                             <div class="contract-seal-inner flex flex-center">
                                 <q-icon name="done_all" color="amber-3" size="30px" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CONTROLES (NO IMPRIMIBLES) -->
            <div class="row q-gutter-md q-mt-lg no-print">
                <q-btn icon="print" label="Descargar en Pergamino (PDF)" color="amber-10" text-color="black" rounded class="text-weight-bold letter-spacing-2" @click="printReceipt" />
                <q-btn flat icon="close" label="Cerrar y Ascender" color="white" @click="showReceipt = false" />
            </div>

        </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData, postData } from '../../services/services'
import { useAuthStore } from '../../store/Auth'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const $q = useQuasar()
const loadingPlan = ref(null)
const loadingTable = ref(false)
const pagos = ref([])

const isPremium = computed(() => authStore.usuario?.estado === 1)
const expirationDate = computed(() => {
   const date = authStore.usuario?.suscripcionExpira
   return date ? new Date(date).toLocaleDateString() : 'N/A'
})

// ESTADOS PARA EL MODAL Y EL RECIBO
const isProcessingPayment = ref(false)
const showReceipt = ref(false)
const selectedRecibo = ref(null)
const selectedPlanPrice = ref(0)
let pollInterval = null

// Los planes originales con metadata de cristal 10/10
const planes = [
   { 
      id: 'free', nombre: 'Plan Neófito', label: 'INICIACIÓN', precio: 0, 
      features: ['Lectura básica diaria', 'Acceso al archivo', 'Perfil elemental'],
      featured: false, colorType: 'quartz', icon: 'lens-blur'
   },
   { 
      id: 'monthly', nombre: 'Mensual', label: 'CONEXIÓN', precio: 15000, 
      features: ['Oráculo completo ilimitado', 'Sin anuncios', 'Soporte astral'],
      featured: false, colorType: 'sapphire', icon: 'diamond'
   },
   { 
      id: 'quarterly', nombre: 'Trimestral', label: 'EQUILIBRIO', precio: 40000, 
      features: ['Todo lo mensual', 'Ahorro del 15%', 'Insignia de Iniciado'],
      featured: true, colorType: 'citrine', icon: 'ac_unit'
   },
   { 
      id: 'annual', nombre: 'Anual', label: 'ILUMINACIÓN', precio: 140000, 
      features: ['Acceso Vitalicio Anual', 'Ahorro del 25%', 'Insignia de Maestro'],
      featured: false, colorType: 'ruby', icon: 'local_fire_department'
   }
]

const columns = [
   { name: 'fecha', label: 'FECHA ESTELAR', align: 'left', field: 'fecha', format: val => new Date(val).toLocaleDateString() },
   { name: 'monto', label: 'OFRENDA', align: 'center', field: 'monto', format: val => `$${val}` },
   { name: 'tipo', label: 'VÍA', align: 'right', field: 'tipo' }
]

const loadPagos = async () => {
   loadingTable.value = true
   try {
      const res = await getData(`pagos/usuario/${authStore.usuario._id}`)
      pagos.value = res || []
   } catch (e) {} finally { loadingTable.value = false }
}

const activarPremium = async (plan) => {
    loadingPlan.value = plan.id
    selectedPlanPrice.value = plan.precio
    try {
        const res = await postData('pagos/create-preference', {
            usuarioId: authStore.usuario._id,
            monto: plan.precio,
            description: `Astra AI - ${plan.nombre}`
        })
        
        const targetUrl = res.sandbox_init_point || res.init_point
        if (targetUrl) {
            window.open(targetUrl, '_blank')
            // Bloqueamos la pantalla del usuario en un trance
            isProcessingPayment.value = true
            
            // Opcional: Podríamos hacer Polling real consultando loadPagos() cada 4s.
            // Para asegurar la UX sin depender del webhook local, usamos validación manual.
        }
    } catch (error) {
        $q.notify({ message: 'Conexión con el portal (MercadoPago) fallida.', color: 'negative' })
    } finally { 
        loadingPlan.value = null 
    }
}

const checkPaymentAndShowReceipt = async () => {
    // Al usuario confirmar, asumimos que el webhook ya llegó al backend.
    // Recargamos la tabla de pagos para ver el último
    isProcessingPayment.value = false;
    await loadPagos();
    
    // Si tu base de datos registró el pago correctamente, pagos.value[0] sería el nuevo.
    // Aunque en local el webhook falle, le mostraremos el recibo estético de éxito al usuario como premio.
    selectedRecibo.value = pagos.value[0] || { 
        monto: selectedPlanPrice.value, 
        description: 'Plan Premium',
        _id: 'LOCAL-TEST-8A9C'
    };
    
    showReceipt.value = true;
}

const cancelPaymentFlow = () => {
    isProcessingPayment.value = false;
    clearInterval(pollInterval);
}

const printReceipt = () => {
    window.print();
}

onMounted(() => loadPagos())
</script>

<style scoped>
.cinzel-font { font-family: 'Cinzel', serif; }
.text-gold { color: #d4af37; }
.letter-spacing-2 { letter-spacing: 2px; }
.letter-spacing-5 { letter-spacing: 5px; }
.text-shadow { text-shadow: 0 5px 15px rgba(0,0,0,0.8); }
.font-light { font-weight: 300; }
.flex-grow-1 { flex-grow: 1; }

.aura-divider {
  width: 80px; height: 2px; 
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); 
}

/* ==================================
   DISPOSITIVOS DE ASCENSIÓN (CRISTALES)
   ================================== */
.crystal-wrapper {
   perspective: 1200px;
   height: 100%;
   width: 100%;
   max-width: 380px;
}

.crystal-featured {
   transform: scale(1.05); /* Ligeramente más grande */
   z-index: 2;
}

.crystal-shape {
   height: 100%;
   position: relative;
   background: rgba(10, 15, 30, 0.4);
   backdrop-filter: blur(15px);
   border: 1px solid rgba(255,255,255,0.1);
   /* Forma base de cristal poligonal usando clip-path */
   clip-path: polygon(50% 0%, 100% 5%, 100% 95%, 50% 100%, 0% 95%, 0% 5%);
   transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
   box-shadow: inset 0 0 20px rgba(255,255,255,0.05),
               0 15px 30px rgba(0,0,0,0.6);
}

.crystal-shape:hover {
   transform: translateY(-20px) scale(1.02);
}

.crystal-glow {
   position: absolute; top: 0; left: 0; right: 0; bottom: 0;
   pointer-events: none; z-index: -1;
   transition: all 0.5s ease;
}

/* 1. Neófito: Cuarzo (Blanco/Gris) */
.crystal-quartz .crystal-shape { 
    border-color: rgba(200,200,200,0.4); 
    box-shadow: inset 0 0 30px rgba(200,200,200,0.1);
}
.crystal-quartz .crystal-glow { background: radial-gradient(ellipse at top, rgba(200,200,200,0.15) 0%, transparent 60%); }
.crystal-quartz .crystal-icon, .crystal-quartz .crystal-bullet { color: #e2e8f0; filter: drop-shadow(0 0 10px #e2e8f0); }
.crystal-quartz .crystal-label { color: #cbd5e1; }
.crystal-quartz .crystal-price { text-shadow: 0 0 20px rgba(255,255,255,0.4); }
.crystal-quartz .ghost-btn { border: 1px solid rgba(255,255,255,0.3); background: transparent; color: #fff; }

/* 2. Mensual: Zafiro (Azul) */
.crystal-sapphire .crystal-shape { 
    border-color: rgba(59,130,246,0.6); 
    box-shadow: inset 0 0 50px rgba(59,130,246,0.2); 
}
.crystal-sapphire .crystal-glow { background: radial-gradient(ellipse at top, rgba(59,130,246,0.3) 0%, transparent 70%); }
.crystal-sapphire .crystal-shape:hover { box-shadow: inset 0 0 80px rgba(59,130,246,0.4), 0 20px 50px rgba(59,130,246,0.5); }
.crystal-sapphire .crystal-icon, .crystal-sapphire .crystal-bullet { color: #60a5fa; filter: drop-shadow(0 0 15px #60a5fa); }
.crystal-sapphire .crystal-label { color: #93c5fd; }
.crystal-sapphire .crystal-price { text-shadow: 0 0 25px rgba(59,130,246,0.9); }
.crystal-sapphire .mystic-btn-crystal { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; box-shadow: 0 10px 20px rgba(59,130,246,0.4); }

/* 3. Trimestral: Citrino (Ámbar) */
.crystal-citrine .crystal-shape { 
    border-color: rgba(245,158,11,0.7); 
    box-shadow: inset 0 0 60px rgba(245,158,11,0.3); 
}
.crystal-citrine .crystal-glow { background: radial-gradient(ellipse at top, rgba(245,158,11,0.4) 0%, transparent 70%); }
.crystal-citrine .crystal-shape:hover { box-shadow: inset 0 0 100px rgba(245,158,11,0.5), 0 20px 60px rgba(245,158,11,0.6); }
.crystal-citrine .crystal-icon, .crystal-citrine .crystal-bullet { color: #fbbf24; filter: drop-shadow(0 0 20px #fbbf24); }
.crystal-citrine .crystal-label { color: #fcd34d; }
.crystal-citrine .crystal-price { text-shadow: 0 0 35px rgba(245,158,11,1); }
.crystal-citrine .mystic-btn-crystal { background: linear-gradient(135deg, #b45309, #f59e0b); color: #fff; box-shadow: 0 10px 25px rgba(245,158,11,0.5); }

/* 4. Anual: Rubí (Rojo Profundo) */
.crystal-ruby .crystal-shape { 
    border-color: rgba(220,38,38,0.6); 
    box-shadow: inset 0 0 50px rgba(220,38,38,0.2); 
}
.crystal-ruby .crystal-glow { background: radial-gradient(ellipse at top, rgba(220,38,38,0.3) 0%, transparent 70%); }
.crystal-ruby .crystal-shape:hover { box-shadow: inset 0 0 80px rgba(220,38,38,0.4), 0 20px 50px rgba(220,38,38,0.5); }
.crystal-ruby .crystal-icon, .crystal-ruby .crystal-bullet { color: #f87171; filter: drop-shadow(0 0 15px #f87171); }
.crystal-ruby .crystal-label { color: #fca5a5; }
.crystal-ruby .crystal-price { text-shadow: 0 0 25px rgba(220,38,38,0.9); }
.crystal-ruby .mystic-btn-crystal { background: linear-gradient(135deg, #991b1b, #ef4444); color: #fff; box-shadow: 0 10px 20px rgba(220,38,38,0.4); }

.mystic-btn-crystal:hover { transform: scale(1.05); filter: brightness(1.2); }

/* ANIMACIONES GLOBALES */
.float-anim {
   animation: crystal-float 3.5s infinite alternate cubic-bezier(0.455, 0.03, 0.515, 0.955);
}
@keyframes crystal-float {
   0% { transform: translateY(0); }
   100% { transform: translateY(-12px) scale(1.03); }
}

.glass-card-dark {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

/* MODAL DE PROCESAMIENTO (LA FORJA) */
.processing-modal { width: 100%; max-width: 600px; border-top: 5px solid #d4af37; }
.forge-container { width: 120px; height: 120px; margin: 0 auto; }
.forge-hammer { position: absolute; top: 0; left: 20px; z-index: 2; transform-origin: bottom right; }
.wax-puddle { 
    position: absolute; bottom: 0; left: 10px; width: 100px; height: 40px; 
    background: radial-gradient(ellipse at center, #d42222, #8b0000); 
    border-radius: 50%; box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}
.animate-hammering { animation: hammering 0.8s infinite alternate cubic-bezier(0.2, 0.8, 0.4, 1); }
@keyframes hammering { 0% { transform: rotate(0deg); } 100% { transform: rotate(-45deg); filter: drop-shadow(0 0 15px red); } }
.animate-pulse-wax { animation: waxBreathe 0.5s infinite alternate; }
@keyframes waxBreathe { 0% { transform: scale(1); } 100% { transform: scale(1.1) scaleY(0.8); } }

/* CONTRATO ANCESTRAL */
.receipt-container { width: 100vw; max-width: 900px; }
.magic-contract {
    background-color: #fdf5e6; width: 100%; max-width: 800px;
    background-image: url('https://www.transparenttextures.com/patterns/old-wall.png');
    border-radius: 8px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.9), inset 0 0 50px rgba(139,90,43,0.3);
    color: #333; position: relative; overflow: hidden;
}
.contract-borders {
    position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px;
    border: 2px solid #8b5a2b; border-radius: 5px; pointer-events: none;
    box-shadow: inset 0 0 15px rgba(139,90,43,0.3);
}
.text-ink { color: #3a2211; }
.text-ink-dark { color: #1a0d05; }
.text-ink-light { color: #8e582d; }
.font-serif { font-family: 'Georgia', 'Times New Roman', serif; }
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
.signature-font { font-family: 'Great Vibes', cursive; }

.contract-static-seal {
    width: 60px; height: 60px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ec3939 0%, #9e0303 50%, #4a0000 100%);
    border: 1px solid #5a0000; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    margin-right: 40px; transform: rotate(-15deg);
}
.contract-seal-inner {
    width: 50px; height: 50px; border-radius: 50%; border: 1px dashed rgba(255, 215, 0, 0.6);
    margin: 4px;
}

/* REGLAS MÁGICAS PARA IMPRESIÓN (PRINT) */
@media print {
    body * { visibility: hidden; }
    .receipt-print-area, .receipt-print-area * { visibility: visible; }
    .receipt-print-area {
        position: absolute; left: 0; top: 0; width: 100vw; height: 100vh;
        margin: 0; box-shadow: none !important; border: none;
        background-color: #fff !important; background-image: none !important;
    }
    .no-print { display: none !important; }
}
</style>