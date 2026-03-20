<template>
  <q-page class="text-white q-px-lg q-pt-lg">
    <div class="row q-col-gutter-lg animate-fade-up">
      <!-- CUANDO HAY LECTURAS -->
      <div v-for="(lec, i) in lecturas" :key="lec._id" class="col-12 col-sm-6 col-md-4">
        <q-card class="vault-card glass-card-dark cursor-pointer overflow-hidden">
           <div class="vault-card-glow" :style="{ background: i % 2 === 0 ? '#6366f1' : '#fbbf24' }"></div>
           <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-md">
                 <q-icon name="history_edu" color="amber-5" />
                 <span class="text-caption text-grey-6">{{ formatDate(lec.createdAt) }}</span>
              </div>
              <div class="text-h6 text-white cinzel-font">
                {{ lec.tipo === 'principal' ? 'Esencia Revelada' : 'Oráculo Diario' }}
              </div>
              <p class="text-caption text-grey-5 q-mt-sm line-clamp-2">
                {{ getPreview(lec) }}
              </p>
              
              <q-separator dark class="q-my-md opacity-10" />
              
              <div class="row items-center justify-between">
                 <span class="text-amber-5 text-weight-bold">
                   Lectura {{ lec.tipo }}
                 </span>
                 <q-btn flat round icon="visibility" color="grey-6" />
              </div>
           </q-card-section>
        </q-card>
      </div>

      <!-- ESTADO VACÍO ELEGANTE -->
      <div v-if="lecturas.length === 0 && !loading" class="col-12 flex flex-center column q-pa-xl opacity-30">
         <q-icon name="hourglass_empty" size="100px" color="amber-5" />
         <div class="text-h5 cinzel-font q-mt-md">Tu historia se está escribiendo...</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../../services/services'
import { useAuthStore } from '../../store/Auth'

const authStore = useAuthStore()
const lecturas = ref([])
const loading = ref(true)

const loadVault = async () => {
    try {
        const res = await getData(`lectura/${authStore.usuario._id}`)
        if (res && res.lecturas) {
            lecturas.value = res.lecturas.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const formatDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

const getPreview = (lec) => {
    try {
        let cnt = typeof lec.contenido === 'string' ? JSON.parse(lec.contenido) : lec.contenido
        return cnt.descripcion || cnt.mensaje || "Un fragmento de sabiduría guardado en los hilos del tiempo..."
    } catch(e) {
        return "Conexión mística preservada..."
    }
}

onMounted(() => loadVault())
</script>

<style scoped>
.cinzel-font { font-family: 'Cinzel', serif; }

.glass-card-dark {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.vault-card { position: relative; transition: all 0.4s ease; }
.vault-card:hover {
  transform: scale(1.03) translateY(-5px);
  border-color: rgba(251, 191, 36, 0.4);
}

.animate-slide-left { animation: slideLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.animate-fade-up { animation: fadeUp 1s ease-out 0.2s both; }

.header-line {
  width: 60px;
  height: 3px;
  background: #fbbf24;
  border-radius: 2px;
  box-shadow: 0 0 10px #fbbf24;
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>