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

function assigmentBgColor(assigment) {
  if (assigment === 'Coureur') {
    return 'success';
  } else if (assigment === 'DS') {
    return 'primary';
  } else if (assigment === 'Remplacant') {
    return 'warning';
  }
  return 'primary';
}
</script>

<template>
    <!-- ---------------------------------------------------- -->
    <!-- Table Basic -->
    <!-- ---------------------------------------------------- -->
    <v-card elevation="10" class="mb-5">
        <div class="d-flex align-center justify-space-between px-4 py-2 pr-3">
            <h5 class="text-subtitle-2 font-weight-semibold pr-4 cursor-move">{{ rider?.name }}</h5>
            <RouterLink to="" class="px-0">
                <DotsVerticalIcon size="15" />

                <v-menu activator="parent">
                    <v-list density="compact">
                        <v-list-item value="Edit">
                            <v-list-item-title @click="dialog = true">Modifier</v-list-item-title>
                        </v-list-item>                        
                    </v-list>
                </v-menu>
            </RouterLink>
            <v-dialog v-model="dialog" max-width="500">
              <v-card>
                <v-card-text class="mb-4" >
                  <h4 class="text-h6 mb-5">{{ rider.name }}</h4>
                  <v-select label="Status" v-model="rider.assignment" variant="outlined"
                      :items="['Coureur', 'DS', 'Remplacant']"></v-select>                        
                  <v-btn color="primary" variant="flat" @click="save" >Sauvegarder</v-btn>
                  <v-btn  variant="flat" @click="cancel">Annuler</v-btn>
                </v-card-text>
              </v-card>
            </v-dialog>
        </div>
        <!-- IF SUBTEXT -->
        <p v-if="rider?.dsPreference" class="text-subtitle-2 px-4 text-medium-emphasis">DS de préférence</p>
        <p v-if="rider?.dsIfRequired" class="text-subtitle-2 px-4 text-medium-emphasis">DS si nécessaire</p>

        <div class="d-flex align-center justify-space-between px-4 py-3">
          <div :class="'rounded-sm body-text-1 px-1 py-0 bg-' + assigmentBgColor(rider?.assignment)" size="small">
            {{ rider?.assignment }}
          </div>
          <div class="body-text-1 text-dark pl-2">{{ rider?.availability }}
          </div>
        </div>
    </v-card>
</template>
