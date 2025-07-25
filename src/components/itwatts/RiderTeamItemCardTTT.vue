<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from '@/stores/apps/kanban/task';

const props = defineProps({
    rider: null,   
});

// common components
const dialog = ref(false);
const store = useTaskStore();


function save() {
    return dialog.value=false
}
function cancel() {
    return dialog.value=false
}

function copy(zpID) {
  navigator.clipboard.writeText(zpID);
}

</script>

<template>
    <!-- ---------------------------------------------------- -->
    <!-- Table Basic -->
    <!-- ---------------------------------------------------- -->
    <v-card elevation="10" class="mb-5">
        <div class="d-flex align-center justify-space-between px-4 py-2 pr-3">
            <h5 class="text-subtitle-2 font-weight-semibold pr-4 cursor-move">{{ rider?.name }} {{ rider?.isCapitain ? '(Capt)' : '' }} {{ rider?.isDS ? '(DS)' : '' }}</h5>
            <RouterLink to="" class="px-0">
                <DotsVerticalIcon size="15" />

                <v-menu activator="parent">
                    <v-list density="compact">
                        <v-list-item value="Edit">
                            <v-list-item-title @click="dialog = true">Modifier</v-list-item-title>
                            <v-list-item-title @click="copy(rider?.id)">Copier</v-list-item-title>
                        </v-list-item>                        
                    </v-list>
                </v-menu>
            </RouterLink>
            <v-dialog v-model="dialog" max-width="500">
              <v-card>
                <v-card-text class="mb-4" >
                  <h4 class="text-h6 mb-5">{{ rider.name }}</h4>
                  <v-checkbox label="Capitaine ?" v-model="rider.isCapitain" hide-details></v-checkbox>
                  <v-checkbox label="Directeur Sportif ?" v-model="rider.isDS" hide-details></v-checkbox>
                  <v-btn color="primary" variant="flat" @click="save" >Sauvegarder</v-btn>
                  <v-btn  variant="flat" @click="cancel">Annuler</v-btn>
                </v-card-text>
              </v-card>
            </v-dialog>
        </div>
        <!-- IF SUBTEXT -->
        <div class="d-flex align-center justify-space-between px-4">
          <div class="body-text-1 text-dark pl-2">{{ rider?.zp1Yr3AvgMaxWkg1200 }} w/kg</div>          
          <div class="body-text-1 text-dark pl-2">{{ rider?.zp1Yr3AvgMaxW1200 }} w </div>
        </div>
        <div class="d-flex align-center justify-space-between px-4 py-1">
          <div class="body-text-1 text-dark pl-2">
            {{ rider?.preferredTime12h00 === 'de_preference' ? '🟢' :
           rider?.preferredTime12h00 === 'possible' ? '🟡' : '🔴' }} 
           {{ rider?.preferredTime18h30 === 'de_preference' ? '🟢' :
           rider?.preferredTime18h30 === 'possible' ? '🟡' : '🔴' }} 
           {{ rider?.preferredTime19h30 === 'de_preference' ? '🟢' :
           rider?.preferredTime19h30 === 'possible' ? '🟡' : '🔴' }} 
          </div>          
          <div class="body-text-1 text-dark pl-1">
            {{ rider?.preferredTeam === 'high' ? '⬆️' : '⬇️' }}
            {{ rider?.canBeMentor === 'true' ? '💘' : '' }} 
            {{ rider?.needMentor === 'true' ? '👐' : '' }} 
            
          </div>
        </div>
    </v-card>
</template>
