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

function assigmentCatBgColor(category) {
  if (category === 'catA') {
    return 'success';
  } else if (category === 'cat_b') {
    return 'primary';
  } else if (category === 'Remplacant') {
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
            <h5 class="text-subtitle-2 font-weight-semibold pr-4 cursor-move">{{ rider?.name }} {{ rider?.isCapitain ? '(Capt)' : '' }}</h5>
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
                  <v-checkbox label="Capitaine?" v-model="rider.isCapitain" value="rider.isCapitain" hide-details></v-checkbox>
                  <v-btn color="primary" variant="flat" @click="save" >Sauvegarder</v-btn>
                  <v-btn  variant="flat" @click="cancel">Annuler</v-btn>
                </v-card-text>
              </v-card>
            </v-dialog>
        </div>
        <!-- IF SUBTEXT -->
        <p v-if="rider?.othersTeamPlayerNames" class="text-subtitle-2 px-4 text-medium-emphasis">{{ rider?.othersTeamPlayerNames }}</p>

        <div class="d-flex align-center justify-space-between px-4 py-3">
          <div v-for="catPreference in rider?.catPreferences">
            <div :class="'rounded-sm body-text-1 px-1 py-0 bg-' + assigmentCatBgColor(catPreference)" size="small">
              {{ catPreference }}
            </div>
          </div>
          <div class="body-text-1 text-dark pl-2">{{ rider?.nbAvailability }}j</div>
          
          <div class="body-text-1 text-dark pl-2">{{ rider?.zpProfileCP20Watts }} w {{ rider?.vElo }}</div>
        </div>
    </v-card>
</template>
