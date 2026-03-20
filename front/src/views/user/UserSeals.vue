<template>
  <q-page class="text-white q-px-lg q-pt-lg">
    <div class="row q-col-gutter-xl animate-fade-up">
      <div v-for="sello in sellos" :key="sello.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card 
          class="sello-card flex flex-center column q-pa-xl overflow-hidden" 
          :class="{ 'sello-locked': !sello.unlocked, 'sello-unlocked': sello.unlocked }"
        >
          <!-- EFECTO DE RESPLANDOR (GLOW) -->
          <div class="sello-glow" :style="{ background: sello.color }"></div>
          
          <div class="sello-icon-wrap q-mb-lg">
             <q-icon :name="sello.unlocked ? sello.icon : 'lock_outline'" size="80px" />
             <div class="sello-ring animate-rotate" v-if="sello.unlocked"></div>
          </div>

          <div class="text-h6 cinzel-font text-center" :class="sello.unlocked ? 'text-white' : 'text-grey-7'">
            {{ sello.nombre }}
          </div>
          <div class="text-caption text-center q-mt-sm" :class="sello.unlocked ? 'text-amber-5' : 'text-grey-8'">
            {{ sello.unlocked ? sello.desc : 'Misterio por revelar...' }}
          </div>

          <!-- BARRA DE PROGRESO SI ESTÁ BLOQUEADO -->
          <div class="full-width q-mt-lg" v-if="!sello.unlocked">
             <q-linear-progress :value="sello.p" color="grey-9" track-color="transparent" />
             <div class="text-center text-grey-9 q-mt-xs" style="font-size: 8px">AVANCE: {{ Math.floor(sello.p * 100) }}%</div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- SECCIÓN DE RECOMPENSA FINAL -->
    <div class="row justify-center q-mt-xl">
       <q-card class="master-seal-card glass-card-dark q-pa-xl text-center full-width">
          <div class="text-h5 cinzel-font text-amber-5 q-mb-md">La Gran Sincronización</div>
          <p class="text-grey-4">Colecciona los 8 sellos para desbloquear la <strong>Lectura de la Matriz Cuántica</strong> (Función Secreta).</p>
          <div class="row justify-center q-gutter-x-sm q-mt-md">
             <div v-for="i in 8" :key="i" class="mini-slot" :class="{ 'filled': i <= unlockedCount }"></div>
          </div>
       </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/Auth'
import { getData } from '../../services/services'

const authStore = useAuthStore()
const lecturasObj = ref([])

onMounted(async () => {
    try {
        const res = await getData(`lectura/${authStore.usuario._id}`)
        if (res && res.lecturas) {
            lecturasObj.value = res.lecturas
        }
    } catch(e) {}
})

const sellos = computed(() => {
    const l = lecturasObj.value
    const diarias = l.filter(x => x.tipo === 'diaria')
    const principal = l.filter(x => x.tipo === 'principal')
    
    return [
        { id: 1, nombre: "SELLO DEL INICIADO", icon: "auto_awesome", desc: "Has realizado tu lectura de esencia.", unlocked: principal.length > 0, color: "#6366f1", p: principal.length > 0 ? 1 : 0 },
        { id: 2, nombre: "ALMA CONSTANTE", icon: "local_fire_department", desc: "7 días en sintonía con el cosmos.", unlocked: diarias.length >= 7, color: "#f59e0b", p: diarias.length / 7 },
        { id: 3, nombre: "ILUMINADO", icon: "workspace_premium", desc: "Has alcanzado la Ascensión Premium.", unlocked: authStore.usuario?.estado === 1, color: "#fbbf24", p: authStore.usuario?.estado === 1 ? 1 : 0 },
        { id: 4, nombre: "EL GUARDIÁN", icon: "security", desc: "Has protegido tu energía por 30 días.", unlocked: diarias.length >= 30, color: "#10b981", p: diarias.length / 30 },
        { id: 5, nombre: "OJO DEL DESTINO", icon: "psychic", desc: "10 consultas al Oráculo Diario.", unlocked: diarias.length >= 10, color: "#ec4899", p: diarias.length / 10 },
        { id: 6, nombre: "VINCULADOR", icon: "favorite", desc: "Has calculado 5 compatibilidades.", unlocked: false, color: "#ef4444", p: 0 },
        { id: 7, nombre: "MAESTRO RITUAL", icon: "flare", desc: "Completaste 10 rituales diarios.", unlocked: false, color: "#a855f7", p: 0 },
        { id: 8, nombre: "CRONISTA", icon: "history_edu", desc: "Tu historial ha superado los 20 registros.", unlocked: l.length > 20, color: "#3b82f6", p: l.length / 20 }
    ]
})

const unlockedCount = computed(() => sellos.value.filter(s => s.unlocked).length)
</script>

<style scoped>
.cinzel-font { font-family: 'Cinzel', serif; }

.sello-card {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  position: relative;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sello-locked {
  filter: grayscale(1) opacity(0.5);
}

.sello-unlocked:hover {
  transform: scale(1.05) rotate(2deg);
  border-color: #fbbf24;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.2);
}

.sello-glow {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0.1; filter: blur(40px);
}

.sello-icon-wrap { position: relative; z-index: 2; }

.sello-ring {
  position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px;
  border: 2px dashed rgba(251, 191, 36, 0.4);
  border-radius: 50%;
}

.animate-rotate { animation: spin 10s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.master-seal-card {
  border: 1px solid rgba(251, 191, 36, 0.3);
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.mini-slot {
  width: 15px; height: 15px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
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