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

function assigmentDisponibilities(preferedTime6h00, preferedTime7h00, preferedTime8h00,
  preferedTime12h00, preferedTime18h30, preferedTime19h30) {
 
    let disponibilites = '';
    if (preferedTime6h00 === 'de_preference') {
      disponibilites += '6h00 ';
    } else if (preferedTime6h00 === 'possible') {
      disponibilites += '6h00p ';
    }
    if (preferedTime7h00 === 'de_preference') {
      disponibilites += '7h00 ';
    } else if (preferedTime7h00 === 'possible') {
      disponibilites += '7h00p ';
    }
    if (preferedTime8h00 === 'de_preference') {
      disponibilites += '8h00 ';
    } else if (preferedTime8h00 === 'possible') {
      disponibilites += '8h00p ';
    }
    if (preferedTime12h00 === 'de_preference') {
      disponibilites += 'midi ';
    } else if (preferedTime8h00 === 'possible') {
      disponibilites += 'midip ';
    }
    if (preferedTime18h30 === 'de_preference') {
      disponibilites += '18h30 ';
    } else if (preferedTime18h30 === 'possible') {
      disponibilites += '18h30p ';
    }
    if (preferedTime19h30 === 'de_preference') {
      disponibilites += '19h30 ';
    } else if (preferedTime19h30 === 'possible') {
      disponibilites += '19h30p ';
    }
    return disponibilites;

}

function assigmentCatBgColor(category: any) {
  if (category === 'catA' || category === 'cat_a') {
    return 'success';
  } else if (category === 'cat_b' || category === 'cat_b_and_cat_a') {
    return 'primary';
  } else if (category === 'cat_c' || category === 'cat_c_and_cat_b') {
    return 'warning';
  }
  return 'primary';
}

function cat(catName: any) {
  if (catName === 'catA' || catName === 'cat_a') {
    return 'catA';
  } else if (catName === 'cat_b') {
    return 'catB';
  } else if (catName === 'cat_c') {
    return 'catC';
  } else if (catName === 'cat_b_and_cat_a') {
    return 'catB+A';
  } else if (catName === 'cat_c_and_cat_b') {
    return 'catC+B';
  }
  return ''
}

function ds(preference) {
  if (preference === 'medium') {
    return 'DS';
  } else if (preference === 'a_lot') {
    return 'DS+';
  }
  return ''
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
                  <v-checkbox label="Capitaine?" v-model="rider.isCapitain" hide-details></v-checkbox>
                  <v-btn color="primary" variant="flat" @click="save" >Sauvegarder</v-btn>
                  <v-btn  variant="flat" @click="cancel">Annuler</v-btn>
                </v-card-text>
              </v-card>
            </v-dialog>
        </div>
        <!-- IF SUBTEXT -->
        <p v-if="rider?.othersTeamPlayerNames" class="text-subtitle-2 px-4 text-medium-emphasis">{{ rider?.othersTeamPlayerNames }}</p>

        <div class="d-flex align-center justify-space-between px-4 py-3">{{ rider?.zpProfileCat }}
          <div v-for="catPreference in rider?.catPreferences">
            <div :class="'rounded-sm body-text-1 px-1 py-0 bg-' + assigmentCatBgColor(catPreference)" size="small">
              {{ cat(catPreference) }}
            </div>
          </div>
          <div :class="'rounded-sm body-text-1 px-1 py-0 bg-' + assigmentCatBgColor(rider?.catPreference)" size="small" v-if="rider?.catPreference">
            {{ cat(rider?.catPreference) }}
          </div>
          <div :class="'rounded-sm body-text-1 px-1 py-0'" size="small">
            {{ ds(rider?.dsInterest) }}
          </div>
          <div class="body-text-1 text-dark pl-2">{{ rider?.nbAvailability }}j</div>          
          <div class="body-text-1 text-dark pl-2">{{ rider?.zpProfileCP20Watts }}w {{ rider?.zpProfileCP20WattKg }}w/kg {{ rider?.vElo }}</div>
        </div>
        <div class="d-flex align-center justify-space-between px-4 py-3">
          {{ assigmentDisponibilities(
            rider.preferedTime6h00,
            rider.preferedTime7h00,
           rider.preferedTime8h00,
          rider.preferedTime12h00,
          rider.preferedTime18h30,
          rider.preferedTime19h30
          ) }}
        </div>        
    </v-card>
</template>
